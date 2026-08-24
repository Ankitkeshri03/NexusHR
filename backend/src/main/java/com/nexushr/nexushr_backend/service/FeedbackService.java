package com.nexushr.nexushr_backend.service;

import com.nexushr.nexushr_backend.entity.Feedback;
import com.nexushr.nexushr_backend.repository.EmployeeRepository;
import com.nexushr.nexushr_backend.repository.FeedbackRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FeedbackService {

    private final FeedbackRepository repository;
    private final EmployeeRepository employeeRepository;

    public List<Feedback> getAll() {
        return repository.findAll();
    }

    public Feedback save(Feedback feedback) {
        feedback.setId(null);
        ServiceValidationUtils.validateEmployeeExists(employeeRepository, feedback.getEmployeeId());
        normalizeFeedback(feedback);
        return repository.save(feedback);
    }

    private void normalizeFeedback(Feedback feedback) {
        feedback.setFeedbackFrom(
                ServiceValidationUtils.normalizeRequiredText(feedback.getFeedbackFrom(), "Feedback source")
        );
        feedback.setComments(ServiceValidationUtils.normalizeRequiredText(feedback.getComments(), "Comments"));
        if (feedback.getRating() == null || feedback.getRating() < 1 || feedback.getRating() > 5) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Rating must be between 1 and 5");
        }
    }
}
