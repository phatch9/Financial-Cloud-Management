import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Transaction, transactionApi, Budget, budgetApi } from '../services/api';

interface TransactionFormProps {
    transaction?: Transaction;
    onSuccess: () => void;
    onCancel: () => void;
}

type TransactionFormData = Omit<Transaction, 'id'>;

export const TransactionForm: React.FC<TransactionFormProps> = ({
    transaction,
    onSuccess,
    onCancel,
}) => {
    const [budgets, setBudgets] = useState<Budget[]>([]);
    const [loading, setLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<TransactionFormData>({
        defaultValues: transaction || {
            description: '',
            amount: 0,
            category: '',
            transactionDate: new Date().toISOString().slice(0, 16),
            type: 'EXPENSE',
            budgetId: undefined,
        },
    });

    useEffect(() => {
        // Fetch budgets for the dropdown
        budgetApi.getAll()
            .then(response => setBudgets(response.data))
            .catch(err => console.error('Failed to fetch budgets:', err));
    }, []);

    const onSubmit = async (data: TransactionFormData) => {
        setLoading(true);

        try {
            // Convert budgetId to number or undefined
            const formattedData = {
                ...data,
                amount: Number(data.amount),
                budgetId: data.budgetId ? Number(data.budgetId) : undefined,
            };

            if (transaction?.id) {
                await transactionApi.update(transaction.id, formattedData);
            } else {
                await transactionApi.create(formattedData);
            }

            onSuccess();
        } catch (err: any) {
            alert('Failed to save transaction: ' + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">
                    {transaction ? 'Edit Transaction' : 'New Transaction'}
                </h2>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description *
                        </label>
                        <input
                            {...register('description', { required: 'Description is required' })}
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="e.g., AWS EC2 Instance"
                        />
                        {errors.description && (
                            <p className="text-red-600 text-sm mt-1">{errors.description.message}</p>
                        )}
                    </div>

                    {/* Amount and Type */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Amount *
                            </label>
                            <input
                                {...register('amount', {
                                    required: 'Amount is required',
                                    min: { value: 0.01, message: 'Amount must be greater than 0' },
                                })}
                                type="number"
                                step="0.01"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="0.00"
                            />
                            {errors.amount && (
                                <p className="text-red-600 text-sm mt-1">{errors.amount.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Type *
                            </label>
                            <select
                                {...register('type', { required: true })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="EXPENSE">Expense</option>
                                <option value="INCOME">Income</option>
                            </select>
                        </div>
                    </div>

                    {/* Category */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Category *
                        </label>
                        <input
                            {...register('category', { required: 'Category is required' })}
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="e.g., Infrastructure, Software, Hardware"
                        />
                        {errors.category && (
                            <p className="text-red-600 text-sm mt-1">{errors.category.message}</p>
                        )}
                    </div>

                    {/* Transaction Date */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Transaction Date *
                        </label>
                        <input
                            {...register('transactionDate', { required: 'Date is required' })}
                            type="datetime-local"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        {errors.transactionDate && (
                            <p className="text-red-600 text-sm mt-1">{errors.transactionDate.message}</p>
                        )}
                    </div>

                    {/* Budget (Optional) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Link to Budget (Optional)
                        </label>
                        <select
                            {...register('budgetId')}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="">-- No Budget --</option>
                            {budgets.map((budget) => (
                                <option key={budget.id} value={budget.id}>
                                    {budget.name} ({budget.category})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-indigo-700 disabled:bg-gray-400 transition"
                        >
                            {loading ? 'Saving...' : transaction ? 'Update' : 'Create'}
                        </button>
                        <button
                            type="button"
                            onClick={onCancel}
                            className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-300 transition"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
