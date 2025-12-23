import React, { useState, useEffect } from 'react';
import { Transaction, transactionApi } from '../services/api';
import { format } from 'date-fns';

interface TransactionListProps {
    onEdit?: (transaction: Transaction) => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({ onEdit }) => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL');

    const fetchTransactions = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await transactionApi.getAll();
            setTransactions(response.data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch transactions');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, []);

    const handleDelete = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this transaction?')) {
            return;
        }

        try {
            await transactionApi.delete(id);
            setTransactions(transactions.filter(t => t.id !== id));
        } catch (err: any) {
            alert('Failed to delete transaction: ' + (err.response?.data?.message || err.message));
        }
    };

    const formatCurrency = (value: number) =>
        `$${value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;

    const filteredTransactions = transactions.filter(t => {
        if (filter === 'ALL') return true;
        return t.type === filter;
    });

    if (loading) {
        return (
            <div className="flex justify-center items-center p-8">
                <div className="text-gray-500">Loading transactions...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
                {error}
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Filter Buttons */}
            <div className="flex gap-2">
                <button
                    onClick={() => setFilter('ALL')}
                    className={`px-4 py-2 rounded-lg font-medium transition ${filter === 'ALL'
                            ? 'bg-indigo-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                >
                    All
                </button>
                <button
                    onClick={() => setFilter('INCOME')}
                    className={`px-4 py-2 rounded-lg font-medium transition ${filter === 'INCOME'
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                >
                    Income
                </button>
                <button
                    onClick={() => setFilter('EXPENSE')}
                    className={`px-4 py-2 rounded-lg font-medium transition ${filter === 'EXPENSE'
                            ? 'bg-red-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                >
                    Expenses
                </button>
            </div>

            {/* Transaction Table */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <table className="w-full">
                    <thead className="bg-indigo-600 text-white">
                        <tr>
                            <th className="px-6 py-3 text-left text-sm font-semibold">Date</th>
                            <th className="px-6 py-3 text-left text-sm font-semibold">Description</th>
                            <th className="px-6 py-3 text-left text-sm font-semibold">Category</th>
                            <th className="px-6 py-3 text-left text-sm font-semibold">Type</th>
                            <th className="px-6 py-3 text-right text-sm font-semibold">Amount</th>
                            <th className="px-6 py-3 text-center text-sm font-semibold">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {filteredTransactions.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                    No transactions found. Create your first transaction!
                                </td>
                            </tr>
                        ) : (
                            filteredTransactions.map((transaction) => (
                                <tr key={transaction.id} className="hover:bg-gray-50 transition">
                                    <td className="px-6 py-4 text-sm text-gray-700">
                                        {format(new Date(transaction.transactionDate), 'MMM dd, yyyy')}
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                        {transaction.description}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {transaction.category}
                                    </td>
                                    <td className="px-6 py-4 text-sm">
                                        <span
                                            className={`px-3 py-1 rounded-full text-xs font-semibold ${transaction.type === 'INCOME'
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-red-100 text-red-700'
                                                }`}
                                        >
                                            {transaction.type}
                                        </span>
                                    </td>
                                    <td className={`px-6 py-4 text-sm font-bold text-right ${transaction.type === 'INCOME' ? 'text-green-600' : 'text-red-600'
                                        }`}>
                                        {transaction.type === 'INCOME' ? '+' : '-'}{formatCurrency(transaction.amount)}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-center">
                                        <div className="flex justify-center gap-2">
                                            {onEdit && (
                                                <button
                                                    onClick={() => onEdit(transaction)}
                                                    className="text-indigo-600 hover:text-indigo-800 font-medium"
                                                >
                                                    Edit
                                                </button>
                                            )}
                                            <button
                                                onClick={() => transaction.id && handleDelete(transaction.id)}
                                                className="text-red-600 hover:text-red-800 font-medium"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                    <p className="text-sm text-green-700 font-medium">Total Income</p>
                    <p className="text-2xl font-bold text-green-600">
                        {formatCurrency(
                            transactions
                                .filter(t => t.type === 'INCOME')
                                .reduce((sum, t) => sum + t.amount, 0)
                        )}
                    </p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-500">
                    <p className="text-sm text-red-700 font-medium">Total Expenses</p>
                    <p className="text-2xl font-bold text-red-600">
                        {formatCurrency(
                            transactions
                                .filter(t => t.type === 'EXPENSE')
                                .reduce((sum, t) => sum + t.amount, 0)
                        )}
                    </p>
                </div>
            </div>
        </div>
    );
};
