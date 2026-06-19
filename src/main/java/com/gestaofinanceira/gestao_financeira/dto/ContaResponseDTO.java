package com.gestaofinanceira.gestao_financeira.dto;

import com.gestaofinanceira.gestao_financeira.enums.TipoConta;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
public class ContaResponseDTO {
    private Long id;
    private String nome;
    private BigDecimal saldo;
    private Double limite;
    private TipoConta tipoConta;
    private String usuarioEmail;
    private BigDecimal totalEntradas;
    private BigDecimal totalSaidas;
    private BigDecimal saldoAtual;
}
