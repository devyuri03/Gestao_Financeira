package com.gestaofinanceira.gestao_financeira.dto;

import com.gestaofinanceira.gestao_financeira.enums.TipoConta;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class ContaRequestDTO {

    @NotBlank
    private String nome;

    @NotNull
    @PositiveOrZero
    private BigDecimal saldo;

    @PositiveOrZero
    private Double limite;

    @NotNull
    private TipoConta tipoConta;
}
