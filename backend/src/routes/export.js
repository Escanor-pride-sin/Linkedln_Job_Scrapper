const express = require('express');
const ExcelExporter = require('../utils/ExcelExporter');

const router = express.Router();

// POST /api/export
router.post('/', async (req, res) => {
  try {
    const { results } = req.body;

    // Validation
    if (!Array.isArray(results)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or empty results data'
      });
    }

    if (results.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or empty results data'
      });
    }

    if (results.length > 50) {
      return res.status(400).json({
        success: false,
        error: 'Too many results. Maximum 50 allowed.'
      });
    }

    // Generate Excel file
    const excelExporter = new ExcelExporter();
    const buffer = await excelExporter.generateExcel(results);

    // Set response headers for file download
    const timestamp = Date.now();
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="linkedin-jobs-${timestamp}.xlsx"`);

    // Send file
    return res.send(buffer);

  } catch (error) {
    console.error('Error in export route:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Failed to generate Excel file'
    });
  }
});

module.exports = router;
