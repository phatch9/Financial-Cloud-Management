import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Transaction } from '../services/api';

interface SpendingChartProps {
    transactions: Transaction[];
}

const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6'];

export const SpendingChart: React.FC<SpendingChartProps> = ({ transactions }) => {
    // Group expenses by category
    const expensesByCategory = transactions
        .filter(t => t.type === 'EXPENSE')
        .reduce((acc, transaction) => {
            const category = transaction.category;
            if (!acc[category]) {
                acc[category] = 0;
            }
            acc[category] += transaction.amount;
            return acc;
        }, {} as Record<string, number>);

    // Convert to array format for Recharts
    const data = Object.entries(expensesByCategory).map(([name, value]) => ({
        name,
        value,
    }));

    if (data.length === 0) {
        return (
            <div className="bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Spending by Category</h3>
                <div className="flex items-center justify-center h-64 text-gray-500">
                    No expense data available
                </div>
            </div>
        );
    }

    const formatCurrency = (value: number) =>
        `$${value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Spending by Category</h3>
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>

            {/* Category breakdown */}
            <div className="mt-4 space-y-2">
                {data.map((item, index) => (
                    <div key={item.name} className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <div
                                className="w-4 h-4 rounded"
                                style={{ backgroundColor: COLORS[index % COLORS.length] }}
                            />
                            <span className="text-sm text-gray-700">{item.name}</span>
                        </div>
                        <span className="text-sm font-semibold text-gray-900">
                            {formatCurrency(item.value)}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};
