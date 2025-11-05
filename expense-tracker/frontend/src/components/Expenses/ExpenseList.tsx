import React, { useState } from 'react';
import { useExpense } from '../../context/ExpenseContext';
import { Expense } from '../../../../shared/types';
import { format } from 'date-fns';
import { Search, Filter, Edit2, Trash2, Mic, Calendar } from 'lucide-react';

export const ExpenseList: React.FC = () => {
  const { state, actions } = useExpense();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [editingExpense, setEditingExpense] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await actions.deleteExpense(id);
      } catch (error) {
        console.error('Failed to delete expense:', error);
      }
    }
  };

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense.id);
    // TODO: Implement edit functionality
    console.log('Edit expense:', expense);
  };

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

  const filteredExpenses = state.expenses.filter(expense => {
    const matchesSearch = expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (expense.merchant && expense.merchant.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = !selectedCategory || expense.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">All Expenses</h1>
          <p className="text-gray-600 mt-1">
            {state.totalCount} total expense{state.totalCount !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div>
            <div className="relative">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search expenses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input pl-10"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="form-input"
            >
              <option value="">All Categories</option>
              <option value="Food & Drink">Food & Drink</option>
              <option value="Transportation">Transportation</option>
              <option value="Shopping">Shopping</option>
              <option value="Entertainment">Entertainment</option>
              <option value="Health & Wellness">Health & Wellness</option>
              <option value="Bills & Utilities">Bills & Utilities</option>
              <option value="Travel">Travel</option>
              <option value="Education">Education</option>
              <option value="Personal Care">Personal Care</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {state.error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{state.error}</p>
          <button
            onClick={actions.clearError}
            className="mt-2 text-red-600 hover:text-red-800 text-sm"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Expenses List */}
      {state.loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow-sm animate-pulse">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div>
                    <div className="w-40 h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="w-32 h-3 bg-gray-200 rounded"></div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="w-24 h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="w-20 h-3 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredExpenses.length === 0 ? (
        <div className="bg-white p-12 rounded-lg shadow-sm text-center">
          <p className="text-gray-500 text-lg">No expenses found</p>
          <p className="text-gray-400 mt-2">
            {searchTerm || selectedCategory
              ? 'Try adjusting your filters'
              : 'Start adding expenses to see them here'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredExpenses.map((expense) => (
            <div
              key={expense.id}
              className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {/* Icon */}
                  <div className="flex-shrink-0">
                    {expense.voiceInput ? (
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <Mic size={20} className="text-blue-600" />
                      </div>
                    ) : (
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                        <Calendar size={20} className="text-gray-600" />
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-semibold text-gray-900">
                        {expense.description}
                      </h3>
                      {expense.voiceInput && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                          Voice
                        </span>
                      )}
                    </div>

                    <div className="flex items-center space-x-3 text-sm text-gray-600">
                      {expense.merchant && (
                        <span>{expense.merchant}</span>
                      )}
                      <span className={getCategoryColor(expense.category)}>
                        {expense.category}
                      </span>
                      <span>
                        {format(new Date(expense.date), 'MMM d, yyyy')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Amount and Actions */}
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-xl font-bold text-gray-900">
                      {formatCurrency(expense.amount)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {format(new Date(expense.createdAt), 'MMM d')}
                    </p>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(expense)}
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                      title="Edit expense"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(expense.id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete expense"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {state.totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2 mt-8">
          <button
            onClick={() => actions.setPage(Math.max(1, state.currentPage - 1))}
            disabled={state.currentPage === 1}
            className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">
            Page {state.currentPage} of {state.totalPages}
          </span>
          <button
            onClick={() => actions.setPage(Math.min(state.totalPages, state.currentPage + 1))}
            disabled={state.currentPage === state.totalPages}
            className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};