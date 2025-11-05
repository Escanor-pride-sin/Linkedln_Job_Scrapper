import React, { ReactNode } from 'react';
import { ExpenseProvider } from './ExpenseContext';
import { ToastProvider } from './ToastContext';

interface ExpenseProviderWithToastProps {
  children: ReactNode;
}

export const ExpenseProviderWithToast: React.FC<ExpenseProviderWithToastProps> = ({ children }) => {
  return (
    <ToastProvider>
      <ExpenseProvider>
        {children}
      </ExpenseProvider>
    </ToastProvider>
  );
};