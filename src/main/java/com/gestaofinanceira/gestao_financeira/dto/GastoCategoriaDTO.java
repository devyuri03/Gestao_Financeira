package com.gestaofinanceira.gestao_financeira.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
public class GastoCategoriaDTO {
    private String categoria;
    private BigDecimal total;
    private double percentual;
}
