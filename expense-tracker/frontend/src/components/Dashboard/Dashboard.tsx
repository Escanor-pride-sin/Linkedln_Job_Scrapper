import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useExpense } from '../../context/ExpenseContext';
import { useToastContext } from '../../context/ToastContext';
import { MetricsCards } from './MetricsCards';
import { SpendingChart } from './SpendingChart';
import { CategoryBreakdown } from './CategoryBreakdown';
import { RecentTransactions } from './RecentTransactions';
import { Plus, TrendingUp, DollarSign, Calendar } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { state, actions } = useExpense();
  const { showError } = useToastContext();

  useEffect(() => {
    actions.fetchStats();
  }, []);

  const today = new Date();
  const thisMonth = today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Expense Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Track your spending and manage your budget
          </p>
        </div>
        <Link
          to="/add"
          className="btn btn-primary flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>Add Expense</span>
        </Link>
      </div>

      {/* Metrics Cards */}
      <MetricsCards stats={state.stats} loading={state.loading} />

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SpendingChart loading={state.loading} />
        <CategoryBreakdown stats={state.stats} loading={state.loading} />
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Recent Transactions</h2>
          <Link
            to="/expenses"
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            View All
          </Link>
        </div>
        <RecentTransactions limit={5} />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          to="/add"
          className="bg-blue-50 p-4 rounded-lg hover:bg-blue-100 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <div className="bg-blue-500 p-2 rounded-lg">
              <Plus size={20} className="text-white" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Add Expense</p>
              <p className="text-sm text-gray-600">Quick entry</p>
            </div>
          </div>
        </Link>

        <Link
          to="/expenses"
          className="bg-green-50 p-4 rounded-lg hover:bg-green-100 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <div className="bg-green-500 p-2 rounded-lg">
              <TrendingUp size={20} className="text-white" />
            </div>
            <div>
              <p className="font-medium text-gray-900">View All</p>
              <p className="text-sm text-gray-600">All expenses</p>
            </div>
          </div>
        </Link>

        <div className="bg-purple-50 p-4 rounded-lg hover:bg-purple-100 transition-colors cursor-pointer">
          <div className="flex items-center space-x-3">
            <div className="bg-purple-500 p-2 rounded-lg">
              <Calendar size={20} className="text-white" />
            </div>
            <div>
              <p className="font-medium text-gray-900">{thisMonth}</p>
              <p className="text-sm text-gray-600">Monthly view</p>
            </div>
          </div>
        </div>

        <div className="bg-orange-50 p-4 rounded-lg hover:bg-orange-100 transition-colors cursor-pointer">
          <div className="flex items-center space-x-3">
            <div className="bg-orange-500 p-2 rounded-lg">
              <DollarSign size={20} className="text-white" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Budget</p>
              <p className="text-sm text-gray-600">Set limits</p>
            </div>
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
    </div>
  );
};