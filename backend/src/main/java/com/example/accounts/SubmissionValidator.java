package com.example.accounts;

import java.util.List;

import org.springframework.stereotype.Component;

@Component
public class SubmissionValidator {

    private final InMemoryAccountRepository repository;
    private final StatementStatusCalculator statusCalculator;

    public SubmissionValidator(
            InMemoryAccountRepository repository,
            StatementStatusCalculator statusCalculator) {
        this.repository = repository;
        this.statusCalculator = statusCalculator;
    }

    public List<SubmissionIssue> findIssues() {
        return repository.findAllAccounts().stream()
                .map(account -> new SubmissionIssue(
                        account.providerId(),
                        repository.findProviderById(account.providerId())
                                .map(Provider::name)
                                .orElse(account.providerId()),
                        statusCalculator.calculate(account.statement())))
                .filter(issue -> issue.status() != StatementStatus.UPLOADED)
                .toList();
    }

    public void validate() {
        List<SubmissionIssue> issues = findIssues();
        if (repository.findAllAccounts().isEmpty() || !issues.isEmpty()) {
            throw new IncompleteSubmissionException(issues);
        }
    }
}
