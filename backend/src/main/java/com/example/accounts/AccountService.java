package com.example.accounts;

import java.util.List;

import org.springframework.stereotype.Service;

@Service
public class AccountService {

    private final InMemoryAccountRepository repository;
    private final StatementStatusCalculator statusCalculator;
    private final AccountReadinessCalculator readinessCalculator;
        private final ProviderSelectionValidator selectionValidator;
        private final AccountRemovalValidator removalValidator;
        private final StatementValidator statementValidator;
        private final SubmissionValidator submissionValidator;

    public AccountService(
            InMemoryAccountRepository repository,
            StatementStatusCalculator statusCalculator,
                        AccountReadinessCalculator readinessCalculator,
            ProviderSelectionValidator selectionValidator,
                            AccountRemovalValidator removalValidator,
            StatementValidator statementValidator,
            SubmissionValidator submissionValidator) {
        this.repository = repository;
        this.statusCalculator = statusCalculator;
        this.readinessCalculator = readinessCalculator;
                this.selectionValidator = selectionValidator;
        this.removalValidator = removalValidator;
                this.statementValidator = statementValidator;
        this.submissionValidator = submissionValidator;
    }

    public AccountsResponse getAccounts() {
        List<AccountView> accountViews = repository.findAllAccounts().stream()
                .map(account -> new AccountView(
                        account.providerId(),
                        repository.findProviderById(account.providerId())
                                .map(Provider::name)
                                .orElse(account.providerId()),
                        account.statement(),
                        statusCalculator.calculate(account.statement())))
                .toList();

        return new AccountsResponse(accountViews, readinessCalculator.calculate(repository.findAllAccounts()));
    }

        public List<Provider> findAvailableProviders(String query) {
                String normalizedQuery = query == null ? "" : query.trim().toLowerCase();
                return repository.findAllProviders().stream()
                                .filter(provider -> !repository.accountExists(provider.id()))
                                .filter(provider -> normalizedQuery.isEmpty()
                                                || provider.name().toLowerCase().contains(normalizedQuery))
                                .toList();
        }

        public AccountsResponse addAccounts(List<String> providerIds) {
                selectionValidator.validate(providerIds);
                providerIds.forEach(repository::addAccount);
                return getAccounts();
        }

        public AccountsResponse removeAccount(String providerId) {
                removalValidator.validate(providerId);
                repository.removeAccount(providerId);
                return getAccounts();
        }

        public AccountsResponse replaceStatement(String providerId, Statement statement) {
                removalValidator.validate(providerId);
                statementValidator.validate(statement);
                repository.replaceStatement(providerId, statement);
                return getAccounts();
        }

        public SubmitResponse submit() {
                submissionValidator.validate();
                return new SubmitResponse("Accounts submitted successfully.");
        }
}
