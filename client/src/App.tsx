import React, { useState, useEffect, useContext, createContext, useCallback } from 'react';
import { Buffer } from 'buffer'; // FIX: Explicitly import Buffer polyfill for browser environment

// ---Global Type Definitions & Constants---

/** Defines the shape of the user's authentication data. */
interface AuthState {
  isAuthenticated: boolean;
  username: string | null;
  password: string | null;
  // Encoded base64 string for Authorization header
  authHeader: string | null; 
}

/** Defines the functions exposed by the Auth Context. */
interface AuthContextType extends AuthState {
  login: (username: string, password: string) => void;
  logout: () => void;
}

/** Defines the current page for simple state-based routing. */
type Page = 'dashboard' | 'budgets' | 'transactions';

/** Defines the structure of a budget object. NOTE: Backend uses BigDecimal, so frontend uses string/number. */
interface Budget {
  id: number;
  name: string;
  amount: number; // Stored as a number in TS for easier calculation
  spent: number;  // Stored as a number in TS for easier calculation
  category: string;
}

// The default generated password from your Spring Security log:
const DEFAULT_GENERATED_PASSWORD = '4555c6e4-ffcf-4e08-a7fa-4facefb9e5a8';
const API_URL_TEST = '/api/test';
const API_URL_BUDGETS = '/api/budgets';


// Authentication Context and Logic

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const initialAuthState: AuthState = {
  isAuthenticated: false,
  username: null,
  password: null,
  authHeader: null,
};

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>(initialAuthState);

  const login = useCallback((username: string, password: string) => {
    // Generate the Basic Auth header value
    const base64Credentials = Buffer.from(`${username}:${password}`).toString('base64');
    const authHeader = `Basic ${base64Credentials}`;

    setAuthState({
      isAuthenticated: true,
      username,
      password,
      authHeader,
    });
  }, []);

  const logout = useCallback(() => {
    // Clear credentials and state
    setAuthState(initialAuthState);
  }, []);

  const value = { ...authState, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// === API Utility Function ===

/** Tests connectivity to the backend /api/test endpoint. */
const testBackendConnection = async (authHeader: string | null): Promise<string> => {
    if (!authHeader) {
        return "Not Authenticated. Cannot run test.";
    }

    try {
        const response = await fetch(API_URL_TEST, {
            method: 'GET',
            headers: {
                'Authorization': authHeader
            }
        });

        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                return `Authentication Failed (Status: ${response.status}). Check credentials.`;
            }
            const errorText = await response.text();
            throw new Error(`HTTP error! Status: ${response.status}. Response: ${errorText.substring(0, 100)}...`);
        }

        return await response.text();
    } catch (e) {
        if (e instanceof Error) {
            return `Connection Error: ${e.message}. Is your backend running on 5050?`;
        }
        return 'An unknown error occurred during connection test.';
    }
};

// === Feature Components: UI, Logic, and State ===

/** Login Component */
const LoginComponent: React.FC = () => {
  const { login, isAuthenticated } = useAuth();
  const [username, setUsername] = useState('user');
  const [password, setPassword] = useState(DEFAULT_GENERATED_PASSWORD);
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(username, password);
    setMessage('Attempting login...');
  };

  useEffect(() => {
      if (isAuthenticated) {
          setMessage('Login successful! Redirecting to Dashboard...');
      }
  }, [isAuthenticated]);
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-2xl border-t-4 border-indigo-600">
        <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-6">
          Financial Manager Login
        </h2>
        
        {isAuthenticated ? (
            <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-green-700 font-semibold">{message}</p>
                <p className="text-sm text-gray-500 mt-2">Credentials stored. Click Dashboard to proceed.</p>
            </div>
        ) : (
            <>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                            Username (default: user)
                        </label>
                        <input
                            id="username"
                            name="username"
                            type="text"
                            required
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            placeholder="Enter username"
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                            Password
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            placeholder="Enter generated password"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out"
                    >
                        Sign In (Store Credentials)
                    </button>
                </form>
                <p className="mt-6 text-xs text-gray-500 text-center">
                    Note: Using Spring Security's in-memory user. Password must match the log: 
                    <code className="bg-gray-200 p-1 rounded text-xs">{DEFAULT_GENERATED_PASSWORD}</code>
                </p>
            </>
        )}
      </div>
    </div>
  );
};

