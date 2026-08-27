package com.example.accounts;

import org.springframework.stereotype.Component;

@Component
public class AccountRemovalValidator {

    private final InMemoryAccountRepository repository;

    public AccountRemovalValidator(InMemoryAccountRepository repository) {
        this.repository = repository;
    }

    public void validate(String providerId) {
        if (providerId == null || providerId.isBlank()) {
            throw new IllegalArgumentException("Provider ID must not be blank.");
        }
        if (!repository.accountExists(providerId)) {
            throw new IllegalArgumentException("Provider is not added: " + providerId);
        }
    }
}
