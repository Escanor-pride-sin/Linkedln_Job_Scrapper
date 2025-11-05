import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/shared/Layout';
import { Dashboard } from './components/Dashboard/Dashboard';
import { VoiceExpenseInput } from './components/VoiceExpenseInput/VoiceExpenseInput';
import { ExpenseList } from './components/Expenses/ExpenseList';
import { Settings } from './components/Settings/Settings';
import { ExpenseProvider } from './context/ExpenseContext';
import { ToastContainer } from './components/shared/ToastContainer';
import { ExpenseProviderWithToast } from './context/ExpenseProviderWithToast';

function App() {
  return (
    <ExpenseProviderWithToast>
      <div className="min-h-screen bg-gray-50">
        <Layout>
          <Routes>
            <Route
              path="/"
              element={<Dashboard />}
            />
            <Route
              path="/add"
              element={<VoiceExpenseInput />}
            />
            <Route
              path="/expenses"
              element={<ExpenseList />}
            />
            <Route
              path="/settings"
              element={<Settings />}
            />
          </Routes>
        </Layout>

        {/* Toast Notifications */}
        <ToastContainer />
      </div>
    </ExpenseProviderWithToast>
  );
}

export default App;