package com.gestaofinanceira.gestao_financeira.repository;

import com.gestaofinanceira.gestao_financeira.model.Gasto;
import com.gestaofinanceira.gestao_financeira.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface GastoRepository extends JpaRepository<Gasto, Long> {

    List<Gasto> findByUsuario(User usuario);
    List<Gasto> findByUsuarioEmail(String email);
}
