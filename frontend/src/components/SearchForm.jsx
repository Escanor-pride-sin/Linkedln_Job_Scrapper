import React, { useState } from 'react';

function SearchForm({ onSearch }) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'Data Analyst',
    location: 'Bangalore',
    timeRange: 'Last 24 hours',
    maxResults: 10
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validateField = (name, value) => {
    let error = '';

    switch (name) {
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value) {
          error = 'Valid email required';
        } else if (!emailRegex.test(value)) {
          error = 'Valid email required';
        }
        break;

      case 'password':
        if (!value) {
          error = 'Password required';
        }
        break;

      case 'role':
        if (!value.trim()) {
          error = 'Job role required';
        }
        break;

      case 'location':
        if (!value.trim()) {
          error = 'Location required';
        }
        break;

      default:
        break;
    }

    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const error = validateField(name, value);
    if (error) {
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    newErrors.email = validateField('email', formData.email);
    newErrors.password = validateField('password', formData.password);
    newErrors.role = validateField('role', formData.role);
    newErrors.location = validateField('location', formData.location);

    // Remove empty errors
    Object.keys(newErrors).forEach(key => {
      if (!newErrors[key]) delete newErrors[key];
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    await onSearch(formData);
    setIsLoading(false);
  };

  const isFormValid = () => {
    return formData.email && formData.password && formData.role.trim() && formData.location.trim();
  };

  return (
    <div className="search-form-container">
      <div className="security-notice">
        ⚠️ Your credentials are sent directly to LinkedIn and not stored. They're used only for this search session.
      </div>

      <form className="search-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">LinkedIn Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="your-email@example.com"
            disabled={isLoading}
          />
          {errors.email && <span className="error-text">{errors.email}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="password">LinkedIn Password</label>
          <div className="password-input-wrapper">
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Your LinkedIn password"
              disabled={isLoading}
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
              disabled={isLoading}
            >
              {showPassword ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>
          {errors.password && <span className="error-text">{errors.password}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="role">Job Role</label>
          <input
            type="text"
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="e.g., Data Analyst, Software Engineer"
            disabled={isLoading}
          />
          {errors.role && <span className="error-text">{errors.role}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="location">Location</label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="e.g., Bangalore, London, Remote"
            disabled={isLoading}
          />
          {errors.location && <span className="error-text">{errors.location}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="timeRange">Time Range</label>
          <select
            id="timeRange"
            name="timeRange"
            value={formData.timeRange}
            onChange={handleChange}
            disabled={isLoading}
          >
            <option value="Last 24 hours">Last 24 hours</option>
            <option value="Last Week">Last Week</option>
            <option value="Last Month">Last Month</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="maxResults">Max Results</label>
          <input
            type="number"
            id="maxResults"
            name="maxResults"
            value={formData.maxResults}
            onChange={handleChange}
            min="1"
            max="50"
            disabled={isLoading}
          />
          <span className="help-text">Number of posts to return (default: 10)</span>
        </div>

        <button
          type="submit"
          className="submit-button"
          disabled={isLoading || !isFormValid()}
        >
          {isLoading ? (
            <>
              <span className="spinner"></span>
              Searching...
            </>
          ) : (
            'Search LinkedIn Posts'
          )}
        </button>
      </form>
    </div>
  );
}

export default SearchForm;
