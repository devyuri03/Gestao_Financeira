package com.gestaofinanceira.gestao_financeira.dto;

import com.gestaofinanceira.gestao_financeira.enums.CategoriaLancamento;
import com.gestaofinanceira.gestao_financeira.enums.PagamentoLancamento;
import com.gestaofinanceira.gestao_financeira.enums.StatusLancamento;
import com.gestaofinanceira.gestao_financeira.enums.TipoLancamento;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class GastoRequestDTO {

    @NotNull
    @Positive
    private BigDecimal valor;

    private String descricao;

    @NotNull
    private LocalDate data;

    @NotNull
    private TipoLancamento tipoLancamento;

    @NotNull
    private StatusLancamento statusLancamento;

    @NotNull
    private CategoriaLancamento categoriaLancamento;

    @NotNull
    private PagamentoLancamento pagamentoLancamento;

    private Long contaId;
}
