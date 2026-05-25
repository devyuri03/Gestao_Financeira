package com.gestaofinanceira.gestao_financeira.service;

import com.gestaofinanceira.gestao_financeira.model.Gasto;
import com.gestaofinanceira.gestao_financeira.repository.GastoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class GastoService {

    private final GastoRepository gastoRepository;

    public GastoService(GastoRepository gastoRepository) {
        this.gastoRepository = gastoRepository;
    }

    public List<Gasto> listar(){
        return gastoRepository.findAll();
    }

    public Gasto salvar(Gasto gastoRecebido){
        return gastoRepository.save(gastoRecebido);
    }

    public void deletar(Long id){
        gastoRepository.deleteById(id);
    }

    public Gasto buscarPorId(Long id) {
        return gastoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Gasto não encontrado com o ID: " + id));
    }

}
