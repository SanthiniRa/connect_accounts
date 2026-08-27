package com.example.accounts;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/providers")
public class ProviderController {

    private final AccountService accountService;

    public ProviderController(AccountService accountService) {
        this.accountService = accountService;
    }

    @GetMapping
    public List<Provider> findAvailableProviders(
            @RequestParam(defaultValue = "") String query) {
        return accountService.findAvailableProviders(query);
    }
}
