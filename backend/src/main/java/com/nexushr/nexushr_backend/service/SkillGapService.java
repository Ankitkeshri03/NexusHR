package com.nexushr.nexushr_backend.service;

import com.nexushr.nexushr_backend.entity.SkillGap;
import com.nexushr.nexushr_backend.repository.EmployeeRepository;
import com.nexushr.nexushr_backend.repository.SkillGapRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class SkillGapService {

    private static final Set<String> ALLOWED_GAP_LEVELS = Set.of("LOW", "MEDIUM", "HIGH");

    private final SkillGapRepository repository;
    private final EmployeeRepository employeeRepository;

    public List<SkillGap> getAll() {
        return repository.findAll();
    }

    public SkillGap save(SkillGap skillGap) {
        skillGap.setId(null);
        ServiceValidationUtils.validateEmployeeExists(employeeRepository, skillGap.getEmployeeId());
        normalizeSkillGap(skillGap);
        return repository.save(skillGap);
    }

    public void delete(Long id) {
        ServiceValidationUtils.validateRequiredId("Skill gap id", id);
        SkillGap skillGap = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Skill gap not found with id " + id
                ));
        repository.delete(skillGap);
    }

    private void normalizeSkillGap(SkillGap skillGap) {
        skillGap.setCurrentSkill(
                ServiceValidationUtils.normalizeRequiredText(skillGap.getCurrentSkill(), "Current skill")
        );
        skillGap.setRequiredSkill(
                ServiceValidationUtils.normalizeRequiredText(skillGap.getRequiredSkill(), "Required skill")
        );
        if (skillGap.getCurrentSkill().equalsIgnoreCase(skillGap.getRequiredSkill())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Required skill must be different from current skill"
            );
        }
        skillGap.setGapLevel(ServiceValidationUtils.normalizeAllowedValue(
                skillGap.getGapLevel(),
                "Gap level",
                ALLOWED_GAP_LEVELS
        ));
    }
}
