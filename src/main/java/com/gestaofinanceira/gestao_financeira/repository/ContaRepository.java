package com.gestaofinanceira.gestao_financeira.repository;

import com.gestaofinanceira.gestao_financeira.model.Conta;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ContaRepository extends JpaRepository<Conta, Long> {
    List<Conta> findByUsuarioEmail(String email);
}
