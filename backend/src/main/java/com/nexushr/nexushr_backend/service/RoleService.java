package com.nexushr.nexushr_backend.service;

import com.nexushr.nexushr_backend.entity.Role;
import com.nexushr.nexushr_backend.repository.RoleRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class RoleService {

    private final RoleRepository roleRepository;

    public RoleService(RoleRepository roleRepository)
    {
        this.roleRepository = roleRepository;
    }

    public Role CreateRole(Role role)
    {
        if (roleRepository.existsByRoleName(role.getRoleName()))
        {
            throw new RuntimeException("Role already exists");
        }
        return roleRepository.save(role);
    }

    public List<Role> GetAllRoles()
    {
        return roleRepository.findAll();
    }

    public Optional<Role> GetRoleById(Integer id)
    {
        return roleRepository.findById(id);
    }

    public Role UpdateRole(Integer id, Role updatedRole)
    {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Role not found"));

        role.setRoleName(updatedRole.getRoleName());
        role.setDescription(updatedRole.getDescription());

        return roleRepository.save(role);
    }

    public void DeleteRole(Integer id)
    {
        roleRepository.deleteById(id);
    }

    public Role getRoleByName(String roleName) {
        return roleRepository.findByRoleName(roleName)
                .orElseThrow(() -> new RuntimeException("Role not found"));
    }
}