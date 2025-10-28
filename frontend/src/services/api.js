import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Search LinkedIn posts
export const searchLinkedInPosts = async (searchParams) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/scrape`, searchParams);
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      throw new Error(error.response.data.error || 'Search failed');
    }
    throw new Error('Backend server unavailable. Check if server is running.');
  }
};

// Export results to Excel
export const exportToExcel = async (results) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/export`, { results }, {
      responseType: 'blob'
    });

    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `linkedin-jobs-${Date.now()}.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    return { success: true };
  } catch (error) {
    if (error.response && error.response.data) {
      throw new Error(error.response.data.error || 'Export failed');
    }
    throw new Error('Failed to export to Excel');
  }
};
