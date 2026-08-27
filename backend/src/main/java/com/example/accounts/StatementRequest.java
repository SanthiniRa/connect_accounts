package com.example.accounts;

import java.time.LocalDate;

public record StatementRequest(String fileName, LocalDate statementDate) {

    public Statement toStatement() {
        return new Statement(fileName, statementDate);
    }
}
