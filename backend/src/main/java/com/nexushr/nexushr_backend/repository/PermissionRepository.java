package com.nexushr.nexushr_backend.repository;

import com.nexushr.nexushr_backend.entity.Permission;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PermissionRepository extends JpaRepository<Permission, Integer>
{

    Optional<Permission> findByPermissionName(String permissionName);
}