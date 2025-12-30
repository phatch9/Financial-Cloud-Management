package com.cloudmanagement.server.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
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
import org.springframework.web.bind.annotation.RestController;

import com.cloudmanagement.server.model.Budget;
import com.cloudmanagement.server.model.User;
import com.cloudmanagement.server.service.AuthService;
import com.cloudmanagement.server.service.BudgetService;
import com.cloudmanagement.server.service.BudgetService.BudgetSummary;

/**
 * REST Controller for Budget management.
 * All endpoints here are protected by Spring Security.
 * Base path: /api/budgets
 */
@RestController
@RequestMapping("/api/budgets")
public class BudgetController {

    private final BudgetService budgetService;
    private final AuthService authService;

    @Autowired
    public BudgetController(BudgetService budgetService, AuthService authService) {
        this.budgetService = budgetService;
        this.authService = authService;
    }

    // Helper to get current user from security context
    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authService.getCurrentUser(authentication.getName());
    }

    /**
     * GET /api/budgets
     * Fetches all budget items for current user.
     */
    @GetMapping
    public List<Budget> getAllBudgets() {
        return budgetService.getAllBudgets(getCurrentUser().getId());
    }

    /**
     * POST /api/budgets
     * Creates a new budget item for current user.
     */
    @PostMapping
    public Budget createBudget(@RequestBody Budget budget) {
        return budgetService.createBudget(budget, getCurrentUser());
    }

    /**
     * GET /api/budgets/{id}
     * Fetches a single budget item by ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<Budget> getBudgetById(@PathVariable Long id) {
        return budgetService.getBudgetById(id, getCurrentUser().getId())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * PUT /api/budgets/{id}
     * Updates an existing budget item.
     */
    @PutMapping("/{id}")
    public ResponseEntity<Budget> updateBudget(@PathVariable Long id, @RequestBody Budget budget) {
        try {
            return ResponseEntity.ok(budgetService.updateBudget(id, budget, getCurrentUser().getId()));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * DELETE /api/budgets/{id}
     * Deletes a budget item by ID.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBudget(@PathVariable Long id) {
        budgetService.deleteBudget(id, getCurrentUser().getId());
        return ResponseEntity.noContent().build();
    }

    /**
     * GET /api/budgets/summary
     * Get overall budget summary with analytics for current user.
     */
    @GetMapping("/summary")
    public BudgetSummary getBudgetSummary() {
        return budgetService.getBudgetSummary(getCurrentUser().getId());
    }
}
