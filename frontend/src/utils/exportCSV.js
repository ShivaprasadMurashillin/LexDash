/**
 * exportCSV – converts an array of objects to CSV and triggers download.
 *
 * @param {Object[]} data    - Array of flat objects to export.
 * @param {string[]} columns - Ordered keys to include in the CSV.
 * @param {Object}   headers - Optional map of key → display header. Falls back to the key name.
 * @param {string}   filename - Name of the downloaded file.
 */
export default function exportCSV(data, columns, headers = {}, filename = 'export.csv') {
  if (!data.length) return;

  const escape = (val) => {
    const str = val == null ? '' : String(val);
    // Wrap in quotes if the value contains a comma, newline, or double-quote
    if (/[",\n\r]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
    return str;
  };

  const headerRow = columns.map((col) => escape(headers[col] ?? col)).join(',');
  const rows = data.map((row) =>
    columns.map((col) => escape(row[col])).join(',')
  );

  const csv = [headerRow, ...rows].join('\r\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
