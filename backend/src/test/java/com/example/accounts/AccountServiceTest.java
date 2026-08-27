package com.example.accounts;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;

import org.junit.jupiter.api.Test;

import java.util.List;

class AccountServiceTest {

    @Test
    void availableProvidersExcludeSeededAccounts() {
        InMemoryAccountRepository repository = new InMemoryAccountRepository();
        StatementStatusCalculator statusCalculator = new StatementStatusCalculator(
                Clock.fixed(Instant.parse("2026-08-26T00:00:00Z"), ZoneOffset.UTC));
        AccountService service = new AccountService(
                repository,
                statusCalculator,
                new AccountReadinessCalculator(statusCalculator),
                new ProviderSelectionValidator(repository),
                new AccountRemovalValidator(repository),
                new StatementValidator(Clock.fixed(
                        Instant.parse("2026-08-26T00:00:00Z"), ZoneOffset.UTC)),
                new SubmissionValidator(repository, statusCalculator));

        assertFalse(service.findAvailableProviders("").stream()
                .anyMatch(provider -> provider.id().equals("barclays")));
        assertTrue(service.findAvailableProviders("mon").stream()
                .anyMatch(provider -> provider.id().equals("monzo")));
    }

        @Test
        void rejectsUnknownAndAlreadyAddedProviders() {
                InMemoryAccountRepository repository = new InMemoryAccountRepository();
                ProviderSelectionValidator validator = new ProviderSelectionValidator(repository);

                assertThrows(IllegalArgumentException.class,
                                () -> validator.validate(List.of("does-not-exist")));
                assertThrows(IllegalArgumentException.class,
                                () -> validator.validate(List.of("barclays")));
        }

            @Test
            void addsMultipleAvailableProvidersAsMissingAccounts() {
                InMemoryAccountRepository repository = new InMemoryAccountRepository();
                StatementStatusCalculator statusCalculator = new StatementStatusCalculator(
                        Clock.fixed(Instant.parse("2026-08-26T00:00:00Z"), ZoneOffset.UTC));
                AccountService service = new AccountService(
                        repository,
                        statusCalculator,
                        new AccountReadinessCalculator(statusCalculator),
                        new ProviderSelectionValidator(repository),
                        new AccountRemovalValidator(repository),
                        new StatementValidator(Clock.fixed(
                                Instant.parse("2026-08-26T00:00:00Z"), ZoneOffset.UTC)),
                        new SubmissionValidator(repository, statusCalculator));

                AccountsResponse response = service.addAccounts(List.of("monzo", "nutmeg"));

                assertTrue(response.accounts().stream().anyMatch(account -> account.providerId().equals("monzo")));
                assertTrue(response.accounts().stream().anyMatch(account -> account.providerId().equals("nutmeg")));
                assertEquals(StatementStatus.MISSING, response.accounts().stream()
                        .filter(account -> account.providerId().equals("monzo"))
                        .findFirst().orElseThrow().status());
            }

        @Test
        void removesAnAddedAccount() {
                InMemoryAccountRepository repository = new InMemoryAccountRepository();
                AccountRemovalValidator validator = new AccountRemovalValidator(repository);

                validator.validate("hsbc");
                repository.removeAccount("hsbc");

                assertFalse(repository.accountExists("hsbc"));
        }

        @Test
        void replacesStatementMetadata() {
                InMemoryAccountRepository repository = new InMemoryAccountRepository();
                Statement replacement = new Statement("hsbc-august.pdf", LocalDate.of(2026, 8, 1));

                repository.replaceStatement("hsbc", replacement);

                assertEquals(replacement, repository.findAccountByProviderId("hsbc")
                                .orElseThrow().statement());
        }

                    @Test
                    void rejectsIncompleteSubmissionWithAllAttentionIssues() {
                        InMemoryAccountRepository repository = new InMemoryAccountRepository();
                        StatementStatusCalculator statusCalculator = new StatementStatusCalculator(
                                Clock.fixed(Instant.parse("2026-08-26T00:00:00Z"), ZoneOffset.UTC));
                        SubmissionValidator validator = new SubmissionValidator(repository, statusCalculator);

                        IncompleteSubmissionException exception = assertThrows(
                                IncompleteSubmissionException.class, validator::validate);

                        assertEquals(2, exception.issues().size());
                        assertTrue(exception.issues().stream()
                                .anyMatch(issue -> issue.providerId().equals("hsbc")
                                        && issue.status() == StatementStatus.MISSING));
                        assertTrue(exception.issues().stream()
                                .anyMatch(issue -> issue.providerId().equals("vanguard")
                                        && issue.status() == StatementStatus.OUTDATED));
                    }

                @Test
                void acceptsSubmissionWhenAllAccountsHaveCurrentStatements() {
                        InMemoryAccountRepository repository = new InMemoryAccountRepository();
                        Clock fixedClock = Clock.fixed(Instant.parse("2026-08-26T00:00:00Z"), ZoneOffset.UTC);
                        StatementStatusCalculator statusCalculator = new StatementStatusCalculator(fixedClock);
                        SubmissionValidator validator = new SubmissionValidator(repository, statusCalculator);

                        repository.replaceStatement("hsbc", new Statement("hsbc.pdf", LocalDate.of(2026, 8, 1)));
                        repository.replaceStatement("vanguard", new Statement("vanguard.pdf", LocalDate.of(2026, 7, 1)));

                        validator.validate();
                        assertTrue(validator.findIssues().isEmpty());
                }
}
