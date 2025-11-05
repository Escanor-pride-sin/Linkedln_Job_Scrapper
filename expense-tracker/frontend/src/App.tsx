import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/shared/Layout';
import { Dashboard } from './components/Dashboard/Dashboard';
import { VoiceExpenseInput } from './components/VoiceExpenseInput/VoiceExpenseInput';
import { ExpenseList } from './components/Expenses/ExpenseList';
import { Settings } from './components/Settings/Settings';
import { ExpenseProvider } from './context/ExpenseContext';
import { Toast } from './components/shared/Toast';
import { useToast } from './hooks/useToast';

function App() {
  const { toast, showToast, hideToast } = useToast();

  return (
    <ExpenseProvider>
      <div className="min-h-screen bg-gray-50">
        <Layout>
          <Routes>
            <Route
              path="/"
              element={<Dashboard showToast={showToast} />}
            />
            <Route
              path="/add"
              element={<VoiceExpenseInput showToast={showToast} />}
            />
            <Route
              path="/expenses"
              element={<ExpenseList showToast={showToast} />}
            />
            <Route
              path="/settings"
              element={<Settings />}
            />
          </Routes>
        </Layout>

        {/* Toast Notifications */}
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={hideToast}
          />
        )}
      </div>
    </ExpenseProvider>
  );
}

export default App;