package com.gestaofinanceira.gestao_financeira.dto;

import com.gestaofinanceira.gestao_financeira.enums.TipoConta;
import lombok.Data;

@Data
public class ContaRequestDTO {
    private String nome;
    private double saldo;
    private Double limite;
    private TipoConta tipoConta;
}
