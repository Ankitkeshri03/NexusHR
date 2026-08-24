package com.nexushr.nexushr_backend.controller;

import com.nexushr.nexushr_backend.dto.PermissionRequestDTO;
import com.nexushr.nexushr_backend.entity.Permission;
import com.nexushr.nexushr_backend.service.PermissionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/permissions")
@RequiredArgsConstructor
public class PermissionController {

    private final PermissionService permissionService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Permission Create(@Valid @RequestBody PermissionRequestDTO request) {
        return permissionService.CreatePermission(toEntity(request));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<Permission> GetAll() {
        return permissionService.GetAllPermissions();
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Permission update(@PathVariable Integer id, @Valid @RequestBody PermissionRequestDTO request) {
        return permissionService.updatePermission(id, toEntity(request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public String delete(@PathVariable Integer id) {
        permissionService.deletePermission(id);
        return "Permission deleted successfully";
    }

    private Permission toEntity(PermissionRequestDTO request) {
        Permission permission = new Permission();
        permission.setPermissionName(request.permissionName());
        permission.setDescription(request.description());
        return permission;
    }
}
