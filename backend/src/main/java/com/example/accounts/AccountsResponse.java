package com.example.accounts;

import java.util.List;

public record AccountsResponse(List<AccountView> accounts, ReadinessSummary summary) {
}
