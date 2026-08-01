package com.gestaofinanceira.gestao_financeira.controller;

import com.gestaofinanceira.gestao_financeira.dto.GastoRequestDTO;
import com.gestaofinanceira.gestao_financeira.dto.GastoResponseDTO;
import com.gestaofinanceira.gestao_financeira.service.GastoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/gastos")
public class GastoController {

    private final GastoService gastoService;

    public GastoController(GastoService gastoService) {
        this.gastoService = gastoService;
    }

    @GetMapping
    public ResponseEntity<List<GastoResponseDTO>> listarUsuario(Authentication authentication) {
        return ResponseEntity.ok(gastoService.listar(authentication.getName()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<GastoResponseDTO> buscarPorId(@PathVariable Long id, Authentication authentication) {
        return ResponseEntity.ok(gastoService.buscarPorId(id, authentication.getName()));
    }

    @PostMapping
    public ResponseEntity<GastoResponseDTO> salvar(@Valid @RequestBody GastoRequestDTO dto, Authentication authentication) {
        GastoResponseDTO salvo = gastoService.salvar(dto, authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(salvo);
    }

    @PutMapping("/{id}")
    public ResponseEntity<GastoResponseDTO> atualizar(@PathVariable Long id, @Valid @RequestBody GastoRequestDTO dto, Authentication authentication) {
        return ResponseEntity.ok(gastoService.atualizarGasto(id, dto, authentication.getName()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id, Authentication authentication) {
        gastoService.deletar(id, authentication.getName());
        return ResponseEntity.noContent().build();
    }
}
