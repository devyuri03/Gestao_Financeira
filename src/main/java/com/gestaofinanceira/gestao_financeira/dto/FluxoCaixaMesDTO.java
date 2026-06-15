package com.gestaofinanceira.gestao_financeira.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
public class FluxoCaixaMesDTO {
    private String mes;
    private BigDecimal saldoInicial;
    private BigDecimal receitasPrevistas;
    private BigDecimal despesasPrevistas;
    private BigDecimal resultadoPrevisto;
    private BigDecimal saldoFinalProjetado;
}
