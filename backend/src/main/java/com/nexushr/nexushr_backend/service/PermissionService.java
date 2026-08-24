package com.nexushr.nexushr_backend.service;

import com.nexushr.nexushr_backend.entity.Permission;
import com.nexushr.nexushr_backend.repository.PermissionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class PermissionService {

    private final PermissionRepository permissionRepository;

    public Permission CreatePermission(Permission permission)
    {
        normalizePermission(permission);
        permissionRepository.findByPermissionName(permission.getPermissionName())
                .ifPresent(existing -> {
                    throw new ResponseStatusException(HttpStatus.CONFLICT, "Permission already exists");
                });
        return permissionRepository.save(permission);
    }

    public List<Permission> GetAllPermissions()
    {
        return permissionRepository.findAll();
    }

    public Permission updatePermission(Integer id, Permission updatedPermission) {
        Permission existing = permissionRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Permission not found"));

        normalizePermission(updatedPermission);
        permissionRepository.findByPermissionName(updatedPermission.getPermissionName())
                .filter(permission -> !permission.getId().equals(id))
                .ifPresent(permission -> {
                    throw new ResponseStatusException(HttpStatus.CONFLICT, "Permission already exists");
                });

        existing.setPermissionName(updatedPermission.getPermissionName());
        existing.setDescription(updatedPermission.getDescription());
        return permissionRepository.save(existing);
    }

    public void deletePermission(Integer id) {
        Permission existing = permissionRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Permission not found"));
        permissionRepository.delete(existing);
    }

    private void normalizePermission(Permission permission) {
        if (permission.getPermissionName() == null || permission.getPermissionName().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Permission name is required");
        }

        permission.setPermissionName(permission.getPermissionName().trim().toUpperCase(Locale.ROOT));
        if (permission.getDescription() != null) {
            permission.setDescription(permission.getDescription().trim());
        }
    }
}
