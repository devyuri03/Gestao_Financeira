package com.gestaofinanceira.gestao_financeira.controller;

import com.gestaofinanceira.gestao_financeira.dto.RegistroRequestDTO;
import com.gestaofinanceira.gestao_financeira.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/usuarios")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/registro")
    public ResponseEntity<String> registrar(@Valid @RequestBody RegistroRequestDTO dto) {
        try {
            userService.salvarUsuario(dto);
            return ResponseEntity.ok("Usuário registrado com sucesso!");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        }
    }

    @GetMapping("/me")
    public ResponseEntity<Map<String, String>> me(Authentication authentication) {
        return ResponseEntity.ok(Map.of("email", authentication.getName()));
    }
}
