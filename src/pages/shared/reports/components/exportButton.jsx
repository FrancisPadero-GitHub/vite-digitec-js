import * as XLSX from "xlsx-js-style";
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
  const handleExport = () => {
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

      const workbook = XLSX.utils.book_new();

      Object.entries(data).forEach(([key, sheetData]) => {
        if (Array.isArray(sheetData) && sheetData.length > 0) {
          const worksheet = createStyledSheet(sheetData);
          const sheetTitle = key.charAt(0).toUpperCase() + key.slice(1);
          XLSX.utils.book_append_sheet(workbook, worksheet, sheetTitle);
        }
      });

      const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
      const blob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      saveAs(blob, fileName.endsWith(".xlsx") ? fileName : `${fileName}.xlsx`);
    } else {
      if (!Array.isArray(data) || data.length === 0) {
        alert("No data to export");
        return;
      }

      const worksheet = createStyledSheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

      const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
      const blob = new Blob([excelBuffer], {
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
function createStyledSheet(data) {
  // Create worksheet from data (headers start at A2)
  const worksheet = XLSX.utils.json_to_sheet(data, { origin: "A2" });

  // Add headers manually (A1 row)
  const headers = Object.keys(data[0]);
  XLSX.utils.sheet_add_aoa(worksheet, [headers], { origin: "A1" });

  // Apply header styles
  headers.forEach((header, i) => {
    const cellAddress = XLSX.utils.encode_cell({ r: 0, c: i });
    if (!worksheet[cellAddress]) return;
    worksheet[cellAddress].s = {
      font: { bold: true, color: { rgb: "FFFFFF" } },
      fill: { fgColor: { rgb: "4472C4" } },
      alignment: { horizontal: "center", vertical: "center" },
      border: {
        top: { style: "thin", color: { rgb: "CCCCCC" } },
        bottom: { style: "thin", color: { rgb: "CCCCCC" } },
        left: { style: "thin", color: { rgb: "CCCCCC" } },
        right: { style: "thin", color: { rgb: "CCCCCC" } },
      },
    };
  });

  // Auto column width based on longest content
  const columnWidths = headers.map((header) => {
    const maxContent = data.reduce((max, row) => {
      const value = row[header] ? row[header].toString() : "";
      return Math.max(max, value.length);
    }, header.length);
    return { wch: Math.min(maxContent + 3, 50) };
  });
  worksheet["!cols"] = columnWidths;

  return worksheet;
}
