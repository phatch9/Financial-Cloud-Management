import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { TransactionList } from './components/TransactionList';
import { TransactionForm } from './components/TransactionForm';
import { BudgetForm } from './components/BudgetForm';
import { SpendingChart } from './components/SpendingChart';
import { Budget, budgetApi, Transaction, transactionApi, testApi } from './services/api';

// Default generated password from Spring Security
const DEFAULT_GENERATED_PASSWORD = '6ae704d7-dde3-49d8-a928-bdc5da8da012';

// Login Component
const LoginPage: React.FC = () => {
    const { login, isAuthenticated } = useAuth();
    const [username, setUsername] = useState('user');
    const [password, setPassword] = useState(DEFAULT_GENERATED_PASSWORD);
    const [message, setMessage] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        login(username, password);
        setMessage('Login successful!');
    };

    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
            <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-2xl border-t-4 border-indigo-600">
                <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-6">
                    Financial Manager Login
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                            Username
                        </label>
                        <input
                            id="username"
                            type="text"
                            required
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition"
                    >
                        Sign In
                    </button>
                </form>

                {message && (
                    <p className="mt-4 text-center text-green-600 font-semibold">{message}</p>
                )}
            </div>
        </div>
    );
};

// Dashboard Component
const DashboardPage: React.FC = () => {
    const [status, setStatus] = useState('Checking backend...');
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [budgets, setBudgets] = useState<Budget[]>([]);

    useEffect(() => {
        testApi.checkConnection()
            .then(response => setStatus(response.data))
            .catch(() => setStatus('Connection Error'));

        transactionApi.getAll()
            .then(response => setTransactions(response.data))
            .catch(err => console.error('Failed to fetch transactions:', err));

        budgetApi.getAll()
            .then(response => setBudgets(response.data))
            .catch(err => console.error('Failed to fetch budgets:', err));
    }, []);

    const totalIncome = transactions
        .filter(t => t.type === 'INCOME')
        .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = transactions
        .filter(t => t.type === 'EXPENSE')
        .reduce((sum, t) => sum + t.amount, 0);

    const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0);
    const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);

    const formatCurrency = (value: number) =>
        `$${value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-3xl font-bold text-gray-800">Dashboard Overview</h1>

            {/* Connection Status */}
            <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-green-500">
                <h2 className="text-xl font-semibold text-gray-700 mb-2">Backend Status</h2>
                <p className={`text-sm font-bold ${status.includes('Error') ? 'text-red-600' : 'text-green-600'}`}>
                    {status}
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-indigo-500">
                    <h2 className="text-sm font-semibold text-gray-700">Total Income</h2>
                    <p className="text-3xl font-extrabold text-green-600 mt-2">{formatCurrency(totalIncome)}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-red-500">
                    <h2 className="text-sm font-semibold text-gray-700">Total Expenses</h2>
                    <p className="text-3xl font-extrabold text-red-600 mt-2">{formatCurrency(totalExpenses)}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-yellow-500">
                    <h2 className="text-sm font-semibold text-gray-700">Total Budget</h2>
                    <p className="text-3xl font-extrabold text-yellow-600 mt-2">{formatCurrency(totalBudget)}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-purple-500">
                    <h2 className="text-sm font-semibold text-gray-700">Budget Spent</h2>
                    <p className="text-3xl font-extrabold text-purple-600 mt-2">{formatCurrency(totalSpent)}</p>
                </div>
            </div>

            {/* Spending Chart */}
            <SpendingChart transactions={transactions} />
        </div>
    );
};

// Budgets Page
const BudgetsPage: React.FC = () => {
    const [budgets, setBudgets] = useState<Budget[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingBudget, setEditingBudget] = useState<Budget | undefined>();

    const fetchBudgets = async () => {
        setLoading(true);
        try {
            const response = await budgetApi.getAll();
            setBudgets(response.data);
        } catch (err) {
            console.error('Failed to fetch budgets:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBudgets();
    }, []);

    const handleDelete = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this budget?')) return;

        try {
            await budgetApi.delete(id);
            setBudgets(budgets.filter(b => b.id !== id));
        } catch (err) {
            alert('Failed to delete budget');
        }
    };

    const handleFormSuccess = () => {
        setShowForm(false);
        setEditingBudget(undefined);
        fetchBudgets();
    };

    const formatCurrency = (value: number) =>
        `$${value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;

    return (
        <div className="p-6">
            <header className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Budget Management</h1>
                <button
                    onClick={() => setShowForm(true)}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-indigo-700 transition"
                >
                    + Add New Budget
                </button>
            </header>

            {loading ? (
                <p className="text-center text-gray-500 p-8">Loading budgets...</p>
            ) : (
                <div className="space-y-4">
                    {budgets.map((budget) => {
                        const remaining = budget.amount - budget.spent;
                        const percentage = Math.round((budget.spent / budget.amount) * 100);
                        const isOverspent = remaining < 0;

                        return (
                            <div
                                key={budget.id}
                                className="bg-white p-5 rounded-xl shadow-lg border-l-8 border-indigo-500 hover:shadow-xl transition"
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h2 className="text-xl font-semibold text-gray-800">{budget.name}</h2>
                                        <p className="text-sm text-gray-500">{budget.category}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <span className={`px-3 py-1 text-sm font-bold rounded-full ${isOverspent ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                                            }`}>
                                            {isOverspent ? 'OVERSPENT' : 'ON TRACK'}
                                        </span>
                                    </div>
                                </div>

                                <div className="mt-4 grid grid-cols-3 gap-4 text-sm font-medium">
                                    <div>
                                        <p className="text-gray-500">Total</p>
                                        <p className="text-gray-900">{formatCurrency(budget.amount)}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Spent</p>
                                        <p className="text-gray-900">{formatCurrency(budget.spent)}</p>
                                    </div>
                                    <div>
                                        <p className={isOverspent ? 'text-red-600' : 'text-green-600'}>Remaining</p>
                                        <p className={`text-xl font-extrabold ${isOverspent ? 'text-red-600' : 'text-green-600'}`}>
                                            {formatCurrency(Math.abs(remaining))}
                                        </p>
                                    </div>
                                </div>

                                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-4">
                                    <div
                                        className={`h-2.5 rounded-full ${percentage > 100 ? 'bg-red-500' : percentage >= 80 ? 'bg-yellow-500' : 'bg-indigo-500'
                                            }`}
                                        style={{ width: `${Math.min(percentage, 100)}%` }}
                                    />
                                </div>
                                <p className="text-xs text-right text-gray-500 mt-1">{percentage}% Used</p>

                                <div className="flex gap-2 mt-4">
                                    <button
                                        onClick={() => {
                                            setEditingBudget(budget);
                                            setShowForm(true);
                                        }}
                                        className="text-indigo-600 hover:text-indigo-800 font-medium"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => budget.id && handleDelete(budget.id)}
                                        className="text-red-600 hover:text-red-800 font-medium"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {showForm && (
                <BudgetForm
                    budget={editingBudget}
                    onSuccess={handleFormSuccess}
                    onCancel={() => {
                        setShowForm(false);
                        setEditingBudget(undefined);
                    }}
                />
            )}
        </div>
    );
};

// Transactions Page
const TransactionsPage: React.FC = () => {
    const [showForm, setShowForm] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>();
    const [refreshKey, setRefreshKey] = useState(0);

    const handleFormSuccess = () => {
        setShowForm(false);
        setEditingTransaction(undefined);
        setRefreshKey(prev => prev + 1); // Trigger refresh
    };

    return (
        <div className="p-6">
            <header className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Transaction History</h1>
                <button
                    onClick={() => setShowForm(true)}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-indigo-700 transition"
                >
                    + Add Transaction
                </button>
            </header>

            <TransactionList
                key={refreshKey}
                onEdit={(transaction) => {
                    setEditingTransaction(transaction);
                    setShowForm(true);
                }}
            />

            {showForm && (
                <TransactionForm
                    transaction={editingTransaction}
                    onSuccess={handleFormSuccess}
                    onCancel={() => {
                        setShowForm(false);
                        setEditingTransaction(undefined);
                    }}
                />
            )}
        </div>
    );
};

// Protected Route Wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isAuthenticated } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
};

// Layout Component
const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { logout, username } = useAuth();

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
            <nav className="flex flex-col w-64 bg-indigo-800 text-white shadow-xl">
                <div className="p-6 text-2xl font-extrabold border-b border-indigo-700">
                    Cloud Finance
                </div>

                <div className="flex flex-col space-y-2 p-4 flex-grow">
                    <Link
                        to="/dashboard"
                        className="px-4 py-2 text-sm font-medium rounded-lg hover:bg-indigo-700 transition"
                    >
                        Dashboard
                    </Link>
                    <Link
                        to="/budgets"
                        className="px-4 py-2 text-sm font-medium rounded-lg hover:bg-indigo-700 transition"
                    >
                        Budgets
                    </Link>
                    <Link
                        to="/transactions"
                        className="px-4 py-2 text-sm font-medium rounded-lg hover:bg-indigo-700 transition"
                    >
                        Transactions
                    </Link>
                </div>

                <div className="p-4 border-t border-indigo-700">
                    <p className="text-sm text-indigo-200 mb-2">
                        Logged in as: <span className="font-semibold">{username}</span>
                    </p>
                    <button
                        onClick={logout}
                        className="w-full py-2 px-4 text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 transition"
                    >
                        Logout
                    </button>
                </div>
            </nav>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
    );
};

// Main App Component
const AppContent: React.FC = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<LoginPage />} />
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <Layout>
                                <DashboardPage />
                            </Layout>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/budgets"
                    element={
                        <ProtectedRoute>
                            <Layout>
                                <BudgetsPage />
                            </Layout>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/transactions"
                    element={
                        <ProtectedRoute>
                            <Layout>
                                <TransactionsPage />
                            </Layout>
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </BrowserRouter>
    );
};

export const App = () => (
    <AuthProvider>
        <AppContent />
    </AuthProvider>
);

export default App;
