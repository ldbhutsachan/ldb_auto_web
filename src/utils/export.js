import * as XLSX from 'xlsx'

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
 * Export transactions as a Petty Cash Voucher formatted Excel (.xlsx).
 * Creates a formal receipt-style layout with title, headers, data rows, and total.
 *
 * @param {string} filename - Name of the file (without extension)
 * @param {object[]} transactions - Array of transaction objects
 * @param {object} [labels] - Optional translated labels (title, headers, etc.)
 */
export function exportPettyForm(filename, transactions, labels = {}) {
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

  const wsData = []
  let rowNum = 1

  // ── Row 1: Title (merged across all columns) ──
  wsData.push([L.title])
  const titleRow = rowNum++

  // ── Row 2: Print date ──
  const now = new Date()
  const dateStr = now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  wsData.push([`${L.printDate}: ${dateStr}`])
  rowNum++

  // ── Row 3: Empty separator ──
  wsData.push([])
  rowNum++

  // ── Column count (9 columns) ──
  const colCount = 9

  // ── Row 4: Column headers ──
  const headers = [L.no, L.date, L.refNo, L.description, L.fromAccount, L.toAccount, L.amount, L.currency, L.status]
  wsData.push(headers)
  const headerRow = rowNum++

  // ── Data rows ──
  let grandTotal = 0
  transactions.forEach((item, idx) => {
    const amount = item.toAcctAmount || item.totalAmount || item.fromAcctAmount || 0
    grandTotal += typeof amount === 'number' ? amount : parseFloat(amount) || 0

    wsData.push([
      idx + 1,
      item.txnDate || item.date || '',
      item.ref || item.keyId || '',
      item.remark || item.description || '',
      item.fromAcctNo || '',
      item.toAcctNo || '',
      amount,
      item.fromAcctCcy || item.currency || '',
      item.status || '',
    ])
    rowNum++
  })

  // ── Empty row before total ──
  wsData.push([])
  rowNum++

  // ── Total row ──
  const totalRow = [L.grandTotal, '', '', '', '', '', grandTotal, '', '']
  wsData.push(totalRow)

  // Create worksheet
  const ws = XLSX.utils.aoa_to_sheet(wsData)

  // Merge title cell across all columns
  ws['!merges'] = [
    { s: { r: titleRow - 1, c: 0 }, e: { r: titleRow - 1, c: colCount - 1 } },
    { s: { r: titleRow, c: 0 }, e: { r: titleRow, c: colCount - 1 } },
  ]

  // Column widths
  ws['!cols'] = [
    { wch: 5 },   // #
    { wch: 14 },  // Date
    { wch: 20 },  // Voucher No.
    { wch: 30 },  // Description
    { wch: 18 },  // From Account
    { wch: 18 },  // To Account
    { wch: 16 },  // Amount
    { wch: 8 },   // Ccy
    { wch: 14 },  // Status
  ]

  // Create workbook
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Petty Cash')

  XLSX.writeFile(wb, `${filename}.xlsx`)
}
