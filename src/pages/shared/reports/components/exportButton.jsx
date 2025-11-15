import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

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
  const handleExport = async () => {
    if (!data) {
      alert("No data to export");
      return;
    }

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
      saveAs(blob, fileName.endsWith(".xlsx") ? fileName : `${fileName}.xlsx`);
    }
  };

  const isDisabled = () => {
    if (disabled) return true;
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
      className="btn btn-outline btn-sm"
    >
      Export to Excel
    </button>
  );
}

/**
 * Creates a worksheet with:
 * - Styled headers
 * - Auto column width
 */
function createStyledSheet(workbook, data, sheetName) {
  const worksheet = workbook.addWorksheet(sheetName);

  if (data.length === 0) return;

  // Get headers from first data object
  const headers = Object.keys(data[0]);

  // Add header row with styling
  const headerRow = worksheet.addRow(headers);
  headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
  headerRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF4472C4" },
  };
  headerRow.alignment = { horizontal: "center", vertical: "middle" };
  headerRow.border = {
    top: { style: "thin", color: { argb: "FFCCCCCC" } },
    bottom: { style: "thin", color: { argb: "FFCCCCCC" } },
    left: { style: "thin", color: { argb: "FFCCCCCC" } },
    right: { style: "thin", color: { argb: "FFCCCCCC" } },
  };

  // Add data rows
  data.forEach((item) => {
    const row = [];
    headers.forEach((header) => {
      row.push(item[header] || "");
    });
    worksheet.addRow(row);
  });

  // Auto column width based on longest content
  worksheet.columns = headers.map((header) => {
    const maxContent = data.reduce((max, row) => {
      const value = row[header] ? row[header].toString() : "";
      return Math.max(max, value.length);
    }, header.length);
    return { 
      key: header, 
      width: Math.min(maxContent + 3, 50) 
    };
  });
}
