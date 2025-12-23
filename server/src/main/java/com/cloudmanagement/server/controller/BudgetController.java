package com.cloudmanagement.server.controller;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.cloudmanagement.server.model.Budget;
import com.cloudmanagement.server.repository.BudgetRepository;

/**
 * REST Controller for Budget management.
 * All endpoints here are protected by Spring Security (Basic Auth).
 * Base path: /api/budgets
 */
@RestController
@RequestMapping("/api/budgets")
public class BudgetController {

    private final BudgetRepository budgetRepository;

    @Autowired
    public BudgetController(BudgetRepository budgetRepository) {
        this.budgetRepository = budgetRepository;
        initializeMockData(); // Initialize mock data for quick testing
    }
    
    /**
     * Helper method to initialize some data for immediate testing.
     * This ensures the database is not empty when the frontend fetches data.
     */
    private void initializeMockData() {
        // Use a small delay/check to prevent race conditions on startup
        try {
            if (budgetRepository.count() == 0) {
                budgetRepository.save(new Budget("Cloud Compute (AWS)", "Infrastructure", new BigDecimal("5000.00"), new BigDecimal("3200.00")));
                budgetRepository.save(new Budget("Software Licences (Q3)", "Software", new BigDecimal("1500.00"), new BigDecimal("500.00")));
                budgetRepository.save(new Budget("Server Hardware Refresh", "Hardware", new BigDecimal("8000.00"), new BigDecimal("8000.00")));
                System.out.println("--- BudgetController: Initialized 3 mock budget items. ---");
            }
        } catch (Exception e) {
            System.err.println("--- BudgetController: Failed to initialize mock data: " + e.getMessage() + " ---");
            // This can happen if the database isn't fully ready yet, but JPA usually handles this.
        }
    }

    /**
     * GET /api/budgets
     * Fetches all budget items.
     */
    @GetMapping
    public List<Budget> getAllBudgets() {
        return budgetRepository.findAll();
    }

    /**
     * POST /api/budgets
     * Creates a new budget item.
     */
    @PostMapping
    public Budget createBudget(@RequestBody Budget budget) {
        // Ensure ID is null for creation
        budget.setId(null); 
        // Ensure spent is initialized if not provided
        if (budget.getSpent() == null) {
            budget.setSpent(BigDecimal.ZERO);
        }
        return budgetRepository.save(budget);
    }

    /**
     * GET /api/budgets/{id}
     * Fetches a single budget item by ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<Budget> getBudgetById(@PathVariable Long id) {
        Optional<Budget> budget = budgetRepository.findById(id);
        return budget.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    /**
     * DELETE /api/budgets/{id}
     * Deletes a budget item by ID.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBudget(@PathVariable Long id) {
        if (budgetRepository.existsById(id)) {
            budgetRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}
