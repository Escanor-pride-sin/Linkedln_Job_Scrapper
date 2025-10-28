import React, { useState } from 'react';
import SearchForm from './components/SearchForm';
import ResultsTable from './components/ResultsTable';
import ErrorMessage from './components/ErrorMessage';
import { searchLinkedInPosts, exportToExcel } from './services/api';
import './App.css';

function App() {
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (searchParams) => {
    setError(null);
    setSearchResults([]);
    setIsLoading(true);

    try {
      const response = await searchLinkedInPosts(searchParams);
      if (response.success) {
        setSearchResults(response.results);
      } else {
        setError(response.error || 'Search failed');
      }
    } catch (err) {
      setError(err.message);
      // Auto-dismiss error after 10 seconds
      setTimeout(() => setError(null), 10000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      await exportToExcel(searchResults);
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(null), 10000);
    }
  };

  const handleDismissError = () => {
    setError(null);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>LinkedIn Job Post Scraper</h1>
        <p className="subtitle">Find hiring posts from LinkedIn, filtered by role and location</p>
      </header>

      <main className="app-main">
        <SearchForm onSearch={handleSearch} />

        {error && (
          <ErrorMessage error={error} onDismiss={handleDismissError} />
        )}

        {searchResults.length > 0 && (
          <ResultsTable results={searchResults} onExport={handleExport} />
        )}
      </main>
    </div>
  );
}

export default App;
