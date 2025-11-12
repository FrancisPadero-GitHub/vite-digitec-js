import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export default function ExcelExportButton({ data, fileName = "export.xlsx", sheetName = "Sheet1", disabled }) {
  const handleExport = () => {
    // Check if data is valid
    if (!data) {
      alert("No data to export");
      return;
    }

    // Check if data is an object with multiple sheets or a simple array
    const isMultiSheet = typeof data === 'object' && !Array.isArray(data);
    
    if (isMultiSheet) {
      // Handle multiple sheets
      const hasData = Object.values(data).some(sheet => Array.isArray(sheet) && sheet.length > 0);
      if (!hasData) {
        alert("No data to export");
        return;
      }

      // Create workbook
      const workbook = XLSX.utils.book_new();

      // Add each sheet
      Object.entries(data).forEach(([key, sheetData]) => {
        if (Array.isArray(sheetData) && sheetData.length > 0) {
          const worksheet = XLSX.utils.json_to_sheet(sheetData);
          const sheetTitle = key.charAt(0).toUpperCase() + key.slice(1);
          XLSX.utils.book_append_sheet(workbook, worksheet, sheetTitle);
        }
      });

      // Convert workbook to binary array
      const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });

      // Create a blob and trigger download
      const blob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      saveAs(blob, fileName.endsWith(".xlsx") ? fileName : `${fileName}.xlsx`);
    } else {
      // Handle single sheet (original behavior)
      if (!Array.isArray(data) || data.length === 0) {
        alert("No data to export");
        return;
      }

      // Create worksheet from data
      const worksheet = XLSX.utils.json_to_sheet(data);

      // Create workbook and append worksheet
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

      // Convert workbook to binary array
      const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });

      // Create a blob and trigger download
      const blob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      saveAs(blob, fileName.endsWith(".xlsx") ? fileName : `${fileName}.xlsx`);
    }
  };

  // Check if button should be disabled
  const isDisabled = () => {
    if (disabled) return true;
    if (!data) return true;
    
    // Check if data is an object with multiple sheets
    if (typeof data === 'object' && !Array.isArray(data)) {
      return !Object.values(data).some(sheet => Array.isArray(sheet) && sheet.length > 0);
    }
    
    // Check if data is a simple array
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
