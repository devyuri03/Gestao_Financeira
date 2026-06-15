package com.gestaofinanceira.gestao_financeira.dto;

import com.gestaofinanceira.gestao_financeira.enums.CategoriaLancamento;
import com.gestaofinanceira.gestao_financeira.enums.PagamentoLancamento;
import com.gestaofinanceira.gestao_financeira.enums.StatusLancamento;
import com.gestaofinanceira.gestao_financeira.enums.TipoLancamento;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class GastoRequestDTO {
    private BigDecimal valor;
    private String descricao;
    private LocalDate data;
    private TipoLancamento tipoLancamento;
    private StatusLancamento statusLancamento;
    private CategoriaLancamento categoriaLancamento;
    private PagamentoLancamento pagamentoLancamento;
    private Long contaId;
}
