package com.gestaofinanceira.gestao_financeira.repository;

import com.gestaofinanceira.gestao_financeira.enums.TipoLancamento;
import com.gestaofinanceira.gestao_financeira.model.Gasto;
import com.gestaofinanceira.gestao_financeira.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;

public interface GastoRepository extends JpaRepository<Gasto, Long> {

    List<Gasto> findByUsuario(User usuario);
    List<Gasto> findByUsuarioEmail(String email);

    @Query("SELECT COALESCE(SUM(g.valor), 0) FROM Gasto g WHERE g.conta.id = :contaId AND g.tipoLancamento = :tipo")
    BigDecimal somarPorContaETipo(@Param("contaId") Long contaId, @Param("tipo") TipoLancamento tipo);
}
