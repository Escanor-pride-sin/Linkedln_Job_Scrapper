import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useExpense } from '../../context/ExpenseContext';
import { CreateExpenseInput } from '../../../../shared/types';

interface ManualExpenseFormProps {
  onSuccess?: () => void;
  initialData?: Partial<CreateExpenseInput>;
}

export const ManualExpenseForm: React.FC<ManualExpenseFormProps> = ({
  onSuccess,
  initialData
}) => {
  const { actions } = useExpense();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue
  } = useForm<CreateExpenseInput>({
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      ...initialData
    }
  });

  const onSubmit = async (data: CreateExpenseInput) => {
    setIsSubmitting(true);
    try {
      await actions.createExpense(data);
      reset();
      onSuccess?.();
    } catch (error) {
      console.error('Failed to create expense:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories = [
    'Food & Drink',
    'Transportation',
    'Shopping',
    'Entertainment',
    'Health & Wellness',
    'Bills & Utilities',
    'Travel',
    'Education',
    'Personal Care',
    'Other'
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Amount */}
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
            Amount *
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
              $
            </span>
            <input
              type="number"
              id="amount"
              step="0.01"
              min="0"
              className={`form-input pl-8 ${errors.amount ? 'error' : ''}`}
              placeholder="0.00"
              {...register('amount', {
                required: 'Amount is required',
                min: { value: 0.01, message: 'Amount must be greater than 0' },
                valueAsNumber: true
              })}
            />
          </div>
          {errors.amount && (
            <p className="error-message">{errors.amount.message}</p>
          )}
        </div>

        {/* Date */}
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
            Date *
          </label>
          <input
            type="date"
            id="date"
            className={`form-input ${errors.date ? 'error' : ''}`}
            {...register('date', {
              required: 'Date is required'
            })}
          />
          {errors.date && (
            <p className="error-message">{errors.date.message}</p>
          )}
        </div>
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Description *
        </label>
        <input
          type="text"
          id="description"
          className={`form-input ${errors.description ? 'error' : ''}`}
          placeholder="What did you spend money on?"
          {...register('description', {
            required: 'Description is required',
            minLength: { value: 3, message: 'Description must be at least 3 characters' }
          })}
        />
        {errors.description && (
          <p className="error-message">{errors.description.message}</p>
        )}
      </div>

      {/* Merchant */}
      <div>
        <label htmlFor="merchant" className="block text-sm font-medium text-gray-700 mb-1">
          Merchant / Store
        </label>
        <input
          type="text"
          id="merchant"
          className="form-input"
          placeholder="Where did you spend it?"
          {...register('merchant')}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Category */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
            Category *
          </label>
          <select
            id="category"
            className={`form-input ${errors.category ? 'error' : ''}`}
            {...register('category', {
              required: 'Category is required'
            })}
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          {errors.category && (
            <p className="error-message">{errors.category.message}</p>
          )}
        </div>

        {/* Subcategory */}
        <div>
          <label htmlFor="subcategory" className="block text-sm font-medium text-gray-700 mb-1">
            Subcategory
          </label>
          <input
            type="text"
            id="subcategory"
            className="form-input"
            placeholder="Optional subcategory"
            {...register('subcategory')}
          />
        </div>
      </div>

      {/* Location */}
      <div>
        <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
          Location
        </label>
        <input
          type="text"
          id="location"
          className="form-input"
          placeholder="Where did this expense occur?"
          {...register('location')}
        />
      </div>

      {/* Submit Button */}
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={() => reset()}
          className="btn btn-outline"
          disabled={isSubmitting}
        >
          Clear
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Adding Expense...' : 'Add Expense'}
        </button>
      </div>
    </form>
  );
};