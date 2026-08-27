package com.example.accounts;

import java.util.List;

public class IncompleteSubmissionException extends RuntimeException {

    private final List<SubmissionIssue> issues;

    public IncompleteSubmissionException(List<SubmissionIssue> issues) {
        super("All accounts need a current statement before submission.");
        this.issues = List.copyOf(issues);
    }

    public List<SubmissionIssue> issues() {
        return issues;
    }
}
