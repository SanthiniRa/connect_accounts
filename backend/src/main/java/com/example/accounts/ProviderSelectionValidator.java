package com.example.accounts;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.springframework.stereotype.Component;

@Component
public class ProviderSelectionValidator {

    private final InMemoryAccountRepository repository;

    public ProviderSelectionValidator(InMemoryAccountRepository repository) {
        this.repository = repository;
    }

    public void validate(List<String> providerIds) {
        if (providerIds == null || providerIds.isEmpty()) {
            throw new IllegalArgumentException("At least one provider is required.");
        }

        Set<String> requestedIds = new HashSet<>();
        for (String providerId : providerIds) {
            if (providerId == null || providerId.isBlank()) {
                throw new IllegalArgumentException("Provider IDs must not be blank.");
            }
            if (!requestedIds.add(providerId)) {
                throw new IllegalArgumentException("Provider is listed more than once: " + providerId);
            }
            if (repository.findProviderById(providerId).isEmpty()) {
                throw new IllegalArgumentException("Unknown provider: " + providerId);
            }
            if (repository.accountExists(providerId)) {
                throw new IllegalArgumentException("Provider is already added: " + providerId);
            }
        }
    }
}
