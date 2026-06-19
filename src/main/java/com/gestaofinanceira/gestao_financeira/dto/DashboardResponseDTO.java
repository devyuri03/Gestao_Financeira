package com.gestaofinanceira.gestao_financeira.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
@AllArgsConstructor
public class DashboardResponseDTO {
    private BigDecimal saldoTotal;
    private BigDecimal receitasMes;
    private BigDecimal despesasMes;
    private BigDecimal resultadoMes;
    private long lancamentosPendentes;
    private List<GastoResponseDTO> lancamentosRecentes;
    private List<GastoCategoriaDTO> despesasPorCategoria;
    private List<ContaResponseDTO> contas;
}
