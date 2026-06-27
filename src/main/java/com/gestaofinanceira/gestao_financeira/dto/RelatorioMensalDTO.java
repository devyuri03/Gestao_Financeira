package com.gestaofinanceira.gestao_financeira.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
@AllArgsConstructor
public class RelatorioMensalDTO {
    private int mes;
    private int ano;
    private String nomeMes;
    private BigDecimal totalReceitas;
    private BigDecimal totalDespesas;
    private BigDecimal resultado;
    private int quantidadeLancamentos;
    private List<RelatorioItemDTO> itens;
}
