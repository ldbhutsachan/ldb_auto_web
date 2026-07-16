import * as XLSX from 'xlsx'
import ExcelJS from 'exceljs'

const LAO_FONT = 'Phetsarath OT'
const LATIN_FONT = 'Times New Roman'
const HEADER_FILL = 'FF1E3A5F'
const HEADER_FONT_COLOR = 'FFFFFFFF'

const THIN_BORDER = {
  top: { style: 'thin' },
  left: { style: 'thin' },
  bottom: { style: 'thin' },
  right: { style: 'thin' },
}

/**
 * Export data as CSV file and trigger download.
 *
 * @param {string} filename - Name of the file (without extension)
 * @param {string[]} headers - Column header labels
 * @param {string[][]} rows - 2D array of row data (each row is an array of strings)
 */
export function exportToCSV(filename, headers, rows) {
  // Escape a cell value for CSV: wrap in quotes and double any internal quotes
  const escape = (val) => {
    const str = val == null ? '' : String(val)
    if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
      return '"' + str.replace(/"/g, '""') + '"'
    }
    return str
  }

  // Build CSV content with UTF-8 BOM for proper Excel handling of Unicode/Lao text
  const BOM = '\uFEFF'
  const headerLine = headers.map(escape).join(',')
  const dataLines = rows.map(row => row.map(escape).join(','))
  const csvContent = BOM + headerLine + '\n' + dataLines.join('\n')

  // Create a Blob and trigger download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', `${filename}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Export data as Excel (.xlsx) file and trigger download.
 * Uses SheetJS (xlsx) library for proper Excel formatting with auto-column widths.
 *
 * @param {string} filename - Name of the file (without extension)
 * @param {string[]} headers - Column header labels
 * @param {string[][]} rows - 2D array of row data (each row is an array of strings/numbers)
 * @param {string} [sheetName='Data'] - Name of the worksheet
 */
export function exportToExcel(filename, headers, rows, sheetName = 'Data') {
  // Build the worksheet data array
  const wsData = [headers, ...rows]
  const ws = XLSX.utils.aoa_to_sheet(wsData)

  // Auto-fit column widths based on content
  const colWidths = headers.map((_, colIdx) => {
    let maxLen = 0
    // Check header length
    maxLen = Math.max(maxLen, String(headers[colIdx] || '').length)
    // Check all row values in this column
    for (const row of rows) {
      const val = String(row[colIdx] ?? '')
      // For numbers, count digits + decimals
      maxLen = Math.max(maxLen, val.length)
    }
    // Clamp between 8 and 50 chars
    return { wch: Math.max(8, Math.min(maxLen + 4, 50)) }
  })
  ws['!cols'] = colWidths

  // Create workbook and append sheet
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, sheetName)

  // Write and trigger download
  XLSX.writeFile(wb, `${filename}.xlsx`)
}

/**
 * Export multiple tables into a single Excel (.xlsx) workbook, one sheet per table.
 *
 * @param {string} filename - Name of the file (without extension)
 * @param {{name: string, headers: string[], rows: any[][]}[]} sheets - One entry per worksheet
 */
export function exportMultiSheetExcel(filename, sheets) {
  const wb = XLSX.utils.book_new()

  sheets.forEach(({ name, headers, rows }) => {
    const wsData = [headers, ...rows]
    const ws = XLSX.utils.aoa_to_sheet(wsData)

    const colWidths = headers.map((_, colIdx) => {
      let maxLen = String(headers[colIdx] || '').length
      for (const row of rows) {
        maxLen = Math.max(maxLen, String(row[colIdx] ?? '').length)
      }
      return { wch: Math.max(8, Math.min(maxLen + 4, 50)) }
    })
    ws['!cols'] = colWidths

    // Sheet names are capped at 31 chars and can't contain: \ / ? * [ ]
    const safeName = name.replace(/[\\/?*[\]]/g, '').slice(0, 31)
    XLSX.utils.book_append_sheet(wb, ws, safeName)
  })

  XLSX.writeFile(wb, `${filename}.xlsx`)
}

/**
 * Export transactions as a Petty Cash Voucher formatted Excel (.xlsx).
 * Creates a formal receipt-style layout with title, headers, data rows, and total.
 * Header row gets a solid fill color and grid borders; Lao text uses Phetsarath OT,
 * numbers/dates/Latin text use Times New Roman (standard Lao official-document pairing).
 *
 * @param {string} filename - Name of the file (without extension)
 * @param {object[]} transactions - Array of transaction objects
 * @param {object} [labels] - Optional translated labels (title, headers, etc.)
 */
