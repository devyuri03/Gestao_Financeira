package com.gestaofinanceira.gestao_financeira.service;

import com.gestaofinanceira.gestao_financeira.model.Gasto;
import com.gestaofinanceira.gestao_financeira.model.User;
import com.gestaofinanceira.gestao_financeira.repository.GastoRepository;
import com.gestaofinanceira.gestao_financeira.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class GastoService {

    private final GastoRepository gastoRepository;
    private final UserRepository userRepository;

    public GastoService(GastoRepository gastoRepository, UserRepository userRepository) {
        this.gastoRepository = gastoRepository;
        this.userRepository = userRepository;
    }

    public List<Gasto> listar(String email){
        return gastoRepository.findByUsuarioEmail(email);
    }

    public Gasto salvar(Gasto gastoRecebido, String email){
        User usuario = userRepository.findById(email)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado: " + email));
        gastoRecebido.setUsuario(usuario);
        return gastoRepository.save(gastoRecebido);
    }

    public void deletar(Long id, String email){
        Gasto gasto = gastoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Gasto não encontrado: " + id));
        if (!gasto.getUsuario().getEmail().equals(email)) {
            throw new SecurityException("Acesso negado");
        }
        gastoRepository.deleteById(id);
    }

    public Gasto buscarPorId(Long id) {
        return gastoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Gasto não encontrado com o ID: " + id));
    }

    public Gasto atualizarGasto(Long id, Gasto gastoAtualizado, String email){
        Gasto gasto = gastoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Gasto não encontrado: " + id));
        if (!gasto.getUsuario().getEmail().equals(email)) {
            throw new SecurityException("Acesso negado");
        }
        gasto.setValor(gastoAtualizado.getValor());
        gasto.setDescricao(gastoAtualizado.getDescricao());
        gasto.setTipoLancamento(gastoAtualizado.getTipoLancamento());
        gasto.setCategoriaLancamento(gastoAtualizado.getCategoriaLancamento());
        gasto.setStatusLancamento(gastoAtualizado.getStatusLancamento());
        gasto.setPagamentoLancamento(gastoAtualizado.getPagamentoLancamento());
        gasto.setData(gastoAtualizado.getData());
        return gastoRepository.save(gasto);
    }

}
