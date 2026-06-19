package com.gestaofinanceira.gestao_financeira.service;

import com.gestaofinanceira.gestao_financeira.dto.*;
import com.gestaofinanceira.gestao_financeira.enums.TipoLancamento;
import com.gestaofinanceira.gestao_financeira.model.Gasto;
import com.gestaofinanceira.gestao_financeira.repository.GastoRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;

@Service
public class DashboardService {

    private final GastoRepository gastoRepository;
    private final ContaService contaService;

    public DashboardService(GastoRepository gastoRepository, ContaService contaService) {
        this.gastoRepository = gastoRepository;
        this.contaService = contaService;
    }

    public DashboardResponseDTO calcular(String email) {
        LocalDate hoje = LocalDate.now();
        LocalDate inicioMes = hoje.withDayOfMonth(1);
        LocalDate fimMes = hoje.withDayOfMonth(hoje.lengthOfMonth());

        List<ContaResponseDTO> contas = contaService.listar(email);
        BigDecimal saldoTotal = contas.stream()
                .map(ContaResponseDTO::getSaldoAtual)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal receitasMes = gastoRepository.somarPorTipoEPeriodo(email, TipoLancamento.RECEITA, inicioMes, fimMes);
        BigDecimal despesasMes = gastoRepository.somarPorTipoEPeriodo(email, TipoLancamento.DESPESA, inicioMes, fimMes);
        BigDecimal resultadoMes = receitasMes.subtract(despesasMes);

        long pendentes = gastoRepository.contarPendentes(email);

        List<GastoResponseDTO> recentes = gastoRepository
                .findTop5ByUsuarioEmailOrderByDataDesc(email)
                .stream()
                .map(this::toDTO)
                .toList();

        List<Object[]> rows = gastoRepository.somarDespesasPorCategoriaEPeriodo(email, inicioMes, fimMes);
        List<GastoCategoriaDTO> categorias = rows.stream()
                .map(row -> {
                    BigDecimal total = (BigDecimal) row[1];
                    double pct = despesasMes.compareTo(BigDecimal.ZERO) > 0
                            ? total.multiply(BigDecimal.valueOf(100))
                                   .divide(despesasMes, 1, RoundingMode.HALF_UP)
                                   .doubleValue()
                            : 0.0;
                    return new GastoCategoriaDTO(row[0].toString(), total, pct);
                })
                .toList();

        return new DashboardResponseDTO(saldoTotal, receitasMes, despesasMes, resultadoMes, pendentes, recentes, categorias, contas);
    }

    private GastoResponseDTO toDTO(Gasto g) {
        return new GastoResponseDTO(
                g.getId(), g.getValor(), g.getDescricao(), g.getData(),
                g.getTipoLancamento(), g.getStatusLancamento(),
                g.getCategoriaLancamento(), g.getPagamentoLancamento(),
                g.getUsuario().getEmail(),
                g.getConta() != null ? g.getConta().getId() : null,
                g.getConta() != null ? g.getConta().getNome() : null
        );
    }
}
