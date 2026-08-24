package com.nexushr.nexushr_backend.controller;

import com.nexushr.nexushr_backend.dto.SkillGapRequestDTO;
import com.nexushr.nexushr_backend.entity.SkillGap;
import com.nexushr.nexushr_backend.service.SkillGapService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/skill-gap")
@CrossOrigin("*")
public class SkillGapController {

    @Autowired
    private SkillGapService service;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<SkillGap> getAll() {
        return service.getAll();
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public SkillGap create(@Valid @RequestBody SkillGapRequestDTO request) {
        return service.save(toEntity(request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }

    private SkillGap toEntity(SkillGapRequestDTO request) {
        SkillGap skillGap = new SkillGap();
        skillGap.setEmployeeId(request.employeeId());
        skillGap.setCurrentSkill(request.currentSkill());
        skillGap.setRequiredSkill(request.requiredSkill());
        skillGap.setGapLevel(request.gapLevel());
        return skillGap;
    }
}
