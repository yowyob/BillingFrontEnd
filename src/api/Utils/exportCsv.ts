export interface CsvColumn<T> {
  header: string;
  accessor: (row: T) => string | number | undefined | null;
}

const escapeCsvValue = (value: string | number | undefined | null): string => {
  const str = value === null || value === undefined ? '' : String(value);
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

/**
 * Builds a CSV file client-side and triggers a browser download — no backend
 * round-trip needed since the caller already has the filtered rows in memory.
 */
export function exportRowsToCsv<T>(filename: string, columns: CsvColumn<T>[], rows: T[]): void {
  const header = columns.map((c) => escapeCsvValue(c.header)).join(',');
  const lines = rows.map((row) => columns.map((c) => escapeCsvValue(c.accessor(row))).join(','));
  const csv = [header, ...lines].join('\r\n');

  // Leading BOM so Excel opens UTF-8 (accents, etc.) correctly instead of mangling it.
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
