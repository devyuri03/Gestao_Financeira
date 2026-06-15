package com.gestaofinanceira.gestao_financeira.service;

import com.gestaofinanceira.gestao_financeira.dto.FluxoCaixaMesDTO;
import com.gestaofinanceira.gestao_financeira.enums.StatusLancamento;
import com.gestaofinanceira.gestao_financeira.enums.TipoLancamento;
import com.gestaofinanceira.gestao_financeira.model.Gasto;
import com.gestaofinanceira.gestao_financeira.repository.ContaRepository;
import com.gestaofinanceira.gestao_financeira.repository.GastoRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class FluxoCaixaService {

    private final GastoRepository gastoRepository;
    private final ContaRepository contaRepository;

    public FluxoCaixaService(GastoRepository gastoRepository, ContaRepository contaRepository) {
        this.gastoRepository = gastoRepository;
        this.contaRepository = contaRepository;
    }

    public List<FluxoCaixaMesDTO> calcular(String email) {
        // Saldo base = soma dos saldos iniciais de todas as contas
        BigDecimal saldoBase = contaRepository.findByUsuarioEmail(email)
                .stream()
                .map(c -> BigDecimal.valueOf(c.getSaldo()))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Gastos ativos (exclui cancelados)
        List<Gasto> gastos = gastoRepository.findByUsuarioEmail(email)
                .stream()
                .filter(g -> g.getStatusLancamento() != StatusLancamento.CANCELADO)
                .toList();

        if (gastos.isEmpty()) return List.of();

        // Agrupa por mês/ano
        Map<YearMonth, List<Gasto>> porMes = gastos.stream()
                .collect(Collectors.groupingBy(g -> YearMonth.from(g.getData())));

        List<YearMonth> meses = porMes.keySet().stream().sorted().toList();

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMMM yyyy", new Locale("pt", "BR"));

        BigDecimal saldoCorrente = saldoBase;
        List<FluxoCaixaMesDTO> resultado = new ArrayList<>();

        for (YearMonth mes : meses) {
            List<Gasto> doMes = porMes.get(mes);

            BigDecimal receitas = doMes.stream()
                    .filter(g -> g.getTipoLancamento() == TipoLancamento.RECEITA)
                    .map(Gasto::getValor)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            BigDecimal despesas = doMes.stream()
                    .filter(g -> g.getTipoLancamento() == TipoLancamento.DESPESA)
                    .map(Gasto::getValor)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            BigDecimal resultadoMes = receitas.subtract(despesas);
            BigDecimal saldoFinal   = saldoCorrente.add(resultadoMes);

            String nomeMes = mes.format(formatter);
            nomeMes = Character.toUpperCase(nomeMes.charAt(0)) + nomeMes.substring(1);

            resultado.add(new FluxoCaixaMesDTO(
                    nomeMes,
                    saldoCorrente,
                    receitas,
                    despesas,
                    resultadoMes,
                    saldoFinal
            ));

            saldoCorrente = saldoFinal;
        }

        return resultado;
    }
}
