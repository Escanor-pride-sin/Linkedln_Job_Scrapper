import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Expense, CreateExpenseInput, UpdateExpenseInput, ExpenseFilters, SpendingStats } from '../../../../shared/types';
import { expenseApi } from '../services/apiService';

interface ExpenseState {
  expenses: Expense[];
  stats: SpendingStats | null;
  loading: boolean;
  error: string | null;
  filters: ExpenseFilters;
  currentPage: number;
  totalPages: number;
  totalCount: number;
}

type ExpenseAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_EXPENSES'; payload: { expenses: Expense[]; totalPages: number; totalCount: number } }
  | { type: 'ADD_EXPENSE'; payload: Expense }
  | { type: 'UPDATE_EXPENSE'; payload: { id: string; expense: Expense } }
  | { type: 'DELETE_EXPENSE'; payload: string }
  | { type: 'SET_STATS'; payload: SpendingStats }
  | { type: 'SET_FILTERS'; payload: ExpenseFilters }
  | { type: 'SET_PAGE'; payload: number }
  | { type: 'CLEAR_ERROR' };

const initialState: ExpenseState = {
  expenses: [],
  stats: null,
  loading: false,
  error: null,
  filters: {},
  currentPage: 1,
  totalPages: 1,
  totalCount: 0,
};

const expenseReducer = (state: ExpenseState, action: ExpenseAction): ExpenseState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'SET_EXPENSES':
      return {
        ...state,
        expenses: action.payload.expenses,
        totalPages: action.payload.totalPages,
        totalCount: action.payload.totalCount,
        loading: false,
        error: null
      };
    case 'ADD_EXPENSE':
      return {
        ...state,
        expenses: [action.payload, ...state.expenses],
        totalCount: state.totalCount + 1,
        loading: false,
        error: null
      };
    case 'UPDATE_EXPENSE':
      return {
        ...state,
        expenses: state.expenses.map(expense =>
          expense.id === action.payload.id ? action.payload.expense : expense
        ),
        loading: false,
        error: null
      };
    case 'DELETE_EXPENSE':
      return {
        ...state,
        expenses: state.expenses.filter(expense => expense.id !== action.payload),
        totalCount: state.totalCount - 1,
        loading: false,
        error: null
      };
    case 'SET_STATS':
      return { ...state, stats: action.payload };
    case 'SET_FILTERS':
      return { ...state, filters: action.payload, currentPage: 1 };
    case 'SET_PAGE':
      return { ...state, currentPage: action.payload };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
};

interface ExpenseContextType {
  state: ExpenseState;
  actions: {
    fetchExpenses: (page?: number, filters?: ExpenseFilters) => Promise<void>;
    createExpense: (data: CreateExpenseInput) => Promise<Expense>;
    updateExpense: (id: string, data: UpdateExpenseInput) => Promise<Expense>;
    deleteExpense: (id: string) => Promise<void>;
    fetchStats: (period?: 'day' | 'week' | 'month' | 'year') => Promise<void>;
    setFilters: (filters: ExpenseFilters) => void;
    setPage: (page: number) => void;
    clearError: () => void;
    processVoiceTranscript: (transcript: string) => Promise<any>;
  };
}

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

interface ExpenseProviderProps {
  children: ReactNode;
}

export const ExpenseProvider: React.FC<ExpenseProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(expenseReducer, initialState);

  const fetchExpenses = async (page: number = state.currentPage, filters: ExpenseFilters = state.filters) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await expenseApi.getExpenses(page, 20, filters, {
        field: 'date',
        direction: 'desc'
      });

      if (response.success && response.data) {
        dispatch({
          type: 'SET_EXPENSES',
          payload: {
            expenses: response.data,
            totalPages: response.pagination.totalPages,
            totalCount: response.pagination.total
          }
        });
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.error || 'Failed to fetch expenses' });
      }
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.error || 'Failed to fetch expenses' });
    }
  };

  const createExpense = async (data: CreateExpenseInput): Promise<Expense> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await expenseApi.createExpense(data);

      if (response.success && response.data) {
        dispatch({ type: 'ADD_EXPENSE', payload: response.data });
        return response.data;
      } else {
        const error = response.error || 'Failed to create expense';
        dispatch({ type: 'SET_ERROR', payload: error });
        throw new Error(error);
      }
    } catch (error: any) {
      const errorMessage = error.error || 'Failed to create expense';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    }
  };

  const updateExpense = async (id: string, data: UpdateExpenseInput): Promise<Expense> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await expenseApi.updateExpense(id, data);

      if (response.success && response.data) {
        dispatch({
          type: 'UPDATE_EXPENSE',
          payload: { id, expense: response.data }
        });
        return response.data;
      } else {
        const error = response.error || 'Failed to update expense';
        dispatch({ type: 'SET_ERROR', payload: error });
        throw new Error(error);
      }
    } catch (error: any) {
      const errorMessage = error.error || 'Failed to update expense';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    }
  };

  const deleteExpense = async (id: string): Promise<void> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await expenseApi.deleteExpense(id);

      if (response.success) {
        dispatch({ type: 'DELETE_EXPENSE', payload: id });
      } else {
        const error = response.error || 'Failed to delete expense';
        dispatch({ type: 'SET_ERROR', payload: error });
        throw new Error(error);
      }
    } catch (error: any) {
      const errorMessage = error.error || 'Failed to delete expense';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    }
  };

  const fetchStats = async (period: 'day' | 'week' | 'month' | 'year' = 'month') => {
    try {
      const response = await expenseApi.getStats(period);

      if (response.success && response.data) {
        dispatch({ type: 'SET_STATS', payload: response.data });
      }
    } catch (error: any) {
      console.error('Failed to fetch stats:', error);
      // Don't set error for stats, just log it
    }
  };

  const setFilters = (filters: ExpenseFilters) => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
  };

  const setPage = (page: number) => {
    dispatch({ type: 'SET_PAGE', payload: page });
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const processVoiceTranscript = async (transcript: string) => {
    try {
      const response = await expenseApi.processVoiceTranscript(transcript);
      return response;
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.error || 'Failed to process voice input' });
      throw error;
    }
  };

  const actions = {
    fetchExpenses,
    createExpense,
    updateExpense,
    deleteExpense,
    fetchStats,
    setFilters,
    setPage,
    clearError,
    processVoiceTranscript
  };

  // Initial data fetch
  useEffect(() => {
    fetchExpenses();
    fetchStats();
  }, []);

  // Refetch expenses when filters or page changes
  useEffect(() => {
    fetchExpenses();
  }, [state.filters, state.currentPage]);

  const value = { state, actions };

  return (
    <ExpenseContext.Provider value={value}>
      {children}
    </ExpenseContext.Provider>
  );
};

export const useExpense = (): ExpenseContextType => {
  const context = useContext(ExpenseContext);
  if (context === undefined) {
    throw new Error('useExpense must be used within an ExpenseProvider');
  }
  return context;
};