package com.gestaofinanceira.gestao_financeira.model;

import com.gestaofinanceira.gestao_financeira.enums.CategoriaLancamento;
import com.gestaofinanceira.gestao_financeira.enums.StatusLancamento;
import com.gestaofinanceira.gestao_financeira.enums.TipoLancamento;
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

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoLancamento tipoLancamento;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatusLancamento statusLancamento;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CategoriaLancamento categoriaLancamento;

    @ManyToOne
    @JoinColumn(name = "usuario_email", nullable = false)
    private User usuario;


}
