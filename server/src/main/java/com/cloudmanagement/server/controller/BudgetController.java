package com.cloudmanagement.server.controller;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.cloudmanagement.server.model.Budget;
import com.cloudmanagement.server.repository.BudgetRepository;
import com.cloudmanagement.server.service.BudgetService;
import com.cloudmanagement.server.service.BudgetService.BudgetSummary;

/**
 * REST Controller for Budget management.
 * All endpoints here are protected by Spring Security (Basic Auth).
 * Base path: /api/budgets
 */
@RestController
@RequestMapping("/api/budgets")
public class BudgetController {

    private final BudgetRepository budgetRepository;
    private final BudgetService budgetService;

    @Autowired
    public BudgetController(BudgetRepository budgetRepository, BudgetService budgetService) {
        this.budgetRepository = budgetRepository;
        this.budgetService = budgetService;
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
                budgetRepository.save(new Budget("Cloud Compute (AWS)", "Infrastructure", new BigDecimal("5000.00"),
                        new BigDecimal("3200.00")));
                budgetRepository.save(new Budget("Software Licences (Q3)", "Software", new BigDecimal("1500.00"),
                        new BigDecimal("500.00")));
                budgetRepository.save(new Budget("Server Hardware Refresh", "Hardware", new BigDecimal("8000.00"),
                        new BigDecimal("8000.00")));
                System.out.println("--- BudgetController: Initialized 3 mock budget items. ---");
            }
        } catch (Exception e) {
            System.err.println("--- BudgetController: Failed to initialize mock data: " + e.getMessage() + " ---");
            // This can happen if the database isn't fully ready yet, but JPA usually
            // handles this.
        }
    }

    /**
     * GET /api/budgets
     * Fetches all budget items.
     */
    @GetMapping
    public List<Budget> getAllBudgets() {
        return budgetService.getAllBudgets();
    }

    /**
     * POST /api/budgets
     * Creates a new budget item.
     */
    @PostMapping
    public Budget createBudget(@RequestBody Budget budget) {
        return budgetService.createBudget(budget);
    }

    /**
     * GET /api/budgets/{id}
     * Fetches a single budget item by ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<Budget> getBudgetById(@PathVariable Long id) {
        return budgetService.getBudgetById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    /**
     * PUT /api/budgets/{id}
     * Updates an existing budget item.
     */
    @PutMapping("/{id}")
    public ResponseEntity<Budget> updateBudget(@PathVariable Long id, @RequestBody Budget budget) {
        return budgetService.updateBudget(id, budget)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    /**
     * DELETE /api/budgets/{id}
     * Deletes a budget item by ID.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBudget(@PathVariable Long id) {
        if (budgetService.deleteBudget(id)) {
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * GET /api/budgets/summary
     * Get overall budget summary with analytics.
     */
    @GetMapping("/summary")
    public BudgetSummary getBudgetSummary() {
        return budgetService.getBudgetSummary();
    }
}
