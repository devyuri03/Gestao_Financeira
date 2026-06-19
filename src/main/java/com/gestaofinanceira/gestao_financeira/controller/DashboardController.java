package com.gestaofinanceira.gestao_financeira.controller;

import com.gestaofinanceira.gestao_financeira.dto.DashboardResponseDTO;
import com.gestaofinanceira.gestao_financeira.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping
    public ResponseEntity<DashboardResponseDTO> get(Authentication authentication) {
        return ResponseEntity.ok(dashboardService.calcular(authentication.getName()));
    }
}
