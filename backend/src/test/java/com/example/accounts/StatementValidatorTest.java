package com.example.accounts;

import static org.junit.jupiter.api.Assertions.assertThrows;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;

import org.junit.jupiter.api.Test;

class StatementValidatorTest {

    private final Clock fixedClock = Clock.fixed(
            Instant.parse("2026-08-26T00:00:00Z"), ZoneOffset.UTC);
    private final StatementValidator validator = new StatementValidator(fixedClock);

    @Test
    void rejectsFutureStatementDate() {
        assertThrows(IllegalArgumentException.class,
                () -> validator.validate(new Statement("future.pdf", LocalDate.of(2026, 8, 27))));
    }

    @Test
    void rejectsBlankFilename() {
        assertThrows(IllegalArgumentException.class,
                () -> validator.validate(new Statement(" ", LocalDate.of(2026, 8, 26))));
    }

    @Test
    void rejectsMissingStatementDate() {
        assertThrows(IllegalArgumentException.class,
                () -> validator.validate(new Statement("statement.pdf", null)));
    }
}
