import axios, { AxiosResponse, AxiosError } from 'axios';
import {
  Expense,
  CreateExpenseInput,
  UpdateExpenseInput,
  ExpenseFilters,
  SpendingStats,
  VoiceProcessingResult,
  ApiResponse,
  PaginatedResponse,
  SortOptions
} from '../../../../shared/types';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  timeout: 30000, // 30 seconds timeout for AI processing
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('🚨 API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error: AxiosError) => {
    console.error('🚨 API Response Error:', {
      status: error.response?.status,
      url: error.config?.url,
      message: error.response?.data?.error || error.message
    });

    // Transform error to a more usable format
    if (error.response?.data) {
      return Promise.reject(error.response.data);
    }
    return Promise.reject(error);
  }
);

// Expense API methods
export const expenseApi = {
  // Get expenses with filtering and pagination
  getExpenses: async (
    page: number = 1,
    limit: number = 50,
    filters?: ExpenseFilters,
    sort?: SortOptions
  ): Promise<PaginatedResponse<Expense>> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          params.append(key, value.toString());
        }
      });
    }

    if (sort) {
      params.append('sortBy', sort.field);
      params.append('sortOrder', sort.direction);
    }

    const response = await api.get(`/expenses?${params}`);
    return response.data;
  },

  // Get single expense by ID
  getExpense: async (id: string): Promise<ApiResponse<Expense>> => {
    const response = await api.get(`/expenses/${id}`);
    return response.data;
  },

  // Create new expense
  createExpense: async (data: CreateExpenseInput): Promise<ApiResponse<Expense>> => {
    const response = await api.post('/expenses', data);
    return response.data;
  },

  // Update existing expense
  updateExpense: async (id: string, data: UpdateExpenseInput): Promise<ApiResponse<Expense>> => {
    const response = await api.put(`/expenses/${id}`, data);
    return response.data;
  },

  // Delete expense
  deleteExpense: async (id: string): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/expenses/${id}`);
    return response.data;
  },

  // Get spending statistics
  getStats: async (period: 'day' | 'week' | 'month' | 'year' = 'month'): Promise<ApiResponse<SpendingStats>> => {
    const response = await api.get(`/expenses/stats?period=${period}`);
    return response.data;
  },

  // Process voice transcript with AI
  processVoiceTranscript: async (transcript: string): Promise<ApiResponse<VoiceProcessingResult>> => {
    const response = await api.post('/expenses/process-voice', { transcript });
    return response.data;
  },
};

// Health check
export const healthCheck = async (): Promise<boolean> => {
  try {
    const response = await api.get('/health');
    return response.status === 200;
  } catch {
    return false;
  }
};

// Export default API instance for advanced usage
export default api;