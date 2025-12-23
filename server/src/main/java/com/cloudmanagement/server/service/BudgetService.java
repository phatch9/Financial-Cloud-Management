package com.cloudmanagement.server.service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.cloudmanagement.server.model.Budget;
import com.cloudmanagement.server.model.Transaction;
import com.cloudmanagement.server.model.Transaction.TransactionType;
import com.cloudmanagement.server.repository.BudgetRepository;
import com.cloudmanagement.server.repository.TransactionRepository;

/**
 * Service layer for Budget business logic.
 * Handles budget calculations, validations, and transaction integration.
 */
@Service
public class BudgetService {

    private final BudgetRepository budgetRepository;
    private final TransactionRepository transactionRepository;

    @Autowired
    public BudgetService(BudgetRepository budgetRepository, TransactionRepository transactionRepository) {
        this.budgetRepository = budgetRepository;
        this.transactionRepository = transactionRepository;
    }

    /**
     * Get all budgets.
     */
    public List<Budget> getAllBudgets() {
        return budgetRepository.findAll();
    }

    /**
     * Get a budget by ID.
     */
    public Optional<Budget> getBudgetById(Long id) {
        return budgetRepository.findById(id);
    }

    /**
     * Create a new budget.
     */
    public Budget createBudget(Budget budget) {
        budget.setId(null);
        if (budget.getSpent() == null) {
            budget.setSpent(BigDecimal.ZERO);
        }
        return budgetRepository.save(budget);
    }

    /**
     * Update an existing budget.
     */
    public Optional<Budget> updateBudget(Long id, Budget updatedBudget) {
        Optional<Budget> existingBudget = budgetRepository.findById(id);

        if (existingBudget.isPresent()) {
            Budget budget = existingBudget.get();
            budget.setName(updatedBudget.getName());
            budget.setCategory(updatedBudget.getCategory());
            budget.setAmount(updatedBudget.getAmount());
            // Don't update spent directly - it should be calculated from transactions
            return Optional.of(budgetRepository.save(budget));
        }

        return Optional.empty();
    }

    /**
     * Delete a budget by ID.
     */
    public boolean deleteBudget(Long id) {
        if (budgetRepository.existsById(id)) {
            budgetRepository.deleteById(id);
            return true;
        }
        return false;
    }

    /**
     * Recalculate the spent amount for a budget based on linked transactions.
     * This should be called when transactions are added/updated/deleted.
     */
    @Transactional
    public void recalculateBudgetSpent(Long budgetId) {
        Optional<Budget> budgetOpt = budgetRepository.findById(budgetId);

        if (budgetOpt.isPresent()) {
            Budget budget = budgetOpt.get();
            List<Transaction> transactions = transactionRepository.findByBudgetId(budgetId);

            // Sum up all EXPENSE transactions linked to this budget
            BigDecimal totalSpent = transactions.stream()
                    .filter(t -> t.getType() == TransactionType.EXPENSE)
                    .map(Transaction::getAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            budget.setSpent(totalSpent);
            budgetRepository.save(budget);
        }
    }

    /**
     * Get budget summary with analytics.
     */
    public BudgetSummary getBudgetSummary() {
        List<Budget> budgets = budgetRepository.findAll();

        BigDecimal totalBudgeted = budgets.stream()
                .map(Budget::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalSpent = budgets.stream()
                .map(Budget::getSpent)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalRemaining = totalBudgeted.subtract(totalSpent);

        long overBudgetCount = budgets.stream()
                .filter(b -> b.getSpent().compareTo(b.getAmount()) > 0)
                .count();

        return new BudgetSummary(totalBudgeted, totalSpent, totalRemaining, overBudgetCount, budgets.size());
    }

    /**
     * Inner class to represent budget summary data.
     */
    public static class BudgetSummary {
        private BigDecimal totalBudgeted;
        private BigDecimal totalSpent;
        private BigDecimal totalRemaining;
        private long overBudgetCount;
        private int totalBudgets;

        public BudgetSummary(BigDecimal totalBudgeted, BigDecimal totalSpent,
                BigDecimal totalRemaining, long overBudgetCount, int totalBudgets) {
            this.totalBudgeted = totalBudgeted;
            this.totalSpent = totalSpent;
            this.totalRemaining = totalRemaining;
            this.overBudgetCount = overBudgetCount;
            this.totalBudgets = totalBudgets;
        }

        // Getters
        public BigDecimal getTotalBudgeted() {
            return totalBudgeted;
        }

        public BigDecimal getTotalSpent() {
            return totalSpent;
        }

        public BigDecimal getTotalRemaining() {
            return totalRemaining;
        }

        public long getOverBudgetCount() {
            return overBudgetCount;
        }

        public int getTotalBudgets() {
            return totalBudgets;
        }
    }
}
