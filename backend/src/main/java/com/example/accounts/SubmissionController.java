package com.example.accounts;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/submit")
public class SubmissionController {

    private final AccountService accountService;

    public SubmissionController(AccountService accountService) {
        this.accountService = accountService;
    }

    @PostMapping
    public SubmitResponse submit() {
        return accountService.submit();
    }
}
