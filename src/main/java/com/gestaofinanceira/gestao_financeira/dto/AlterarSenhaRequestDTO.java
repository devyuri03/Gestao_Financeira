package com.gestaofinanceira.gestao_financeira.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class AlterarSenhaRequestDTO {

    @NotBlank(message = "A senha atual é obrigatória")
    private String senhaAtual;

    @NotBlank(message = "A nova senha é obrigatória")
    @Size(min = 6, message = "A nova senha deve ter no mínimo 6 caracteres")
    private String senhaNova;
}
