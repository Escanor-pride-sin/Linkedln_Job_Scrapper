// Core expense types
export interface Expense {
  id: string;
  amount: number;
  description: string;
  category: string;
  subcategory?: string;
  merchant?: string;
  location?: string;
  date: string;
  createdAt: string;
  updatedAt: string;
  confidenceScore?: number;
  voiceInput: boolean;
  currency: string;
  userId: string;
}

export interface CreateExpenseInput {
  description: string;
  amount?: number;
  category?: string;
  subcategory?: string;
  merchant?: string;
  location?: string;
  date?: string;
  voiceInput?: boolean;
}

export interface UpdateExpenseInput {
  amount?: number;
  description?: string;
  category?: string;
  subcategory?: string;
  merchant?: string;
  location?: string;
  date?: string;
}

// AI Processing types
export interface AIProcessingRequest {
  transcript: string;
  userContext?: {
    recentCategories: string[];
    spendingPatterns: Record<string, number>;
    preferences: UserPreferences;
  };
}

export interface ExpenseExtractionResult {
  amount: number;
  currency: string;
  merchant: string;
  description: string;
  category: string;
  subcategory?: string;
  date: string;
  confidence: number;
  extractedEntities: {
    amount?: string;
    merchant?: string;
    location?: string;
    time?: string;
  };
}

export interface VoiceProcessingResult {
  transcript: string;
  expenseData: ExpenseExtractionResult;
  success: boolean;
  error?: string;
}

// Dashboard types
export interface SpendingStats {
  total: number;
  byCategory: CategoryStats[];
  trends: TrendData[];
  count: number;
  averageExpense: number;
}

export interface CategoryStats {
  category: string;
  amount: number;
  percentage: number;
  count: number;
  color: string;
  trend?: 'up' | 'down' | 'stable';
}

export interface TrendData {
  period: string;
  amount: number;
  count: number;
  categories: Record<string, number>;
}

export interface DateRange {
  startDate: string;
  endDate: string;
}

// Category types
export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
  createdAt: string;
  userId: string;
}

export interface CreateCategoryInput {
  name: string;
  color?: string;
  icon?: string;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// User preferences
export interface UserPreferences {
  currency: string;
  defaultCategories: string[];
  voiceEnabled: boolean;
  notifications: boolean;
  dateFormat: string;
  theme: 'light' | 'dark' | 'auto';
}

// Chart data types
export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string;
  borderWidth?: number;
  fill?: boolean;
}

// Validation types
export interface ValidationError {
  field: string;
  message: string;
}

export interface FormErrors {
  [key: string]: string | undefined;
}

// Voice recognition types
export interface VoiceRecognitionState {
  isListening: boolean;
  isSupported: boolean;
  transcript: string;
  interimTranscript: string;
  error?: string;
}

// Filter and search types
export interface ExpenseFilters {
  category?: string;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  search?: string;
  voiceInput?: boolean;
}

export interface SortOptions {
  field: 'date' | 'amount' | 'description' | 'category';
  direction: 'asc' | 'desc';
}