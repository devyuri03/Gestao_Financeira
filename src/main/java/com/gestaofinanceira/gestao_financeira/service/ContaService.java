package com.gestaofinanceira.gestao_financeira.service;

import com.gestaofinanceira.gestao_financeira.dto.ContaRequestDTO;
import com.gestaofinanceira.gestao_financeira.dto.ContaResponseDTO;
import com.gestaofinanceira.gestao_financeira.enums.TipoConta;
import com.gestaofinanceira.gestao_financeira.enums.TipoLancamento;
import com.gestaofinanceira.gestao_financeira.model.Conta;
import com.gestaofinanceira.gestao_financeira.model.User;
import com.gestaofinanceira.gestao_financeira.repository.ContaRepository;
import com.gestaofinanceira.gestao_financeira.repository.GastoRepository;
import com.gestaofinanceira.gestao_financeira.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ContaService {

    private final ContaRepository contaRepository;
    private final UserRepository userRepository;
    private final GastoRepository gastoRepository;

    public ContaService(ContaRepository contaRepository, UserRepository userRepository, GastoRepository gastoRepository) {
        this.contaRepository = contaRepository;
        this.userRepository = userRepository;
        this.gastoRepository = gastoRepository;
    }

    public List<ContaResponseDTO> listar(String email) {
        List<Conta> contas = contaRepository.findByUsuarioEmail(email);
        if (contas.isEmpty()) return List.of();

        List<Long> ids = contas.stream().map(Conta::getId).toList();

        Map<Long, BigDecimal> entradas = new HashMap<>();
        Map<Long, BigDecimal> saidas = new HashMap<>();
        for (Object[] row : gastoRepository.somarPorContasETipoAgrupado(ids)) {
            Long contaId = (Long) row[0];
            TipoLancamento tipo = (TipoLancamento) row[1];
            BigDecimal valor = (BigDecimal) row[2];
            if (tipo == TipoLancamento.RECEITA) entradas.put(contaId, valor);
            else if (tipo == TipoLancamento.DESPESA) saidas.put(contaId, valor);
        }

        return contas.stream()
                .map(c -> toDTO(c,
                        entradas.getOrDefault(c.getId(), BigDecimal.ZERO),
                        saidas.getOrDefault(c.getId(), BigDecimal.ZERO)))
                .toList();
    }

    public ContaResponseDTO buscarPorId(Long id, String email) {
        Conta conta = contaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Conta não encontrada com o ID: " + id));
        if (!conta.getUsuario().getEmail().equals(email)) {
            throw new SecurityException("Acesso negado");
        }
        BigDecimal entradas = gastoRepository.somarPorContaETipo(id, TipoLancamento.RECEITA);
        BigDecimal saidas   = gastoRepository.somarPorContaETipo(id, TipoLancamento.DESPESA);
        return toDTO(conta, entradas, saidas);
    }

    public ContaResponseDTO salvar(ContaRequestDTO dto, String email) {
        validarConta(dto);
        User usuario = userRepository.findById(email)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado: " + email));

        Conta conta = new Conta();
        conta.setNome(dto.getNome());
        conta.setSaldo(dto.getSaldo());
        conta.setLimite(dto.getLimite());
        conta.setTipoConta(dto.getTipoConta());
        conta.setUsuario(usuario);

        return toDTO(contaRepository.save(conta), BigDecimal.ZERO, BigDecimal.ZERO);
    }

    public ContaResponseDTO atualizar(Long id, ContaRequestDTO dto, String email) {
        validarConta(dto);
        Conta conta = contaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Conta não encontrada: " + id));
        if (!conta.getUsuario().getEmail().equals(email)) {
            throw new SecurityException("Acesso negado");
        }
        conta.setNome(dto.getNome());
        conta.setSaldo(dto.getSaldo());
        conta.setLimite(dto.getLimite());
        conta.setTipoConta(dto.getTipoConta());
        Conta atualizada = contaRepository.save(conta);
        BigDecimal entradas = gastoRepository.somarPorContaETipo(id, TipoLancamento.RECEITA);
        BigDecimal saidas   = gastoRepository.somarPorContaETipo(id, TipoLancamento.DESPESA);
        return toDTO(atualizada, entradas, saidas);
    }

    @Transactional
    public void deletar(Long id, String email) {
        Conta conta = contaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Conta não encontrada: " + id));
        if (!conta.getUsuario().getEmail().equals(email)) {
            throw new SecurityException("Acesso negado");
        }
        gastoRepository.desvinculiarDaConta(id);
        contaRepository.deleteById(id);
    }

    private void validarConta(ContaRequestDTO dto) {
        if (dto.getTipoConta() == TipoConta.CARTAO_CREDITO && dto.getLimite() == null) {
            throw new IllegalArgumentException("Cartão de crédito requer o campo 'limite'");
        }
    }

    private ContaResponseDTO toDTO(Conta conta, BigDecimal entradas, BigDecimal saidas) {
        BigDecimal saldoAtual;
        if (conta.getTipoConta() == TipoConta.CARTAO_CREDITO) {
            BigDecimal limite = conta.getLimite() != null
                    ? BigDecimal.valueOf(conta.getLimite())
                    : BigDecimal.ZERO;
            saldoAtual = limite.subtract(saidas);
        } else {
            saldoAtual = conta.getSaldo().add(entradas).subtract(saidas);
        }

        return new ContaResponseDTO(
                conta.getId(),
                conta.getNome(),
                conta.getSaldo(),
                conta.getLimite(),
                conta.getTipoConta(),
                conta.getUsuario().getEmail(),
                entradas,
                saidas,
                saldoAtual
        );
    }
}
