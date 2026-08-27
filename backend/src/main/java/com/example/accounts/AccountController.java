package com.example.accounts;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/accounts")
public class AccountController {

    private final AccountService accountService;

    public AccountController(AccountService accountService) {
        this.accountService = accountService;
    }

    @GetMapping
    public AccountsResponse getAccounts() {
        return accountService.getAccounts();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public AccountsResponse addAccounts(@RequestBody AddAccountsRequest request) {
        return accountService.addAccounts(request.providerIds());
    }

    @DeleteMapping("/{accountId}")
    public AccountsResponse removeAccount(@PathVariable String accountId) {
        return accountService.removeAccount(accountId);
    }

    @PutMapping("/{accountId}/statement")
    public AccountsResponse replaceStatement(
            @PathVariable String accountId,
            @RequestBody StatementRequest request) {
        return accountService.replaceStatement(accountId, request.toStatement());
    }

}
