package com.cloudmanagement.server.controller;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.cloudmanagement.server.model.Transaction;
import com.cloudmanagement.server.model.Transaction.TransactionType;
import com.cloudmanagement.server.model.User;
import com.cloudmanagement.server.repository.TransactionRepository;
import com.cloudmanagement.server.service.AuthService;

/**
 * REST Controller for Transaction management.
 * All endpoints here are protected by Spring Security.
 * Base path: /api/transactions
 */
@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    private final TransactionRepository transactionRepository;
    private final AuthService authService;

    @Autowired
    public TransactionController(TransactionRepository transactionRepository, AuthService authService) {
        this.transactionRepository = transactionRepository;
        this.authService = authService;
    }

    // Helper to get current user from security context
    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authService.getCurrentUser(authentication.getName());
    }

    /**
     * GET /api/transactions
     * Fetches all transactions for current user ordered by date (most recent
     * first).
     */
    @GetMapping
    public List<Transaction> getAllTransactions() {
        return transactionRepository.findByUserIdOrderByTransactionDateDesc(getCurrentUser().getId());
    }

    /**
     * POST /api/transactions
     * Creates a new transaction for current user.
     */
    @PostMapping
    public Transaction createTransaction(@RequestBody Transaction transaction) {
        User user = getCurrentUser();

        // Ensure ID is null for creation
        transaction.setId(null);
        transaction.setUser(user);

        // Set transaction date to now if not provided
        if (transaction.getTransactionDate() == null) {
            transaction.setTransactionDate(LocalDateTime.now());
        }

        return transactionRepository.save(transaction);
    }

    /**
     * GET /api/transactions/{id}
     * Fetches a single transaction by ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<Transaction> getTransactionById(@PathVariable Long id) {
        Optional<Transaction> transaction = transactionRepository.findById(id);

        if (transaction.isPresent() && transaction.get().getUser().getId().equals(getCurrentUser().getId())) {
            return ResponseEntity.ok(transaction.get());
        }

        return ResponseEntity.notFound().build();
    }

    /**
     * PUT /api/transactions/{id}
     * Updates an existing transaction.
     */
    @PutMapping("/{id}")
    public ResponseEntity<Transaction> updateTransaction(@PathVariable Long id,
            @RequestBody Transaction updatedTransaction) {
        Optional<Transaction> existingTransaction = transactionRepository.findById(id);
        Long userId = getCurrentUser().getId();

        if (existingTransaction.isPresent()) {
            Transaction transaction = existingTransaction.get();

            // Check ownership
            if (!transaction.getUser().getId().equals(userId)) {
                return ResponseEntity.notFound().build();
            }

            transaction.setDescription(updatedTransaction.getDescription());
            transaction.setAmount(updatedTransaction.getAmount());
            transaction.setCategory(updatedTransaction.getCategory());
            transaction.setTransactionDate(updatedTransaction.getTransactionDate());
            transaction.setType(updatedTransaction.getType());
            transaction.setBudgetId(updatedTransaction.getBudgetId());
            transaction.setReceiptUrl(updatedTransaction.getReceiptUrl());

            return ResponseEntity.ok(transactionRepository.save(transaction));
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * DELETE /api/transactions/{id}
     * Deletes a transaction by ID.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTransaction(@PathVariable Long id) {
        Optional<Transaction> transaction = transactionRepository.findById(id);
        Long userId = getCurrentUser().getId();

        if (transaction.isPresent() && transaction.get().getUser().getId().equals(userId)) {
            transactionRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * GET /api/transactions/category/{category}
     * Fetches all transactions for a specific category for current user.
     */
    @GetMapping("/category/{category}")
    public List<Transaction> getTransactionsByCategory(@PathVariable String category) {
        return transactionRepository.findByUserIdAndCategory(getCurrentUser().getId(), category);
    }

    /**
     * GET /api/transactions/date-range
     * Fetches transactions within a date range for current user.
     * Example:
     * /api/transactions/date-range?start=2024-01-01T00:00:00&end=2024-12-31T23:59:59
     */
    @GetMapping("/date-range")
    public List<Transaction> getTransactionsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        return transactionRepository.findByUserIdAndTransactionDateBetween(getCurrentUser().getId(), start, end);
    }

    /**
     * GET /api/transactions/budget/{budgetId}
     * Fetches all transactions linked to a specific budget for current user.
     */
    @GetMapping("/budget/{budgetId}")
    public List<Transaction> getTransactionsByBudget(@PathVariable Long budgetId) {
        return transactionRepository.findByUserIdAndBudgetId(getCurrentUser().getId(), budgetId);
    }

    /**
     * GET /api/transactions/type/{type}
     * Fetches all transactions by type (INCOME or EXPENSE) for current user.
     */
    @GetMapping("/type/{type}")
    public List<Transaction> getTransactionsByType(@PathVariable TransactionType type) {
        return transactionRepository.findByUserIdAndType(getCurrentUser().getId(), type);
    }
}
