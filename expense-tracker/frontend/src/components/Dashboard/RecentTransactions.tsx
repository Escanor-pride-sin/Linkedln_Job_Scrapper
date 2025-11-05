import React, { useEffect } from 'react';
import { useExpense } from '../../context/ExpenseContext';
import { Expense } from '../../../../shared/types';
import { format } from 'date-fns';
import { Edit2, Trash2, Mic, Calendar } from 'lucide-react';

interface RecentTransactionsProps {
  limit?: number;
}

export const RecentTransactions: React.FC<RecentTransactionsProps> = ({ limit = 10 }) => {
  const { state, actions } = useExpense();

  useEffect(() => {
    actions.fetchExpenses(1, { limit: limit.toString() } as any);
  }, [limit]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Food & Drink': 'bg-blue-100 text-blue-800',
      'Transportation': 'bg-green-100 text-green-800',
      'Shopping': 'bg-purple-100 text-purple-800',
      'Entertainment': 'bg-yellow-100 text-yellow-800',
      'Health & Wellness': 'bg-red-100 text-red-800',
      'Bills & Utilities': 'bg-gray-100 text-gray-800',
      'Travel': 'bg-indigo-100 text-indigo-800',
      'Education': 'bg-pink-100 text-pink-800',
      'Personal Care': 'bg-orange-100 text-orange-800',
      'Other': 'bg-gray-100 text-gray-800'
    };
    return colors[category] || colors['Other'];
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await actions.deleteExpense(id);
      } catch (error) {
        console.error('Failed to delete expense:', error);
      }
    }
  };

  const recentExpenses = state.expenses.slice(0, limit);

  if (state.loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div>
                  <div className="w-32 h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="w-24 h-3 bg-gray-200 rounded"></div>
                </div>
              </div>
              <div className="text-right">
                <div className="w-20 h-4 bg-gray-200 rounded mb-2"></div>
                <div className="w-16 h-3 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (recentExpenses.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No recent transactions</p>
        <p className="text-sm text-gray-400 mt-1">Start adding expenses to see them here</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {recentExpenses.map((expense) => (
        <TransactionItem
          key={expense.id}
          expense={expense}
          getCategoryColor={getCategoryColor}
          formatCurrency={formatCurrency}
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
};

interface TransactionItemProps {
  expense: Expense;
  getCategoryColor: (category: string) => string;
  formatCurrency: (amount: number) => string;
  onDelete: (id: string) => void;
}

const TransactionItem: React.FC<TransactionItemProps> = ({
  expense,
  getCategoryColor,
  formatCurrency,
  onDelete
}) => {
  const [isExpanded, setIsExpanded] = React.useState(false);

  const handleEdit = () => {
    // TODO: Implement edit functionality
    console.log('Edit expense:', expense.id);
  };

  return (
    <div
      className="border-b border-gray-100 pb-4 last:border-0 hover:bg-gray-50 rounded-lg p-3 transition-colors cursor-pointer"
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Icon for voice input */}
          <div className="flex-shrink-0">
            {expense.voiceInput ? (
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Mic size={18} className="text-blue-600" />
              </div>
            ) : (
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                <Calendar size={18} className="text-gray-600" />
              </div>
            )}
          </div>

          {/* Expense Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <p className="font-medium text-gray-900 truncate">
                {expense.description}
              </p>
              {expense.voiceInput && (
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                  Voice
                </span>
              )}
            </div>

            <div className="flex items-center space-x-3 text-sm text-gray-600">
              {expense.merchant && (
                <span className="truncate">{expense.merchant}</span>
              )}
              <span className={getCategoryColor(expense.category)}>
                {expense.category}
              </span>
              <span className="text-gray-400">
                {format(new Date(expense.date), 'MMM d, yyyy')}
              </span>
            </div>
          </div>
        </div>

        {/* Amount and Actions */}
        <div className="flex items-center space-x-3">
          <div className="text-right">
            <p className="font-semibold text-gray-900">
              {formatCurrency(expense.amount)}
            </p>
            {expense.confidenceScore && (
              <p className="text-xs text-gray-500">
                {Math.round(expense.confidenceScore * 100)}% confidence
              </p>
            )}
          </div>

          <div className="flex space-x-1 opacity-0 hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleEdit();
              }}
              className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
              title="Edit expense"
            >
              <Edit2 size={16} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(expense.id);
              }}
              className="p-2 text-gray-400 hover:text-red-600 transition-colors"
              title="Delete expense"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="grid grid-cols-2 gap-4 text-sm">
            {expense.location && (
              <div>
                <span className="font-medium text-gray-700">Location:</span>
                <span className="ml-2 text-gray-600">{expense.location}</span>
              </div>
            )}
            {expense.subcategory && (
              <div>
                <span className="font-medium text-gray-700">Subcategory:</span>
                <span className="ml-2 text-gray-600">{expense.subcategory}</span>
              </div>
            )}
            <div>
              <span className="font-medium text-gray-700">Added:</span>
              <span className="ml-2 text-gray-600">
                {format(new Date(expense.createdAt), 'MMM d, yyyy h:mm a')}
              </span>
            </div>
            {expense.updatedAt !== expense.createdAt && (
              <div>
                <span className="font-medium text-gray-700">Updated:</span>
                <span className="ml-2 text-gray-600">
                  {format(new Date(expense.updatedAt), 'MMM d, yyyy h:mm a')}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};