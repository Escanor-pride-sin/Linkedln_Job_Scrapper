const ExcelJS = require('exceljs');

class ExcelExporter {
  // Format date from ISO to readable format
  formatDate(isoString) {
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
  }

  // Generate Excel file from results
  async generateExcel(results) {
    try {
      // Create workbook
      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'LinkedIn Job Scraper';
      workbook.created = new Date();

      // Add worksheet
      const worksheet = workbook.addWorksheet('LinkedIn Job Posts');

      // Define columns
      worksheet.columns = [
        { header: 'Poster', key: 'poster', width: 25 },
        { header: 'Role & Location', key: 'roleLocation', width: 30 },
        { header: 'Date Posted', key: 'datePosted', width: 15 },
        { header: 'Hiring Intent', key: 'hiringIntent', width: 50 },
        { header: 'Post URL', key: 'postUrl', width: 40 }
      ];

      // Style header row
      const headerRow = worksheet.getRow(1);
      headerRow.font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' }, name: 'Arial' };
      headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '0077B5' } // LinkedIn blue
      };
      headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
      headerRow.height = 30;

      // Add borders to header
      headerRow.eachCell(cell => {
        cell.border = {
          top: { style: 'thin', color: { argb: '00000000' } },
          left: { style: 'thin', color: { argb: '00000000' } },
          bottom: { style: 'thin', color: { argb: '00000000' } },
          right: { style: 'thin', color: { argb: '00000000' } }
        };
      });

      // Add data rows
      results.forEach((result, index) => {
        // Prepare data
        const poster = result.posterTitle && result.posterTitle !== 'N/A'
          ? `${result.posterName} - ${result.posterTitle}`
          : result.posterName;

        const roleLocation = `${result.jobTitle}, ${result.location}`;
        const datePosted = this.formatDate(result.datePosted);
        const hiringIntent = result.hiringIntent || 'N/A';

        // Add row
        const row = worksheet.addRow({
          poster,
          roleLocation,
          datePosted,
          hiringIntent,
          postUrl: 'View Post'
        });

        // Style data row
        row.font = { size: 11, name: 'Arial', color: { argb: '00000000' } };
        row.alignment = { vertical: 'top', horizontal: 'left', wrapText: true };

        // Alternating row colors
        if ((index + 2) % 2 === 0) {
          row.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFFFFFF' } // White
          };
        } else {
          row.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF5F5F5' } // Light gray
          };
        }

        // Add borders
        row.eachCell(cell => {
          cell.border = {
            top: { style: 'thin', color: { argb: 'FFD3D3D3' } },
            left: { style: 'thin', color: { argb: 'FFD3D3D3' } },
            bottom: { style: 'thin', color: { argb: 'FFD3D3D3' } },
            right: { style: 'thin', color: { argb: 'FFD3D3D3' } }
          };
        });

        // Set URL cell as hyperlink
        const urlCell = row.getCell('postUrl');
        urlCell.value = {
          text: 'View Post',
          hyperlink: result.postUrl
        };
        urlCell.font = {
          size: 11,
          name: 'Arial',
          color: { argb: '0066CC' },
          underline: true
        };
      });

      // Generate buffer
      const buffer = await workbook.xlsx.writeBuffer();
      return buffer;

    } catch (error) {
      console.error('Excel generation error:', error.message);
      throw new Error('Failed to generate Excel file');
    }
  }
}

module.exports = ExcelExporter;
