package com.gestaofinanceira.gestao_financeira.controller;

import com.gestaofinanceira.gestao_financeira.dto.FluxoCaixaMesDTO;
import com.gestaofinanceira.gestao_financeira.service.FluxoCaixaService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/fluxo-caixa")
public class FluxoCaixaController {

    private final FluxoCaixaService fluxoCaixaService;

    public FluxoCaixaController(FluxoCaixaService fluxoCaixaService) {
        this.fluxoCaixaService = fluxoCaixaService;
    }

    @GetMapping
    public ResponseEntity<List<FluxoCaixaMesDTO>> calcular(Authentication authentication) {
        return ResponseEntity.ok(fluxoCaixaService.calcular(authentication.getName()));
    }
}
