package com.gestaofinanceira.gestao_financeira.controller;

import com.gestaofinanceira.gestao_financeira.model.Gasto;
import com.gestaofinanceira.gestao_financeira.service.GastoService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/gastos")
@CrossOrigin(origins = "*") // Permite que aplicações front-end (React, Angular, etc.) acessem a API
public class GastoController {

    private final GastoService gastoService;

    // Injeção de dependência por construtor do Service
    public GastoController(GastoService gastoService) {
        this.gastoService = gastoService;
    }

    // 1. LISTAR TODOS OS GASTOS
    // Endpoint: GET http://localhost:8080/api/gastos
    @GetMapping
    public ResponseEntity<List<Gasto>> listarTodos() {
        List<Gasto> gastos = gastoService.listar();
        return ResponseEntity.ok(gastos); // Retorna Status 200 OK com a lista
    }

    // 2. BUSCAR GASTO POR ID
    // Endpoint: GET http://localhost:8080/api/gastos/{id}
    @GetMapping("/{id}")
    public ResponseEntity<Gasto> buscarPorId(@PathVariable Long id) {
        try {
            Gasto gasto = gastoService.buscarPorId(id);
            return ResponseEntity.ok(gasto);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build(); // Retorna Status 404 Not Found se não existir
        }
    }

    // 3. SALVAR UM NOVO GASTO
    // Endpoint: POST http://localhost:8080/api/gastos
    @PostMapping
    public ResponseEntity<Gasto> salvar(@RequestBody Gasto gastoRecebido) {
        Gasto gastoSalvo = gastoService.salvar(gastoRecebido);
        // Retorna Status 201 Created com o objeto já com o ID gerado pelo banco
        return ResponseEntity.status(HttpStatus.CREATED).body(gastoSalvo);
    }

    // 4. DELETAR UM GASTO
    // Endpoint: DELETE http://localhost:8080/api/gastos/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        try {
            gastoService.deletar(id);
            return ResponseEntity.noContent().build(); // Retorna Status 204 No Content (Deletado com sucesso)
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build(); // Retorna Status 404 se tentar deletar algo que não existe
        }
    }
}