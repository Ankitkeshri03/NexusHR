package com.nexushr.nexushr_backend.service;

import com.nexushr.nexushr_backend.entity.Goal;
import com.nexushr.nexushr_backend.repository.EmployeeRepository;
import com.nexushr.nexushr_backend.repository.GoalRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class GoalService {

    private final GoalRepository repository;
    private final EmployeeRepository employeeRepository;

    public List<Goal> getAll() {
        return repository.findAll();
    }

    public Goal save(Goal goal) {
        goal.setId(null);
        ServiceValidationUtils.validateEmployeeExists(employeeRepository, goal.getEmployeeId());
        normalizeGoal(goal);
        return repository.save(goal);
    }

    private void normalizeGoal(Goal goal) {
        goal.setGoalTitle(ServiceValidationUtils.normalizeRequiredText(goal.getGoalTitle(), "Goal title"));
        goal.setDescription(ServiceValidationUtils.normalizeOptionalText(goal.getDescription()));
        goal.setDeadline(ServiceValidationUtils.normalizeOptionalText(goal.getDeadline()));
        ServiceValidationUtils.validateIsoDate("Deadline", goal.getDeadline());
        goal.setStatus(ServiceValidationUtils.normalizeUppercaseOptional(goal.getStatus()));
    }
}
