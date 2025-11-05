import React, { useState } from 'react';
import { useExpense } from '../../context/ExpenseContext';
import { useToastContext } from '../../context/ToastContext';
import { VoiceInput } from '../VoiceInput/VoiceInput';
import { ManualExpenseForm } from '../Expenses/ManualExpenseForm';
import { Mic, Edit3 } from 'lucide-react';

export const VoiceExpenseInput: React.FC = () => {
  const [mode, setMode] = useState<'voice' | 'manual'>('voice');
  const { actions } = useExpense();
  const { showSuccess, showError } = useToastContext();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleVoiceTranscript = async (transcript: string) => {
    setIsProcessing(true);
    try {
      const result = await actions.processVoiceTranscript(transcript);

      if (result.success && result.data) {
        const expense = await actions.createExpense({
          description: result.data.expenseData.description,
          amount: result.data.expenseData.amount,
          category: result.data.expenseData.category,
          subcategory: result.data.expenseData.subcategory,
          merchant: result.data.expenseData.merchant,
          voiceInput: true,
          date: result.data.expenseData.date
        });

        showSuccess(`Expense of $${expense.amount} added successfully!`);
        // Reset form or redirect as needed
      } else {
        showError(result.error || 'Failed to process voice input');
      }
    } catch (error: any) {
      showError(error.message || 'Failed to add expense');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Add New Expense
        </h1>
        <p className="text-gray-600">
          Use your voice or manual form to track your expenses
        </p>
      </div>

      {/* Mode Toggle */}
      <div className="flex justify-center">
        <div className="bg-gray-100 p-1 rounded-lg flex">
          <button
            onClick={() => setMode('voice')}
            className={`
              flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium
              transition-colors duration-200
              ${mode === 'voice'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
              }
            `}
          >
            <Mic size={18} />
            <span>Voice Input</span>
          </button>
          <button
            onClick={() => setMode('manual')}
            className={`
              flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium
              transition-colors duration-200
              ${mode === 'manual'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
              }
            `}
          >
            <Edit3 size={18} />
            <span>Manual Entry</span>
          </button>
        </div>
      </div>

      {/* Content Based on Mode */}
      <div className="bg-white rounded-lg shadow-md p-6">
        {mode === 'voice' ? (
          <VoiceInput
            onTranscriptComplete={handleVoiceTranscript}
            disabled={isProcessing}
            placeholder="Tap the microphone and speak your expense"
          />
        ) : (
          <ManualExpenseForm onSuccess={() => showSuccess('Expense added successfully!')} />
        )}
      </div>

      {/* Processing Overlay */}
      {isProcessing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <span className="text-lg font-medium">Processing your expense...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};