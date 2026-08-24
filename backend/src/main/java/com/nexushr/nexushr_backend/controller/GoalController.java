package com.nexushr.nexushr_backend.controller;

import com.nexushr.nexushr_backend.dto.GoalRequestDTO;
import com.nexushr.nexushr_backend.entity.Goal;
import com.nexushr.nexushr_backend.service.GoalService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/goals")
public class GoalController {

    @Autowired
    private GoalService service;

    @GetMapping
    public List<Goal> getAll() {
        return service.getAll();
    }

    @PostMapping
    public Goal save(@Valid @RequestBody GoalRequestDTO request) {
        return service.save(toEntity(request));
    }

    private Goal toEntity(GoalRequestDTO request) {
        Goal goal = new Goal();
        goal.setEmployeeId(request.employeeId());
        goal.setGoalTitle(request.goalTitle());
        goal.setDescription(request.description());
        goal.setDeadline(request.deadline());
        goal.setStatus(request.status());
        return goal;
    }
}
