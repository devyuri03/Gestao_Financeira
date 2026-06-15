package com.gestaofinanceira.gestao_financeira.model;

import com.gestaofinanceira.gestao_financeira.enums.TipoConta;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


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
    private double saldo;

    @Column
    private Double limite;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoConta tipoConta;

    @ManyToOne
    @JoinColumn(name = "usuario_email", nullable = false)
    private User usuario;

}
