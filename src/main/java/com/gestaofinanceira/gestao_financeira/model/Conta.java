package com.gestaofinanceira.gestao_financeira.model;

import com.gestaofinanceira.gestao_financeira.enums.TipoConta;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.math.BigDecimal;

@Entity
@Data
@Table(name = "Conta")
@NoArgsConstructor
@AllArgsConstructor

public class Conta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column
    private String nome;

    @Column(nullable = false)
    private BigDecimal saldo;

    @Column
    private Double limite;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoConta tipoConta;

    @ToString.Exclude
    @ManyToOne
    @JoinColumn(name = "usuario_email", nullable = false)
    private User usuario;

}