/** Dashboard Component (Placeholder) */
const DashboardComponent: React.FC = () => {
    const { authHeader } = useAuth();
    const [status, setStatus] = useState<string>('Checking backend...');

    useEffect(() => {
        // Test connection every time the dashboard loads or authHeader changes
        testBackendConnection(authHeader).then(setStatus);
    }, [authHeader]);

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard Overview</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Connection Status Card */}
                <div className="md:col-span-3 bg-white p-6 rounded-xl shadow-lg border-l-4 border-green-500">
                    <h2 className="text-xl font-semibold text-gray-700 mb-2">Backend Connectivity Check</h2>
                    <p className="text-sm text-gray-600">
                        {status.includes("Connection Error") || status.includes("Authentication Failed") ? (
                            <span className="text-red-600 font-bold">{status}</span>
                        ) : (
                            <span className="text-green-600 font-bold">{status}</span>
                        )}
                    </p>
                </div>

                {/* Placeholder Cards */}
                <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-indigo-500">
                    <h2 className="text-xl font-semibold text-gray-700">Total Balance</h2>
                    <p className="text-3xl font-extrabold text-indigo-600 mt-2">$0.00</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-yellow-500">
                    <h2 className="text-xl font-semibold text-gray-700">Monthly Budget (Remaining)</h2>
                    <p className="text-3xl font-extrabold text-yellow-600 mt-2">$0.00</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-red-500">
                    <h2 className="text-xl font-semibold text-gray-700">Pending Transactions</h2>
                    <p className="text-3xl font-extrabold text-red-600 mt-2">0</p>
                </div>
            </div>
        </div>
    );
};

/** Budgets Component */
const BudgetsComponent: React.FC = () => {
    const { authHeader } = useAuth();
    const [budgets, setBudgets] = useState<Budget[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Function to fetch budgets from the Spring Boot API
    const fetchBudgets = useCallback(async () => {
        if (!authHeader) {
            setError("Authentication required to fetch budgets.");
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);
        
        try {
            const response = await fetch(API_URL_BUDGETS, {
                headers: { 'Authorization': authHeader },
            });

            if (!response.ok) {
                const errorBody = await response.text();
                throw new Error(`Failed to fetch budgets: ${response.status} - ${errorBody.substring(0, 50)}...`);
            }
            
            // The JSON response from the backend contains BigDecimal which is read as strings by JavaScript.
            // We map the array to convert 'amount' and 'spent' to numbers for calculations.
            const data: any[] = await response.json();
            const formattedBudgets: Budget[] = data.map(b => ({
                id: b.id,
                name: b.name,
                category: b.category,
                // Convert BigDecimal strings to floating point numbers
                amount: parseFloat(b.amount),
                spent: parseFloat(b.spent) 
            }));

            setBudgets(formattedBudgets);

        } catch (e) {
            const message = e instanceof Error ? e.message : "An unknown error occurred.";
            setError(`Error fetching budgets: ${message}`);
        } finally {
            setLoading(false);
        }
    }, [authHeader]);

    useEffect(() => {
        // Only fetch when authenticated
        if (authHeader) {
            fetchBudgets();
        }
    }, [fetchBudgets, authHeader]);
    
    const formatCurrency = (value: number) => `$${value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
    const getRemaining = (budget: Budget) => budget.amount - budget.spent;
    const getPercentage = (budget: Budget) => Math.round((budget.spent / budget.amount) * 100);

    return (
        <div className="p-6">
            <header className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Budget Management</h1>
                <button
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-indigo-700 transition duration-150"
                    onClick={() => console.log('Open Add Budget Modal')} // Placeholder for Add functionality
                >
                    + Add New Budget
                </button>
            </header>

            {loading && <p className="text-center text-gray-500 p-8">Loading budgets from Spring Boot API...</p>}
            {error && <p className="text-center text-red-600 bg-red-100 p-3 rounded-lg">{error}</p>}
            
            <div className="space-y-4">
                {budgets.map((budget) => {
                    const remaining = getRemaining(budget);
                    const percentage = getPercentage(budget);
                    const isOverspent = remaining < 0;

                    return (
                        <div 
                            key={budget.id} 
                            className="bg-white p-5 rounded-xl shadow-lg border-l-8 border-indigo-500 hover:shadow-xl transition-shadow duration-300"
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-800">{budget.name}</h2>
                                    <p className="text-sm text-gray-500">{budget.category}</p>
                                </div>
                                <div className="text-right">
                                    <span className={`px-3 py-1 text-sm font-bold rounded-full ${isOverspent ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
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
                                    <p className={`text-gray-500 ${isOverspent ? 'text-red-600' : 'text-green-600'}`}>Remaining</p>
                                    <p className={`text-xl font-extrabold ${isOverspent ? 'text-red-600' : 'text-green-600'}`}>
                                        {formatCurrency(Math.abs(remaining))}
                                    </p>
                                </div>
                            </div>
                            
                            {/* Progress Bar */}
                            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-4">
                                <div 
                                    className={`h-2.5 rounded-full ${percentage > 100 ? 'bg-red-500' : percentage >= 80 ? 'bg-yellow-500' : 'bg-indigo-500'}`}
                                    style={{ width: `${Math.min(percentage, 100)}%` }}
                                ></div>
                            </div>
                            <p className="text-xs text-right text-gray-500 mt-1">{percentage}% Used</p>
                        </div>
                    );
                })}
                {!loading && budgets.length === 0 && !error && (
                    <p className="text-center text-gray-500 p-8 border-2 border-dashed rounded-xl">No budgets found. Check your backend logs or database connection.</p>
                )}
            </div>
        </div>
    );
};


