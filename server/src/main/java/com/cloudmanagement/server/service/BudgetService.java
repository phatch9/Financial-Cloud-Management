package com.cloudmanagement.server.service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.cloudmanagement.server.model.Budget;
import com.cloudmanagement.server.model.Transaction;
import com.cloudmanagement.server.model.User;
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

    public List<Budget> getAllBudgets(Long userId) {
        // Calculate spent amount for each budget dynamically
        List<Budget> budgets = budgetRepository.findByUserId(userId);
        for (Budget budget : budgets) {
            recalculateBudgetSpent(budget);
        }
        return budgets;
    }

    public Optional<Budget> getBudgetById(Long id, Long userId) {
        Optional<Budget> budget = budgetRepository.findById(id);
        if (budget.isPresent() && !budget.get().getUser().getId().equals(userId)) {
            return Optional.empty(); // Not authorized
        }
        budget.ifPresent(this::recalculateBudgetSpent);
        return budget;
    }

    public Budget createBudget(Budget budget, User user) {
        budget.setUser(user);
        budget.setSpent(BigDecimal.ZERO);
        return budgetRepository.save(budget);
    }

    public Budget updateBudget(Long id, Budget budgetDetails, Long userId) {
        return getBudgetById(id, userId)
                .map(budget -> {
                    budget.setName(budgetDetails.getName());
                    budget.setCategory(budgetDetails.getCategory());
                    budget.setAmount(budgetDetails.getAmount());
                    return budgetRepository.save(budget);
                })
                .orElseThrow(() -> new RuntimeException("Budget not found or unauthorized"));
    }

    public void deleteBudget(Long id, Long userId) {
        getBudgetById(id, userId).ifPresent(budget -> budgetRepository.deleteById(id));
    }

    private void recalculateBudgetSpent(Budget budget) {
        // Find all transactions for this budget (and owned by same user)
        List<Transaction> transactions = transactionRepository.findByUserIdAndBudgetId(
                budget.getUser().getId(),
                budget.getId());

        // Sum up expense transactions
        BigDecimal totalSpent = transactions.stream()
                .filter(t -> t.getType() == Transaction.TransactionType.EXPENSE)
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        budget.setSpent(totalSpent);
        budgetRepository.save(budget);
    }

    public BudgetSummary getBudgetSummary(Long userId) {
        List<Budget> budgets = getAllBudgets(userId); // already recalculates spent

        BigDecimal totalBudgeted = budgets.stream()
                .map(Budget::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalSpent = budgets.stream()
                .map(Budget::getSpent)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long overBudgetCount = budgets.stream()
                .filter(b -> b.getSpent().compareTo(b.getAmount()) > 0)
                .count();

        return new BudgetSummary(
                totalBudgeted,
                totalSpent,
                totalBudgeted.subtract(totalSpent),
                (int) overBudgetCount,
                budgets.size());
    }

    // DTO for summary
    public static class BudgetSummary {
        private BigDecimal totalBudgeted;
        private BigDecimal totalSpent;
        private BigDecimal totalRemaining;
        private int overBudgetCount;
        private int totalBudgets;

        public BudgetSummary(BigDecimal totalBudgeted, BigDecimal totalSpent, BigDecimal totalRemaining,
                int overBudgetCount, int totalBudgets) {
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

        public int getOverBudgetCount() {
            return overBudgetCount;
        }

        public int getTotalBudgets() {
            return totalBudgets;
        }
    }
}
