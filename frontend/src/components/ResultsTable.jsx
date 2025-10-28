import React, { useState } from 'react';

function ResultsTable({ results, onExport }) {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortedResults = () => {
    if (!sortConfig.key) return results;

    const sorted = [...results].sort((a, b) => {
      let aValue, bValue;

      switch (sortConfig.key) {
        case 'poster':
          aValue = a.posterName.toLowerCase();
          bValue = b.posterName.toLowerCase();
          break;
        case 'roleLocation':
          aValue = `${a.jobTitle} ${a.location}`.toLowerCase();
          bValue = `${b.jobTitle} ${b.location}`.toLowerCase();
          break;
        case 'datePosted':
          aValue = new Date(a.datePosted).getTime();
          bValue = new Date(b.datePosted).getTime();
          break;
        default:
          return 0;
      }

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });

    return sorted;
  };

  const formatDate = (isoString) => {
    try {
      const date = new Date(isoString);
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const month = months[date.getMonth()];
      const day = date.getDate();
      const year = date.getFullYear();
      return `${month} ${day}, ${year}`;
    } catch (error) {
      return 'Unknown';
    }
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return '↕️';
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  };

  if (!results || results.length === 0) {
    return (
      <div className="empty-state">
        No posts found. Try adjusting your search criteria.
      </div>
    );
  }

  const sortedResults = getSortedResults();

  return (
    <div className="results-container">
      <div className="results-header">
        <h2>Search Results ({results.length} posts found)</h2>
        <button className="export-button" onClick={onExport}>
          📥 Export to Excel
        </button>
      </div>

      <div className="table-wrapper">
        <table className="results-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('poster')} className="sortable">
                Poster {getSortIcon('poster')}
              </th>
              <th onClick={() => handleSort('roleLocation')} className="sortable">
                Role & Location {getSortIcon('roleLocation')}
              </th>
              <th onClick={() => handleSort('datePosted')} className="sortable">
                Date Posted {getSortIcon('datePosted')}
              </th>
              <th>Hiring Intent</th>
              <th>Post URL</th>
            </tr>
          </thead>
          <tbody>
            {sortedResults.map((result, index) => (
              <tr key={result.id || index}>
                <td>
                  <div className="poster-cell">
                    <div className="poster-name">{result.posterName}</div>
                    <div className="poster-title">{result.posterTitle}</div>
                  </div>
                </td>
                <td>
                  <div className="role-location-cell">
                    <div className="job-title">{result.jobTitle}</div>
                    <div className="location">{result.location}</div>
                  </div>
                </td>
                <td>{formatDate(result.datePosted)}</td>
                <td className="hiring-intent-cell">{result.hiringIntent}</td>
                <td>
                  <a
                    href={result.postUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="view-post-link"
                  >
                    View Post
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ResultsTable;
