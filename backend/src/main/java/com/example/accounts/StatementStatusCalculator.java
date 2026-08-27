package com.example.accounts;

import java.time.Clock;
import java.time.LocalDate;

import org.springframework.stereotype.Component;

@Component
public class StatementStatusCalculator {

    private static final int CURRENT_MONTHS = 3;

    private final Clock clock;

    public StatementStatusCalculator(Clock clock) {
        this.clock = clock;
    }

    public StatementStatus calculate(Statement statement) {
        if (statement == null) {
            return StatementStatus.MISSING;
        }

        LocalDate currentDate = LocalDate.now(clock);
        LocalDate oldestCurrentDate = currentDate.minusMonths(CURRENT_MONTHS);
        return statement.statementDate().isBefore(oldestCurrentDate)
                ? StatementStatus.OUTDATED
                : StatementStatus.UPLOADED;
    }
}
