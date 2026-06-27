package com.gestaofinanceira.gestao_financeira.service;

import com.gestaofinanceira.gestao_financeira.dto.RelatorioItemDTO;
import com.gestaofinanceira.gestao_financeira.dto.RelatorioMensalDTO;
import com.gestaofinanceira.gestao_financeira.enums.TipoLancamento;
import com.gestaofinanceira.gestao_financeira.model.Gasto;
import com.gestaofinanceira.gestao_financeira.repository.GastoRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;

@Service
public class RelatorioService {

    private final GastoRepository gastoRepository;

    public RelatorioService(GastoRepository gastoRepository) {
        this.gastoRepository = gastoRepository;
    }

    public RelatorioMensalDTO buscarRelatorioMensal(String email, int mes, int ano) {
        YearMonth yearMonth = YearMonth.of(ano, mes);
        LocalDate inicio = yearMonth.atDay(1);
        LocalDate fim = yearMonth.atEndOfMonth();

        List<Gasto> gastos = gastoRepository.findByUsuarioEmailAndDataBetweenOrderByDataAsc(email, inicio, fim);

        BigDecimal totalReceitas = gastos.stream()
                .filter(g -> g.getTipoLancamento() == TipoLancamento.RECEITA)
                .map(Gasto::getValor)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalDespesas = gastos.stream()
                .filter(g -> g.getTipoLancamento() == TipoLancamento.DESPESA)
                .map(Gasto::getValor)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal resultado = totalReceitas.subtract(totalDespesas);

        List<RelatorioItemDTO> itens = gastos.stream()
                .map(g -> new RelatorioItemDTO(
                        g.getId(),
                        g.getData(),
                        g.getDescricao(),
                        g.getTipoLancamento(),
                        g.getCategoriaLancamento(),
                        g.getPagamentoLancamento(),
                        g.getConta() != null ? g.getConta().getNome() : null,
                        g.getValor(),
                        g.getStatusLancamento()
                ))
                .toList();

        String nomeMes = formatarNomeMes(yearMonth);

        return new RelatorioMensalDTO(mes, ano, nomeMes, totalReceitas, totalDespesas, resultado, gastos.size(), itens);
    }

    private String formatarNomeMes(YearMonth yearMonth) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMMM yyyy", Locale.of("pt", "BR"));
        String nome = yearMonth.format(formatter);
        return Character.toUpperCase(nome.charAt(0)) + nome.substring(1);
    }
}
