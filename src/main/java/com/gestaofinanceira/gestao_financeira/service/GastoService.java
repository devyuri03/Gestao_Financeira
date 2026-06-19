package com.gestaofinanceira.gestao_financeira.service;

import com.gestaofinanceira.gestao_financeira.dto.GastoRequestDTO;
import com.gestaofinanceira.gestao_financeira.dto.GastoResponseDTO;
import com.gestaofinanceira.gestao_financeira.model.Conta;
import com.gestaofinanceira.gestao_financeira.model.Gasto;
import com.gestaofinanceira.gestao_financeira.model.User;
import com.gestaofinanceira.gestao_financeira.repository.ContaRepository;
import com.gestaofinanceira.gestao_financeira.repository.GastoRepository;
import com.gestaofinanceira.gestao_financeira.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class GastoService {

    private final GastoRepository gastoRepository;
    private final UserRepository userRepository;
    private final ContaRepository contaRepository;

    public GastoService(GastoRepository gastoRepository, UserRepository userRepository, ContaRepository contaRepository) {
        this.gastoRepository = gastoRepository;
        this.userRepository = userRepository;
        this.contaRepository = contaRepository;
    }

    public List<GastoResponseDTO> listar(String email) {
        return gastoRepository.findByUsuarioEmail(email)
                .stream()
                .map(this::toDTO)
                .toList();
    }

    public GastoResponseDTO buscarPorId(Long id, String email) {
        Gasto gasto = gastoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Gasto não encontrado com o ID: " + id));
        if (!gasto.getUsuario().getEmail().equals(email)) {
            throw new SecurityException("Acesso negado");
        }
        return toDTO(gasto);
    }

    public GastoResponseDTO salvar(GastoRequestDTO dto, String email) {
        User usuario = userRepository.findById(email)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado: " + email));

        Gasto gasto = new Gasto();
        gasto.setValor(dto.getValor());
        gasto.setDescricao(dto.getDescricao());
        gasto.setData(dto.getData());
        gasto.setTipoLancamento(dto.getTipoLancamento());
        gasto.setStatusLancamento(dto.getStatusLancamento());
        gasto.setCategoriaLancamento(dto.getCategoriaLancamento());
        gasto.setPagamentoLancamento(dto.getPagamentoLancamento());
        gasto.setUsuario(usuario);
        gasto.setConta(resolverConta(dto.getContaId(), email));

        return toDTO(gastoRepository.save(gasto));
    }

    public void deletar(Long id, String email) {
        Gasto gasto = gastoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Gasto não encontrado: " + id));
        if (!gasto.getUsuario().getEmail().equals(email)) {
            throw new SecurityException("Acesso negado");
        }
        gastoRepository.deleteById(id);
    }

    public GastoResponseDTO atualizarGasto(Long id, GastoRequestDTO dto, String email) {
        Gasto gasto = gastoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Gasto não encontrado: " + id));
        if (!gasto.getUsuario().getEmail().equals(email)) {
            throw new SecurityException("Acesso negado");
        }
        gasto.setValor(dto.getValor());
        gasto.setDescricao(dto.getDescricao());
        gasto.setData(dto.getData());
        gasto.setTipoLancamento(dto.getTipoLancamento());
        gasto.setStatusLancamento(dto.getStatusLancamento());
        gasto.setCategoriaLancamento(dto.getCategoriaLancamento());
        gasto.setPagamentoLancamento(dto.getPagamentoLancamento());
        gasto.setConta(resolverConta(dto.getContaId(), email));
        return toDTO(gastoRepository.save(gasto));
    }

    private Conta resolverConta(Long contaId, String email) {
        if (contaId == null) return null;
        Conta conta = contaRepository.findById(contaId)
                .orElseThrow(() -> new RuntimeException("Conta não encontrada: " + contaId));
        if (!conta.getUsuario().getEmail().equals(email)) {
            throw new SecurityException("Conta não pertence ao usuário");
        }
        return conta;
    }

    private GastoResponseDTO toDTO(Gasto gasto) {
        return new GastoResponseDTO(
                gasto.getId(),
                gasto.getValor(),
                gasto.getDescricao(),
                gasto.getData(),
                gasto.getTipoLancamento(),
                gasto.getStatusLancamento(),
                gasto.getCategoriaLancamento(),
                gasto.getPagamentoLancamento(),
                gasto.getUsuario().getEmail(),
                gasto.getConta() != null ? gasto.getConta().getId() : null,
                gasto.getConta() != null ? gasto.getConta().getNome() : null
        );
    }
}
