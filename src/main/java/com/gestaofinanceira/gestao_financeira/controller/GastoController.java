package com.gestaofinanceira.gestao_financeira.controller;

import com.gestaofinanceira.gestao_financeira.dto.GastoRequestDTO;
import com.gestaofinanceira.gestao_financeira.dto.GastoResponseDTO;
import com.gestaofinanceira.gestao_financeira.service.GastoService;
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
    public ResponseEntity<GastoResponseDTO> buscarPorId(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(gastoService.buscarPorId(id));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    public ResponseEntity<GastoResponseDTO> salvar(@RequestBody GastoRequestDTO
                                                               dto, Authentication authentication) {
        GastoResponseDTO salvo = gastoService.salvar(dto, authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(salvo);
    }

    @PutMapping("/{id}")
    public ResponseEntity<GastoResponseDTO> atualizar(@PathVariable Long id, @RequestBody GastoRequestDTO dto, Authentication authentication) {
        try {
            return ResponseEntity.ok(gastoService.atualizarGasto(id, dto, authentication.getName()));
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id, Authentication authentication) {
        try {
            gastoService.deletar(id, authentication.getName());
            return ResponseEntity.noContent().build();
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
