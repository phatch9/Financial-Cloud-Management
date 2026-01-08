package com.cloudmanagement.server.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.cloudmanagement.server.model.Transaction;
import com.cloudmanagement.server.model.Transaction.TransactionType;

/**
 * Spring Data JPA Repository for Transaction entity.
 * Provides CRUD operations and custom query methods.
 */
@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    /**
     * Find all transactions by category.
     */
    List<Transaction> findByCategory(String category);

    /**
     * Find all transactions within a date range.
     */
    List<Transaction> findByTransactionDateBetween(LocalDateTime start, LocalDateTime end);

    /**
     * Find all transactions linked to a specific budget.
     */
    List<Transaction> findByBudgetId(Long budgetId);

    /**
     * Find all transactions by type (INCOME or EXPENSE).
     */
    List<Transaction> findByType(TransactionType type);

    /**
     * Find all transactions ordered by date descending (most recent first).
     */
    List<Transaction> findAllByOrderByTransactionDateDesc();

    /**
     * Find all transactions by user ID ordered by date descending.
     */
    List<Transaction> findByUserIdOrderByTransactionDateDesc(Long userId);

    /**
     * Find transactions by user ID and category.
     */
    List<Transaction> findByUserIdAndCategory(Long userId, String category);

    /**
     * Find transactions by user ID and type.
     */
    List<Transaction> findByUserIdAndType(Long userId, TransactionType type);

    /**
     * Find transactions by user ID within date range.
     */
    List<Transaction> findByUserIdAndTransactionDateBetween(Long userId, LocalDateTime start, LocalDateTime end);

    /**
     * Find transactions by user ID and budget ID.
     */
    List<Transaction> findByUserIdAndBudgetId(Long userId, Long budgetId);
}
