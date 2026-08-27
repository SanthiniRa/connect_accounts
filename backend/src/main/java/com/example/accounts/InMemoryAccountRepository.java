package com.example.accounts;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.stereotype.Repository;

@Repository
public class InMemoryAccountRepository {

    private final Map<String, Provider> providers;
    private final Map<String, ClientAccount> accounts;

    public InMemoryAccountRepository() {
        providers = new LinkedHashMap<>();
        accounts = new LinkedHashMap<>();
        seedData();
    }

    public List<Provider> findAllProviders() {
        return List.copyOf(providers.values());
    }

    public List<ClientAccount> findAllAccounts() {
        return List.copyOf(accounts.values());
    }

    public Optional<Provider> findProviderById(String providerId) {
        return Optional.ofNullable(providers.get(providerId));
    }

    public Optional<ClientAccount> findAccountByProviderId(String providerId) {
        return Optional.ofNullable(accounts.get(providerId));
    }

    public boolean accountExists(String providerId) {
        return accounts.containsKey(providerId);
    }

    public void addAccount(String providerId) {
        accounts.put(providerId, new ClientAccount(providerId, null));
    }

    public void removeAccount(String providerId) {
        accounts.remove(providerId);
    }

    public void replaceStatement(String providerId, Statement statement) {
        ClientAccount account = accounts.get(providerId);
        if (account != null) {
            accounts.put(providerId, new ClientAccount(account.providerId(), statement));
        }
    }

    private void seedData() {
        List<Provider> seededProviders = List.of(
                new Provider("barclays", "Barclays"),
                new Provider("hsbc", "HSBC"),
                new Provider("vanguard", "Vanguard"),
                new Provider("fidelity", "Fidelity"),
                new Provider("monzo", "Monzo"),
                new Provider("nutmeg", "Nutmeg"),
                new Provider("aj-bell", "AJ Bell")
        );
        seededProviders.forEach(provider -> providers.put(provider.id(), provider));

        accounts.put("barclays", new ClientAccount(
                "barclays", new Statement("statement_jan.pdf", LocalDate.of(2026, 8, 1))));
        accounts.put("hsbc", new ClientAccount("hsbc", null));
        accounts.put("vanguard", new ClientAccount(
                "vanguard", new Statement("old_statement.pdf", LocalDate.of(2026, 1, 15))));
        accounts.put("fidelity", new ClientAccount(
                "fidelity", new Statement("q4_2025.pdf", LocalDate.of(2026, 7, 1))));
    }
}
