 import XLSX from'xlsx';
import HtmlParser from "./../parser.mjs"
function getRowAsJSON(filePath, rowNumber) {
  const workbook = XLSX.readFile(filePath, { type: 'buffer', cellDates: true });
  const sheetName = workbook.SheetNames[0]; // Assuming there's only one sheet
  const worksheet = workbook.Sheets[sheetName];

  const range = XLSX.utils.decode_range(worksheet['!ref']);
  const totalRows = range.e.r + 1;

  if (rowNumber < 1 || rowNumber > totalRows) {
    throw new Error(`Row number should be between 1 and ${totalRows}.`);
  }

  const rowData = [];

  for (let col = range.s.c; col <= range.e.c; col++) {
    const cellAddress = XLSX.utils.encode_cell({ r: rowNumber - 1, c: col });
    const cell = worksheet[cellAddress];
    let cellValue = cell ? (cell.v !== undefined ? cell.v : null) : null;

    // If the cell contains a date, convert it to a JavaScript Date object
    if (cell && cell.t === 'd' && cell.w) {
      cellValue = new Date(cell.w);
    }

    rowData.push(cellValue);
  }

  const headers = XLSX.utils.sheet_to_json(worksheet, { header: 1 })[0];
  const rowAsJSON = {};

  for (let i = 0; i < headers.length; i++) {
    const header = headers[i];
    const value = rowData[i];
    rowAsJSON[header] = value;
  }

  return rowAsJSON;
}

const filePath = 'pageIL.xlsx'; 
const rowNumber =60; 

try {
  const rowJSON = getRowAsJSON(filePath, rowNumber);
await HtmlParser.parseForExelTest(rowJSON.html,rowJSON.page_il)
} catch (error) {
  console.error('Error:', error.message);
}

