package com.example.accounts;

import static org.junit.jupiter.api.Assertions.assertEquals;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;

import org.junit.jupiter.api.Test;

class InMemoryAccountRepositoryTest {

    @Test
    void seededVanguardAccountHasAnOutdatedStatement() {
        InMemoryAccountRepository repository = new InMemoryAccountRepository();
        Clock fixedClock = Clock.fixed(
                Instant.parse("2026-08-26T00:00:00Z"), ZoneOffset.UTC);
        StatementStatusCalculator calculator = new StatementStatusCalculator(fixedClock);

        ClientAccount vanguard = repository.findAccountByProviderId("vanguard").orElseThrow();

        assertEquals(StatementStatus.OUTDATED, calculator.calculate(vanguard.statement()));
    }
}
