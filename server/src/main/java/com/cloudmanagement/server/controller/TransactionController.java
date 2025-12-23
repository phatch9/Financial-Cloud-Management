package com.cloudmanagement.server.controller;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
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
import com.cloudmanagement.server.repository.TransactionRepository;

/**
 * REST Controller for Transaction management.
 * All endpoints here are protected by Spring Security (Basic Auth).
 * Base path: /api/transactions
 */
@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    private final TransactionRepository transactionRepository;

    @Autowired
    public TransactionController(TransactionRepository transactionRepository) {
        this.transactionRepository = transactionRepository;
        initializeMockData(); // Initialize mock data for quick testing
    }

    /**
     * Helper method to initialize some transaction data for immediate testing.
     */
    private void initializeMockData() {
        try {
            if (transactionRepository.count() == 0) {
                transactionRepository.save(new Transaction(
                        "AWS EC2 Instance - Monthly",
                        new BigDecimal("450.00"),
                        "Infrastructure",
                        LocalDateTime.now().minusDays(5),
                        TransactionType.EXPENSE));

                transactionRepository.save(new Transaction(
                        "Client Payment - Project Alpha",
                        new BigDecimal("5000.00"),
                        "Income",
                        LocalDateTime.now().minusDays(3),
                        TransactionType.INCOME));

                transactionRepository.save(new Transaction(
                        "Office 365 Subscription",
                        new BigDecimal("150.00"),
                        "Software",
                        LocalDateTime.now().minusDays(1),
                        TransactionType.EXPENSE));

                transactionRepository.save(new Transaction(
                        "Dell Server Purchase",
                        new BigDecimal("3200.00"),
                        "Hardware",
                        LocalDateTime.now().minusDays(10),
                        TransactionType.EXPENSE));

                System.out.println("--- TransactionController: Initialized 4 mock transaction items. ---");
            }
        } catch (Exception e) {
            System.err.println("--- TransactionController: Failed to initialize mock data: " + e.getMessage() + " ---");
        }
    }

    /**
     * GET /api/transactions
     * Fetches all transactions ordered by date (most recent first).
     */
    @GetMapping
    public List<Transaction> getAllTransactions() {
        return transactionRepository.findAllByOrderByTransactionDateDesc();
    }

    /**
     * POST /api/transactions
     * Creates a new transaction.
     */
    @PostMapping
    public Transaction createTransaction(@RequestBody Transaction transaction) {
        // Ensure ID is null for creation
        transaction.setId(null);

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
        return transaction.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    /**
     * PUT /api/transactions/{id}
     * Updates an existing transaction.
     */
    @PutMapping("/{id}")
    public ResponseEntity<Transaction> updateTransaction(@PathVariable Long id,
            @RequestBody Transaction updatedTransaction) {
        Optional<Transaction> existingTransaction = transactionRepository.findById(id);

        if (existingTransaction.isPresent()) {
            Transaction transaction = existingTransaction.get();
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
        if (transactionRepository.existsById(id)) {
            transactionRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * GET /api/transactions/category/{category}
     * Fetches all transactions for a specific category.
     */
    @GetMapping("/category/{category}")
    public List<Transaction> getTransactionsByCategory(@PathVariable String category) {
        return transactionRepository.findByCategory(category);
    }

    /**
     * GET /api/transactions/date-range
     * Fetches transactions within a date range.
     * Example:
     * /api/transactions/date-range?start=2024-01-01T00:00:00&end=2024-12-31T23:59:59
     */
    @GetMapping("/date-range")
    public List<Transaction> getTransactionsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        return transactionRepository.findByTransactionDateBetween(start, end);
    }

    /**
     * GET /api/transactions/budget/{budgetId}
     * Fetches all transactions linked to a specific budget.
     */
    @GetMapping("/budget/{budgetId}")
    public List<Transaction> getTransactionsByBudget(@PathVariable Long budgetId) {
        return transactionRepository.findByBudgetId(budgetId);
    }

    /**
     * GET /api/transactions/type/{type}
     * Fetches all transactions by type (INCOME or EXPENSE).
     */
    @GetMapping("/type/{type}")
    public List<Transaction> getTransactionsByType(@PathVariable TransactionType type) {
        return transactionRepository.findByType(type);
    }
}
