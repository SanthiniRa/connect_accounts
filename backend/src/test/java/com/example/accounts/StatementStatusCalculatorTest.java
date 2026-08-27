package com.example.accounts;

import static org.junit.jupiter.api.Assertions.assertEquals;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;

import org.junit.jupiter.api.Test;

class StatementStatusCalculatorTest {

    private final Clock fixedClock = Clock.fixed(
            Instant.parse("2026-08-26T00:00:00Z"), ZoneOffset.UTC);
    private final StatementStatusCalculator calculator = new StatementStatusCalculator(fixedClock);

    @Test
    void returnsMissingWhenStatementDoesNotExist() {
        assertEquals(StatementStatus.MISSING, calculator.calculate(null));
    }

    @Test
    void treatsExactlyThreeMonthsOldAsCurrent() {
        Statement statement = new Statement("may.pdf", LocalDate.of(2026, 5, 26));

        assertEquals(StatementStatus.UPLOADED, calculator.calculate(statement));
    }

    @Test
    void treatsOlderThanThreeMonthsAsOutdated() {
        Statement statement = new Statement("may.pdf", LocalDate.of(2026, 5, 25));

        assertEquals(StatementStatus.OUTDATED, calculator.calculate(statement));
    }
}
