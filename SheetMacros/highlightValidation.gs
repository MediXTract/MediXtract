/**
 * TRIGGER CONFIGURATION INSTRUCTIONS:
 * 
 * To set up the trigger for this function:
 * 1. Go to Extensions > Apps Script in your Google Spreadsheet
 * 2. Click on the clock icon (Triggers) in the left sidebar
 * 3. Click "+ Add Trigger" and configure as follows:
 *    - Choose which function to run: highlightValidation
 *    - Which runs at deployment: Head
 *    - Select event source: From spreadsheet
 *    - Select event type: On change
 *    - Failure notification settings: Notify me daily (recommended)
 * 4. Click "Save"
 * 
 * This will automatically run the validation highlighting whenever any cell
 * in the spreadsheet is edited, including when id_neonet values are erased.
 */

function highlightValidation() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const outputSheet = ss.getSheetByName("Output");
  const validationSheet = ss.getSheetByName("Validation");

  const outputData = outputSheet.getDataRange().getValues();
  const validationData = validationSheet.getDataRange().getValues();

  const outputHeaders = outputData[0];
  const validationHeaders = validationData[0];

  const outputIdIndex = outputHeaders.indexOf("id_neonet");
  const validationIdIndex = validationHeaders.indexOf("id_neonet");

  if (outputIdIndex === -1 || validationIdIndex === -1) {
    throw new Error("Missing 'id_neonet' column in one or both sheets.");
  }

  // Build maps from id_neonet to row data for both sheets
  const outputMap = new Map();
  const outputRowsWithIds = new Set(); // Track which rows have valid IDs
  for (let i = 1; i < outputData.length; i++) {
    const row = outputData[i];
    const id = row[outputIdIndex];
    if (id && String(id).trim() !== "") {
      outputMap.set(id, { row: row, rowIndex: i });
      outputRowsWithIds.add(i);
    }
  }

  const validationMap = new Map();
  const validationRowsWithIds = new Set(); // Track which rows have valid IDs
  for (let i = 1; i < validationData.length; i++) {
    const row = validationData[i];
    const id = row[validationIdIndex];
    if (id && String(id).trim() !== "") {
      validationMap.set(id, { row: row, rowIndex: i });
      validationRowsWithIds.add(i);
    }
  }

  // Clear formatting for ALL data rows first
  const outputNumRows = outputData.length - 1;
  const outputNumCols = outputData[0].length;
  if (outputNumRows > 0) {
    outputSheet.getRange(2, 1, outputNumRows, outputNumCols).setBackground(null);
  }

  const validationNumRows = validationData.length - 1;
  const validationNumCols = validationData[0].length;
  if (validationNumRows > 0) {
    validationSheet.getRange(2, 1, validationNumRows, validationNumCols).setBackground(null);
  }

  // Explicitly clear rows that don't have valid id_neonet (empty, null, or whitespace)
  clearRowsWithoutValidIds(outputSheet, outputData, outputRowsWithIds, outputNumCols);
  clearRowsWithoutValidIds(validationSheet, validationData, validationRowsWithIds, validationNumCols);

  // Compare and format Output sheet (only rows with valid IDs)
  for (let i = 1; i < outputData.length; i++) {
    if (!outputRowsWithIds.has(i)) continue; // Skip rows without valid ID
    
    const outputRow = outputData[i];
    const outputId = outputRow[outputIdIndex];

    const validationRowData = validationMap.get(outputId);
    if (!validationRowData) continue;

    const validationRow = validationRowData.row;

    for (let j = 0; j < outputHeaders.length; j++) {
      const colName = outputHeaders[j];
      const valIndex = validationHeaders.indexOf(colName);
      if (valIndex === -1) continue; // skip if column doesn't exist in Validation

      const outputVal = outputRow[j];
      const validationVal = validationRow[valIndex];

      const cell = outputSheet.getRange(i + 1, j + 1);
      if (areValuesEquivalent(outputVal, validationVal)) {
        cell.setBackground("#c6efce"); // green
      } else {
        cell.setBackground("#ffc7ce"); // red
      }
    }
  }

  // Compare and format Validation sheet (only rows with valid IDs)
  for (let i = 1; i < validationData.length; i++) {
    if (!validationRowsWithIds.has(i)) continue; // Skip rows without valid ID
    
    const validationRow = validationData[i];
    const validationId = validationRow[validationIdIndex];

    const outputRowData = outputMap.get(validationId);
    if (!outputRowData) continue;

    const outputRow = outputRowData.row;

    for (let j = 0; j < validationHeaders.length; j++) {
      const colName = validationHeaders[j];
      const outputIndex = outputHeaders.indexOf(colName);
      if (outputIndex === -1) continue; // skip if column doesn't exist in Output

      const validationVal = validationRow[j];
      const outputVal = outputRow[outputIndex];

      const cell = validationSheet.getRange(i + 1, j + 1);
      if (areValuesEquivalent(validationVal, outputVal)) {
        cell.setBackground("#c6efce"); // green
      } else {
        cell.setBackground("#ffc7ce"); // red
      }
    }
  }
}

// Helper function to explicitly clear rows that don't have valid id_neonet
function clearRowsWithoutValidIds(sheet, data, rowsWithIds, numCols) {
  for (let i = 1; i < data.length; i++) {
    if (!rowsWithIds.has(i)) {
      // This row doesn't have a valid ID, ensure it's cleared
      sheet.getRange(i + 1, 1, 1, numCols).setBackground(null);
    }
  }
}

// Helper function to compare values smartly
function areValuesEquivalent(val1, val2) {
  const clean1 = String(val1).replace(",", ".").trim();
  const clean2 = String(val2).replace(",", ".").trim();

  const num1 = parseFloat(clean1);
  const num2 = parseFloat(clean2);

  const isNum1 = !isNaN(num1);
  const isNum2 = !isNaN(num2);

  if (isNum1 && isNum2) {
    return Math.abs(num1 - num2) < 0.00001;
  }

  return clean1 === clean2;
}
