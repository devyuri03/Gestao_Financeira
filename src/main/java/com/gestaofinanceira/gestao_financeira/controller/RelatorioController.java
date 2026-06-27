package com.gestaofinanceira.gestao_financeira.controller;

import com.gestaofinanceira.gestao_financeira.dto.RelatorioMensalDTO;
import com.gestaofinanceira.gestao_financeira.service.RelatorioService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/relatorio")
public class RelatorioController {

    private final RelatorioService relatorioService;

    public RelatorioController(RelatorioService relatorioService) {
        this.relatorioService = relatorioService;
    }

    @GetMapping
    public ResponseEntity<RelatorioMensalDTO> relatorioMensal(
            @RequestParam int mes,
            @RequestParam int ano,
            Authentication authentication) {
        return ResponseEntity.ok(relatorioService.buscarRelatorioMensal(authentication.getName(), mes, ano));
    }
}
