package com.example.accounts;

import java.util.List;

public record AddAccountsRequest(List<String> providerIds) {
}
