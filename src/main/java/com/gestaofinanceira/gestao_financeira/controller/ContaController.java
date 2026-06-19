package com.gestaofinanceira.gestao_financeira.controller;

import com.gestaofinanceira.gestao_financeira.dto.ContaRequestDTO;
import com.gestaofinanceira.gestao_financeira.dto.ContaResponseDTO;
import com.gestaofinanceira.gestao_financeira.service.ContaService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/contas")
public class ContaController {

    private final ContaService contaService;

    public ContaController(ContaService contaService) {
        this.contaService = contaService;
    }

    @GetMapping
    public ResponseEntity<List<ContaResponseDTO>> listar(Authentication authentication) {
        return ResponseEntity.ok(contaService.listar(authentication.getName()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ContaResponseDTO> buscarPorId(@PathVariable Long id, Authentication authentication) {
        try {
            return ResponseEntity.ok(contaService.buscarPorId(id, authentication.getName()));
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    public ResponseEntity<ContaResponseDTO> salvar(@Valid @RequestBody ContaRequestDTO dto, Authentication authentication) {
        ContaResponseDTO salvo = contaService.salvar(dto, authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(salvo);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ContaResponseDTO> atualizar(@PathVariable Long id, @Valid @RequestBody ContaRequestDTO dto, Authentication authentication) {
        try {
            return ResponseEntity.ok(contaService.atualizar(id, dto, authentication.getName()));
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id, Authentication authentication) {
        try {
            contaService.deletar(id, authentication.getName());
            return ResponseEntity.noContent().build();
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
