package com.gestaofinanceira.gestao_financeira.service;

import com.gestaofinanceira.gestao_financeira.dto.FluxoCaixaMesDTO;
import com.gestaofinanceira.gestao_financeira.enums.StatusLancamento;
import com.gestaofinanceira.gestao_financeira.enums.TipoLancamento;
import com.gestaofinanceira.gestao_financeira.model.Conta;
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
        BigDecimal saldoBase = contaRepository.findByUsuarioEmail(email)
                .stream()
                .map(Conta::getSaldo)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<Gasto> gastos = gastoRepository.findByUsuarioEmail(email)
                .stream()
                .filter(g -> g.getStatusLancamento() != StatusLancamento.CANCELADO)
                .toList();

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMMM yyyy", Locale.of("pt", "BR"));

        if (gastos.isEmpty()) {
            if (saldoBase.compareTo(BigDecimal.ZERO) == 0) return List.of();
            String nomeMes = formatarNomeMes(YearMonth.now(), formatter);
            return List.of(new FluxoCaixaMesDTO(
                    nomeMes, saldoBase, BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO, saldoBase));
        }

        Map<YearMonth, List<Gasto>> porMes = gastos.stream()
                .collect(Collectors.groupingBy(g -> YearMonth.from(g.getData())));

        List<YearMonth> meses = porMes.keySet().stream().sorted().toList();

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

            resultado.add(new FluxoCaixaMesDTO(
                    formatarNomeMes(mes, formatter),
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

    private String formatarNomeMes(YearMonth mes, DateTimeFormatter formatter) {
        String nome = mes.format(formatter);
        return Character.toUpperCase(nome.charAt(0)) + nome.substring(1);
    }
}
