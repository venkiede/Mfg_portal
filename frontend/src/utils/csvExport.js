/**
 * Client-side CSV export utility.
 * Converts array of objects to CSV string and triggers download via Blob.
 */

/**
 * Escapes a CSV cell value (handles commas, quotes, newlines)
 */
function escapeCsvCell(value) {
  if (value == null) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Converts array of objects to CSV string
 * @param {Array<Object>} data - Array of record objects
 * @param {string[]} columns - Optional column keys (default: all keys from first row)
 */
export function toCsvString(data, columns = null) {
  if (!data || data.length === 0) return '';

  const keys = columns || Object.keys(data[0]);
  const header = keys.map(escapeCsvCell).join(',');
  const rows = data.map((row) =>
    keys.map((k) => escapeCsvCell(row[k])).join(',')
  );
  return [header, ...rows].join('\n');
}

/**
 * Triggers CSV file download in the browser
 * @param {Array<Object>} data - Data to export
 * @param {string} filename - Download filename (without .csv)
 * @param {string[]} columns - Optional column keys
 */
export function downloadCsv(data, filename = 'export', columns = null) {
  const csv = toCsvString(data, columns);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.csv`;
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
