package com.gestaofinanceira.gestao_financeira.service;

import com.gestaofinanceira.gestao_financeira.dto.RegistroRequestDTO;
import com.gestaofinanceira.gestao_financeira.model.User;
import com.gestaofinanceira.gestao_financeira.repository.UserRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;

@Service
public class UserService implements UserDetailsService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findById(email)
                .orElseThrow(() -> new UsernameNotFoundException("Usuário não encontrado: " + email));

        return new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getSenha(),
                new ArrayList<>()
        );
    }

    public void salvarUsuario(RegistroRequestDTO dto) {
        if (userRepository.existsById(dto.getEmail())) {
            throw new RuntimeException("E-mail já cadastrado");
        }
        User user = new User();
        user.setEmail(dto.getEmail());
        user.setSenha(passwordEncoder.encode(dto.getSenha()));
        userRepository.save(user);
    }
}
