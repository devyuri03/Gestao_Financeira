package com.gestaofinanceira.gestao_financeira.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Data
@Table(name = "gastos")
@NoArgsConstructor
@AllArgsConstructor
public class Gasto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private BigDecimal valor;

    @Column
    private String descricao;

    @Column(nullable = false)
    private LocalDate data;

    @ManyToOne
    @JoinColumn(name = "usuario_email", nullable = false)
    private User usuario;


}
