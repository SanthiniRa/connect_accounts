package com.example.accounts;

import java.time.LocalDate;

public record Statement(String fileName, LocalDate statementDate) {
}
