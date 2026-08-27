package com.example.accounts;

import java.util.List;

import org.springframework.stereotype.Component;

@Component
public class AccountReadinessCalculator {

    private final StatementStatusCalculator statusCalculator;

    public AccountReadinessCalculator(StatementStatusCalculator statusCalculator) {
        this.statusCalculator = statusCalculator;
    }

    public ReadinessSummary calculate(List<ClientAccount> accounts) {
        int total = accounts.size();
        int readyCount = (int) accounts.stream()
                .filter(account -> statusCalculator.calculate(account.statement()) == StatementStatus.UPLOADED)
                .count();
        int needsAttention = total - readyCount;
        boolean canSubmit = total > 0 && needsAttention == 0;
        return new ReadinessSummary(total, readyCount, needsAttention, canSubmit);
    }
}
