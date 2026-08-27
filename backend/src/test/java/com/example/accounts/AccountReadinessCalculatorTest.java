package com.example.accounts;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.List;

import org.junit.jupiter.api.Test;

class AccountReadinessCalculatorTest {

    private final Clock fixedClock = Clock.fixed(
            Instant.parse("2026-08-26T00:00:00Z"), ZoneOffset.UTC);
    private final StatementStatusCalculator statusCalculator = new StatementStatusCalculator(fixedClock);
    private final AccountReadinessCalculator calculator = new AccountReadinessCalculator(statusCalculator);

    @Test
    void countsOnlyCurrentStatementsAndBlocksIncompleteSubmission() {
        List<ClientAccount> accounts = List.of(
                new ClientAccount("current", new Statement("current.pdf", LocalDate.of(2026, 8, 1))),
                new ClientAccount("missing", null),
                new ClientAccount("old", new Statement("old.pdf", LocalDate.of(2026, 5, 25))));

        ReadinessSummary summary = calculator.calculate(accounts);

        assertEquals(3, summary.total());
        assertEquals(1, summary.readyCount());
        assertEquals(2, summary.needsAttention());
        assertFalse(summary.canSubmit());
    }

    @Test
    void allowsSubmissionWhenEveryAccountIsCurrent() {
        List<ClientAccount> accounts = List.of(
                new ClientAccount("current-a", new Statement("a.pdf", LocalDate.of(2026, 8, 1))),
                new ClientAccount("current-b", new Statement("b.pdf", LocalDate.of(2026, 5, 26))));

        ReadinessSummary summary = calculator.calculate(accounts);

        assertEquals(2, summary.readyCount());
        assertTrue(summary.canSubmit());
    }
}
