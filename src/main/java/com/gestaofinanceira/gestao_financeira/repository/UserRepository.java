package com.gestaofinanceira.gestao_financeira.repository;


import com.gestaofinanceira.gestao_financeira.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, String> {
}
