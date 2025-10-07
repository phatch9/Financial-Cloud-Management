package com.cloudmanagement.server.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.cloudmanagement.server.model.Budget;

/**
 * Spring Data JPA Repository for the Budget entity.
 * Provides CRUD operations for the 'budgets' table.
 */
@Repository
public interface BudgetRepository extends JpaRepository<Budget, Long> {
    // Basic CRUD operations are inherited from JpaRepository
}
