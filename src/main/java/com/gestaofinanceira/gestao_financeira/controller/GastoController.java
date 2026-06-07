package com.gestaofinanceira.gestao_financeira.controller;

import com.gestaofinanceira.gestao_financeira.model.Gasto;
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
    public ResponseEntity<List<Gasto>> listarUsuario(Authentication authentication) {
        List<Gasto> gastos = gastoService.listar(authentication.getName());
        return ResponseEntity.ok(gastos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Gasto> buscarPorId(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(gastoService.buscarPorId(id));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    public ResponseEntity<Gasto> salvar(@RequestBody Gasto gastoRecebido, Authentication authentication) {
        Gasto gastoSalvo = gastoService.salvar(gastoRecebido, authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(gastoSalvo);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Gasto> atualizar(@PathVariable Long id, @RequestBody Gasto gastoAtualizado, Authentication authentication) {
        try {
            Gasto gasto = gastoService.atualizarGasto(id, gastoAtualizado, authentication.getName());
            return ResponseEntity.ok(gasto);
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
