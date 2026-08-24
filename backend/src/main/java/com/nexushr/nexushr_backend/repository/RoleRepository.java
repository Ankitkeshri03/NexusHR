package com.nexushr.nexushr_backend.repository;

import com.nexushr.nexushr_backend.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RoleRepository extends JpaRepository<Role, Integer>
{
    boolean existsByRoleName(String roleName);

    Optional<Role> findByRoleName(String roleName);
}