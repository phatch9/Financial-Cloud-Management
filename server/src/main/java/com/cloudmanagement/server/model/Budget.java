package com.cloudmanagement.server.model;

import java.math.BigDecimal;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table; 

/**
 * JPA Entity representing a Budget item.
 * This maps to a 'budgets' table in the PostgreSQL database.
 */
@Entity
@Table(name = "budgets")
public class Budget {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    private String category;
    
    // Use BigDecimal for currency to avoid floating-point errors
    private BigDecimal amount;

    // Field to track amount has been spent against this budget
    private BigDecimal spent;

    // Default constructor required by JPA
    public Budget() {}

    // Constructor for easy object creation
    public Budget(String name, String category, BigDecimal amount, BigDecimal spent) {
        this.name = name;
        this.category = category;
        this.amount = amount;
        this.spent = spent;
    }

    // --- Getters and Setters ---

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public BigDecimal getSpent() {
        return spent;
    }

    public void setSpent(BigDecimal spent) {
        this.spent = spent;
    }
}
