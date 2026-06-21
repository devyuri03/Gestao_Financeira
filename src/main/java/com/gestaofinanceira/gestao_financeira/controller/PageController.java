package com.gestaofinanceira.gestao_financeira.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class PageController {

    @GetMapping("/")
    public String root() {
        return "redirect:/login";
    }

    @GetMapping("/login")
    public String login() {
        return "login";
    }

    @GetMapping("/registro")
    public String registro() {
        return "registro";
    }

    @GetMapping("/dashboard")
    public String dashboard() {
        return "dashboard";
    }

    @GetMapping("/contas")
    public String contas() {
        return "contas";
    }

    @GetMapping("/lancamento")
    public String lancamento() {
        return "lancamento";
    }

    @GetMapping("/fluxo")
    public String fluxo() {
        return "fluxo";
    }
}
