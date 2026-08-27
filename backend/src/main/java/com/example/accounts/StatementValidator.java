package com.example.accounts;

import java.time.Clock;
import java.time.LocalDate;

import org.springframework.stereotype.Component;

@Component
public class StatementValidator {

    private final Clock clock;

    public StatementValidator(Clock clock) {
        this.clock = clock;
    }

    public void validate(Statement statement) {
        if (statement == null) {
            throw new IllegalArgumentException("Statement is required.");
        }
        if (statement.fileName() == null || statement.fileName().isBlank()) {
            throw new IllegalArgumentException("Statement filename must not be blank.");
        }
        if (statement.statementDate() == null) {
            throw new IllegalArgumentException("Statement date is required.");
        }
        if (statement.statementDate().isAfter(LocalDate.now(clock))) {
            throw new IllegalArgumentException("Statement date cannot be in the future.");
        }
    }
}
