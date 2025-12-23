import axios from 'axios';

// Create axios instance with default configuration
const api = axios.create({
    baseURL: 'http://localhost:5050',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth header
api.interceptors.request.use(
    (config) => {
        const authHeader = localStorage.getItem('authHeader');
        if (authHeader) {
            config.headers.Authorization = authHeader;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Clear auth and redirect to login
            localStorage.removeItem('authHeader');
            localStorage.removeItem('username');
            window.location.href = '/';
        }
        return Promise.reject(error);
    }
);

// Types
export interface Budget {
    id?: number;
    name: string;
    category: string;
    amount: number;
    spent: number;
}

export interface BudgetSummary {
    totalBudgeted: number;
    totalSpent: number;
    totalRemaining: number;
    overBudgetCount: number;
    totalBudgets: number;
}

export interface Transaction {
    id?: number;
    description: string;
    amount: number;
    category: string;
    transactionDate: string; // ISO string
    type: 'INCOME' | 'EXPENSE';
    budgetId?: number;
    receiptUrl?: string;
}

// Budget API
export const budgetApi = {
    getAll: () => api.get<Budget[]>('/api/budgets'),
    getById: (id: number) => api.get<Budget>(`/api/budgets/${id}`),
    create: (budget: Omit<Budget, 'id' | 'spent'>) => api.post<Budget>('/api/budgets', budget),
    update: (id: number, budget: Omit<Budget, 'id' | 'spent'>) => api.put<Budget>(`/api/budgets/${id}`, budget),
    delete: (id: number) => api.delete(`/api/budgets/${id}`),
    getSummary: () => api.get<BudgetSummary>('/api/budgets/summary'),
};

// Transaction API
export const transactionApi = {
    getAll: () => api.get<Transaction[]>('/api/transactions'),
    getById: (id: number) => api.get<Transaction>(`/api/transactions/${id}`),
    create: (transaction: Omit<Transaction, 'id'>) => api.post<Transaction>('/api/transactions', transaction),
    update: (id: number, transaction: Omit<Transaction, 'id'>) => api.put<Transaction>(`/api/transactions/${id}`, transaction),
    delete: (id: number) => api.delete(`/api/transactions/${id}`),
    getByCategory: (category: string) => api.get<Transaction[]>(`/api/transactions/category/${category}`),
    getByDateRange: (start: string, end: string) => api.get<Transaction[]>('/api/transactions/date-range', { params: { start, end } }),
    getByBudget: (budgetId: number) => api.get<Transaction[]>(`/api/transactions/budget/${budgetId}`),
    getByType: (type: 'INCOME' | 'EXPENSE') => api.get<Transaction[]>(`/api/transactions/type/${type}`),
};

// Test API
export const testApi = {
    checkConnection: () => api.get<string>('/api/test'),
};

export default api;
