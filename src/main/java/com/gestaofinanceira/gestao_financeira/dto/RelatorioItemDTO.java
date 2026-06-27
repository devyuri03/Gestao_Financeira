package com.gestaofinanceira.gestao_financeira.dto;

import com.gestaofinanceira.gestao_financeira.enums.CategoriaLancamento;
import com.gestaofinanceira.gestao_financeira.enums.PagamentoLancamento;
import com.gestaofinanceira.gestao_financeira.enums.StatusLancamento;
import com.gestaofinanceira.gestao_financeira.enums.TipoLancamento;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@AllArgsConstructor
public class RelatorioItemDTO {
    private Long id;
    private LocalDate data;
    private String descricao;
    private TipoLancamento tipo;
    private CategoriaLancamento categoria;
    private PagamentoLancamento formaPagamento;
    private String conta;
    private BigDecimal valor;
    private StatusLancamento status;
}