/** Transactions Component (Placeholder) */
const TransactionsComponent: React.FC = () => (
    <div className="p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Transaction History</h1>
        <p className="text-gray-600">Placeholder for transaction logging and history review.</p>
    </div>
);


// === Main App Structure and Router ===

const AppContent: React.FC = () => {
    const { isAuthenticated, logout, username } = useAuth();
    const [page, setPage] = useState<Page>('dashboard');

    // Simple view router
    const renderPage = () => {
        switch (page) {
            case 'dashboard':
                return <DashboardComponent />;
            case 'budgets':
                return <BudgetsComponent />;
            case 'transactions':
                return <TransactionsComponent />;
            default:
                return <DashboardComponent />;
        }
    };

    const NavButton: React.FC<{ target: Page, label: string }> = ({ target, label }) => (
        <button
            onClick={() => setPage(target)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-150 ${
                page === target 
                ? 'bg-indigo-700 text-white shadow-md' 
                : 'text-indigo-200 hover:bg-indigo-700 hover:text-white'
            }`}
        >
            {label}
        </button>
    );

    if (!isAuthenticated) {
        // If not authenticated, force the Login page
        return <LoginComponent />;
    }

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar Navigation */}
            <nav className="flex flex-col w-64 bg-indigo-800 text-white shadow-xl">
                <div className="p-6 text-2xl font-extrabold border-b border-indigo-700">
                    Cloud Finance
                </div>
                
                <div className="flex flex-col space-y-2 p-4 flex-grow">
                    <NavButton target="dashboard" label="Dashboard" />
                    <NavButton target="budgets" label="Budgets" />
                    <NavButton target="transactions" label="Transactions" />
                </div>

                <div className="p-4 border-t border-indigo-700">
                    <p className="text-sm text-indigo-200 mb-2">Logged in as: <span className="font-semibold">{username}</span></p>
                    <button
                        onClick={logout}
                        className="w-full py-2 px-4 text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 transition duration-150 ease-in-out"
                    >
                        Logout
                    </button>
                </div>
            </nav>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto">
                {renderPage()}
            </main>
        </div>
    );
};

export const App = () => (
    <AuthProvider>
        <AppContent />
    </AuthProvider>
);

export default App;
