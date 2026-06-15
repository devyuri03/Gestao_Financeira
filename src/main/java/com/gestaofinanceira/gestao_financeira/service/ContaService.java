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

import java.math.BigDecimal;
import java.util.List;

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
        return contaRepository.findByUsuarioEmail(email)
                .stream()
                .map(this::toDTO)
                .toList();
    }

    public ContaResponseDTO buscarPorId(Long id, String email) {
        Conta conta = contaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Conta não encontrada com o ID: " + id));
        if (!conta.getUsuario().getEmail().equals(email)) {
            throw new SecurityException("Acesso negado");
        }
        return toDTO(conta);
    }

    public ContaResponseDTO salvar(ContaRequestDTO dto, String email) {
        User usuario = userRepository.findById(email)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado: " + email));

        Conta conta = new Conta();
        conta.setNome(dto.getNome());
        conta.setSaldo(dto.getSaldo());
        conta.setLimite(dto.getLimite());
        conta.setTipoConta(dto.getTipoConta());
        conta.setUsuario(usuario);

        return toDTO(contaRepository.save(conta));
    }

    public ContaResponseDTO atualizar(Long id, ContaRequestDTO dto, String email) {
        Conta conta = contaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Conta não encontrada: " + id));
        if (!conta.getUsuario().getEmail().equals(email)) {
            throw new SecurityException("Acesso negado");
        }
        conta.setNome(dto.getNome());
        conta.setSaldo(dto.getSaldo());
        conta.setLimite(dto.getLimite());
        conta.setTipoConta(dto.getTipoConta());
        return toDTO(contaRepository.save(conta));
    }

    public void deletar(Long id, String email) {
        Conta conta = contaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Conta não encontrada: " + id));
        if (!conta.getUsuario().getEmail().equals(email)) {
            throw new SecurityException("Acesso negado");
        }
        contaRepository.deleteById(id);
    }

    private ContaResponseDTO toDTO(Conta conta) {
        BigDecimal entradas = gastoRepository.somarPorContaETipo(conta.getId(), TipoLancamento.RECEITA);
        BigDecimal saidas   = gastoRepository.somarPorContaETipo(conta.getId(), TipoLancamento.DESPESA);

        BigDecimal saldoAtual;
        if (conta.getTipoConta() == TipoConta.CARTAO_CREDITO) {
            // Para cartão: saldo disponível = limite - fatura (saídas)
            BigDecimal limite = conta.getLimite() != null
                    ? BigDecimal.valueOf(conta.getLimite())
                    : BigDecimal.ZERO;
            saldoAtual = limite.subtract(saidas);
        } else {
            // Para demais: saldo inicial + entradas - saídas
            saldoAtual = BigDecimal.valueOf(conta.getSaldo()).add(entradas).subtract(saidas);
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
