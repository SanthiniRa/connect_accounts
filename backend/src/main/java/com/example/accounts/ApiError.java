package com.example.accounts;

import java.util.List;

public record ApiError(String code, String message, List<SubmissionIssue> issues) {

    public ApiError(String code, String message) {
        this(code, message, List.of());
    }
}
