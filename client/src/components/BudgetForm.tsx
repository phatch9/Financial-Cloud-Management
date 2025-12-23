import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Budget, budgetApi } from '../services/api';

interface BudgetFormProps {
    budget?: Budget;
    onSuccess: () => void;
    onCancel: () => void;
}

type BudgetFormData = Omit<Budget, 'id' | 'spent'>;

export const BudgetForm: React.FC<BudgetFormProps> = ({
    budget,
    onSuccess,
    onCancel,
}) => {
    const [loading, setLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<BudgetFormData>({
        defaultValues: budget || {
            name: '',
            category: '',
            amount: 0,
        },
    });

    const onSubmit = async (data: BudgetFormData) => {
        setLoading(true);

        try {
            const formattedData = {
                ...data,
                amount: Number(data.amount),
            };

            if (budget?.id) {
                await budgetApi.update(budget.id, formattedData);
            } else {
                await budgetApi.create(formattedData);
            }

            onSuccess();
        } catch (err: any) {
            alert('Failed to save budget: ' + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">
                    {budget ? 'Edit Budget' : 'New Budget'}
                </h2>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Budget Name *
                        </label>
                        <input
                            {...register('name', { required: 'Budget name is required' })}
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="e.g., Cloud Compute (AWS)"
                        />
                        {errors.name && (
                            <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>
                        )}
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

                    {/* Amount */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Budget Amount *
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

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-indigo-700 disabled:bg-gray-400 transition"
                        >
                            {loading ? 'Saving...' : budget ? 'Update' : 'Create'}
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
