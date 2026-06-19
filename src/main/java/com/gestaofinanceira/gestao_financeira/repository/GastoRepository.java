package com.gestaofinanceira.gestao_financeira.repository;

import com.gestaofinanceira.gestao_financeira.enums.TipoLancamento;
import com.gestaofinanceira.gestao_financeira.model.Gasto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public interface GastoRepository extends JpaRepository<Gasto, Long> {

    List<Gasto> findByUsuarioEmail(String email);

    List<Gasto> findTop5ByUsuarioEmailOrderByDataDesc(String email);

    @Query("SELECT COALESCE(SUM(g.valor), 0) FROM Gasto g WHERE g.conta.id = :contaId AND g.tipoLancamento = :tipo AND g.statusLancamento != com.gestaofinanceira.gestao_financeira.enums.StatusLancamento.CANCELADO")
    BigDecimal somarPorContaETipo(@Param("contaId") Long contaId, @Param("tipo") TipoLancamento tipo);

    @Query("SELECT g.conta.id, g.tipoLancamento, COALESCE(SUM(g.valor), 0) FROM Gasto g WHERE g.conta.id IN :contaIds AND g.statusLancamento != com.gestaofinanceira.gestao_financeira.enums.StatusLancamento.CANCELADO GROUP BY g.conta.id, g.tipoLancamento")
    List<Object[]> somarPorContasETipoAgrupado(@Param("contaIds") List<Long> contaIds);

    @Query("SELECT COALESCE(SUM(g.valor), 0) FROM Gasto g WHERE g.usuario.email = :email AND g.tipoLancamento = :tipo AND g.statusLancamento != com.gestaofinanceira.gestao_financeira.enums.StatusLancamento.CANCELADO AND g.data BETWEEN :inicio AND :fim")
    BigDecimal somarPorTipoEPeriodo(@Param("email") String email, @Param("tipo") TipoLancamento tipo, @Param("inicio") LocalDate inicio, @Param("fim") LocalDate fim);

    @Query("SELECT g.categoriaLancamento, COALESCE(SUM(g.valor), 0) FROM Gasto g WHERE g.usuario.email = :email AND g.tipoLancamento = com.gestaofinanceira.gestao_financeira.enums.TipoLancamento.DESPESA AND g.statusLancamento != com.gestaofinanceira.gestao_financeira.enums.StatusLancamento.CANCELADO AND g.data BETWEEN :inicio AND :fim GROUP BY g.categoriaLancamento ORDER BY SUM(g.valor) DESC")
    List<Object[]> somarDespesasPorCategoriaEPeriodo(@Param("email") String email, @Param("inicio") LocalDate inicio, @Param("fim") LocalDate fim);

    @Query("SELECT COUNT(g) FROM Gasto g WHERE g.usuario.email = :email AND g.statusLancamento = com.gestaofinanceira.gestao_financeira.enums.StatusLancamento.PENDENTE")
    long contarPendentes(@Param("email") String email);

    @Modifying
    @Query("UPDATE Gasto g SET g.conta = null WHERE g.conta.id = :contaId")
    void desvinculiarDaConta(@Param("contaId") Long contaId);
}
