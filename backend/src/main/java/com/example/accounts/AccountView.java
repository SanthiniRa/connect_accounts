package com.example.accounts;

public record AccountView(
        String providerId,
        String providerName,
        Statement statement,
        StatementStatus status) {
}