export async function exportPettyForm(filename, transactions, labels = {}) {
  const L = Object.assign({
    title: 'PETTY CASH VOUCHER',
    subtitle: 'Transaction Receipt',
    printDate: 'Print Date',
    no: '#',
    date: 'Date',
    refNo: 'Voucher No.',
    description: 'Description',
    fromAccount: 'From Account',
    toAccount: 'To Account',
    amount: 'Amount',
    currency: 'Ccy',
    status: 'Status',
    grandTotal: 'Grand Total',
    total: 'Total',
  }, labels)

  const colCount = 9
  const colWidths = [5, 14, 20, 30, 18, 18, 16, 8, 14]
  // Columns using Times New Roman (numbers/dates/codes) vs Phetsarath OT (Lao labels/text)
  const latinCols = new Set([0, 1, 2, 6, 7]) // #, Date, Voucher No., Amount, Ccy

  const wb = new ExcelJS.Workbook()
  const ws = wb.addWorksheet('Petty Cash')
  ws.columns = colWidths.map((width) => ({ width }))

  // ── Row 1: Title (merged across all columns) ──
  ws.mergeCells(1, 1, 1, colCount)
  const titleCell = ws.getCell(1, 1)
  titleCell.value = L.title
  titleCell.font = { name: LAO_FONT, size: 16, bold: true }
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' }

  // ── Row 2: Print date ──
  const now = new Date()
  const dateStr = now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  ws.mergeCells(2, 1, 2, colCount)
  const dateCell = ws.getCell(2, 1)
  dateCell.value = `${L.printDate}: ${dateStr}`
  dateCell.font = { name: LATIN_FONT, size: 10, italic: true }
  dateCell.alignment = { horizontal: 'center' }

  // ── Row 3: Empty separator ──

  // ── Row 4: Column headers ──
  const headerRowNum = 4
  const headers = [L.no, L.date, L.refNo, L.description, L.fromAccount, L.toAccount, L.amount, L.currency, L.status]
  const headerRow = ws.getRow(headerRowNum)
  headers.forEach((label, idx) => {
    const cell = headerRow.getCell(idx + 1)
    cell.value = label
    cell.font = { name: LAO_FONT, size: 11, bold: true, color: { argb: HEADER_FONT_COLOR } }
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: HEADER_FILL } }
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }
    cell.border = THIN_BORDER
  })
  headerRow.commit()

  // ── Data rows ──
  let rowNum = headerRowNum + 1
  let grandTotal = 0
  transactions.forEach((item, idx) => {
    const amount = item.toAcctAmount || item.totalAmount || item.fromAcctAmount || 0
    grandTotal += typeof amount === 'number' ? amount : parseFloat(amount) || 0

    const values = [
      idx + 1,
      item.txnDate || item.date || '',
      item.ref || item.keyId || '',
      item.remark || item.description || '',
      item.fromAcctNo || '',
      item.toAcctNo || '',
      amount,
      item.fromAcctCcy || item.currency || '',
      item.status || '',
    ]

    const row = ws.getRow(rowNum)
    values.forEach((value, idx2) => {
      const cell = row.getCell(idx2 + 1)
      cell.value = value
      cell.font = { name: latinCols.has(idx2) ? LATIN_FONT : LAO_FONT, size: 11 }
      cell.border = THIN_BORDER
      if (idx2 === 6) {
        cell.alignment = { horizontal: 'right' }
        cell.numFmt = '#,##0.00'
      } else if (latinCols.has(idx2)) {
        cell.alignment = { horizontal: 'center' }
      }
    })
    row.commit()
    rowNum++
  })

  // ── Empty row before total ──
  rowNum++

  // ── Total row ──
  const totalRowNum = rowNum
  ws.mergeCells(totalRowNum, 1, totalRowNum, 6)
  const totalRow = ws.getRow(totalRowNum)
  const totalLabelCell = totalRow.getCell(1)
  totalLabelCell.value = L.grandTotal
  totalLabelCell.font = { name: LAO_FONT, size: 11, bold: true }
  totalLabelCell.alignment = { horizontal: 'right' }
  totalLabelCell.border = THIN_BORDER
  for (let c = 2; c <= 6; c++) ws.getRow(totalRowNum).getCell(c).border = THIN_BORDER

  const totalAmountCell = totalRow.getCell(7)
  totalAmountCell.value = grandTotal
  totalAmountCell.font = { name: LATIN_FONT, size: 11, bold: true }
  totalAmountCell.alignment = { horizontal: 'right' }
  totalAmountCell.numFmt = '#,##0.00'
  totalAmountCell.border = THIN_BORDER
  totalRow.getCell(8).border = THIN_BORDER
  totalRow.getCell(9).border = THIN_BORDER
  totalRow.commit()

  const buffer = await wb.xlsx.writeBuffer()
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', `${filename}.xlsx`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
