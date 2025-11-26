import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { useState } from "react";
import PropTypes from "prop-types";

/**
 * Enhanced Excel export button with:
 * - Styled headers
 * - Auto column width
 * - Multi-sheet or single-sheet support
 */
export default function ExcelExportButton({
  data,
  fileName = "export.xlsx",
  sheetName = "Sheet1",
  disabled,
}) {
  const [isExporting, setIsExporting] = useState(false);
  const handleExport = async () => {
    if (!data) {
      alert("No data to export");
      return;
    }

    setIsExporting(true);
    
    try {
      // Allow UI to update before heavy Excel generation
      await new Promise(resolve => setTimeout(resolve, 100));

      const isMultiSheet = typeof data === "object" && !Array.isArray(data);

    if (isMultiSheet) {
      const hasData = Object.values(data).some(
        (sheet) => Array.isArray(sheet) && sheet.length > 0
      );
      if (!hasData) {
        alert("No data to export");
        return;
      }

      const workbook = new ExcelJS.Workbook();

      Object.entries(data).forEach(([key, sheetData]) => {
        if (Array.isArray(sheetData) && sheetData.length > 0) {
          const sheetTitle = key.charAt(0).toUpperCase() + key.slice(1);
          createStyledSheet(workbook, sheetData, sheetTitle);
        }
      });

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      
      // Small delay before save to ensure UI updates
      await new Promise(resolve => setTimeout(resolve, 50));
      saveAs(blob, fileName.endsWith(".xlsx") ? fileName : `${fileName}.xlsx`);
    } else {
      if (!Array.isArray(data) || data.length === 0) {
        alert("No data to export");
        return;
      }

      const workbook = new ExcelJS.Workbook();
      createStyledSheet(workbook, data, sheetName);

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      
      // Small delay before save to ensure UI updates
      await new Promise(resolve => setTimeout(resolve, 50));
      saveAs(blob, fileName.endsWith(".xlsx") ? fileName : `${fileName}.xlsx`);
    }
    } catch (err) {
      console.error('Error generating Excel file:', err);
      alert('Failed to generate Excel file. Check console for details.');
    } finally {
      setIsExporting(false);
    }
  };

  const isDisabled = () => {
    if (disabled) return true;
    if (isExporting) return true;
    if (!data) return true;
    if (typeof data === "object" && !Array.isArray(data)) {
      return !Object.values(data).some(
        (sheet) => Array.isArray(sheet) && sheet.length > 0
      );
    }
    return !Array.isArray(data) || data.length === 0;
  };

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={isDisabled()}
      className={`btn btn-outline btn-sm ${isExporting ? 'opacity-75 cursor-not-allowed' : ''}`}
      title={isExporting ? 'Generating Excel file...' : 'Export to Excel file'}
      aria-busy={isExporting}
      aria-disabled={isDisabled()}
    >
      {isExporting ? (
        <span className="flex items-center gap-2">
          <span className="loading loading-spinner loading-xs"></span>
          Exporting...
        </span>
      ) : (
        'Export to Excel'
      )}
    </button>
  );
}

ExcelExportButton.propTypes = {
  data: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.object
  ]),
  fileName: PropTypes.string,
  sheetName: PropTypes.string,
  disabled: PropTypes.bool,
};

/**
 * Creates a worksheet with:
 * - Styled headers
 * - Auto column width
 */
function createStyledSheet(workbook, data, sheetName) {
  const worksheet = workbook.addWorksheet(sheetName);

  if (!data.length) return;

  const firstRealRow = data.find(row => !row.__type);
  if (!firstRealRow) return;

  const headers = Object.keys(firstRealRow);
  const headerRow = worksheet.addRow(headers);

  headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
  headerRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF4472C4" }
  };
  headerRow.alignment = { horizontal: "center", vertical: "middle" };
  headerRow.border = {
    top: { style: "thin", color: { argb: "FFCCCCCC" } },
    bottom: { style: "thin", color: { argb: "FFCCCCCC" } },
    left: { style: "thin", color: { argb: "FFCCCCCC" } },
    right: { style: "thin", color: { argb: "FFCCCCCC" } }
  };

  data.forEach(item => {
    if (item.__type === "gap") {
      worksheet.addRow([]);
      return;
    }

    if (item.__type === "total") {
      const row = worksheet.addRow([item.label, item.value]);

      row.font = { bold: true };
      row.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFF2F2F2" }
      };
      row.getCell(2).font = { bold: true, color: { argb: "FF000000" } };

      return;
    }

    const row = worksheet.addRow(headers.map(h => item[h] || ""));
    row.alignment = { vertical: "middle" };
  });

  worksheet.columns = headers.map(header => {
    const max = Math.max(
      header.length,
      ...data.map(row =>
        row[header] ? row[header].toString().length : 0
      )
    );
    return { key: header, width: Math.min(max + 3, 50) };
  });
}
