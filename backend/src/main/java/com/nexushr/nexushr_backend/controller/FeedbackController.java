package com.nexushr.nexushr_backend.controller;

import com.nexushr.nexushr_backend.dto.FeedbackRequestDTO;
import com.nexushr.nexushr_backend.entity.Feedback;
import com.nexushr.nexushr_backend.service.FeedbackService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/feedback")
public class FeedbackController {

    @Autowired
    private FeedbackService service;

    @GetMapping
    public List<Feedback> getAll() {
        return service.getAll();
    }

    @PostMapping
    public Feedback save(@Valid @RequestBody FeedbackRequestDTO request) {
        return service.save(toEntity(request));
    }

    private Feedback toEntity(FeedbackRequestDTO request) {
        Feedback feedback = new Feedback();
        feedback.setEmployeeId(request.employeeId());
        feedback.setFeedbackFrom(request.feedbackFrom());
        feedback.setComments(request.comments());
        feedback.setRating(request.rating());
        return feedback;
    }
}
