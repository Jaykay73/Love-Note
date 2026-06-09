import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import type { ParsedFile } from '../types';

/**
 * Detects the file type from a File object by its extension.
 */
function detectFileType(fileName: string): 'xlsx' | 'csv' {
  const lower = fileName.toLowerCase();
  if (lower.endsWith('.xlsx') || lower.endsWith('.xls')) {
    return 'xlsx';
  }
  return 'csv';
}

/**
 * Parses an Excel (.xlsx / .xls) file into a ParsedFile structure.
 * Reads the first sheet, converts to 2D array, treats first row as headers.
 */
async function parseExcel(file: File): Promise<ParsedFile> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });
  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) {
    return {
      headers: [],
      rows: [],
      fileName: file.name,
      fileType: 'xlsx',
      totalRows: 0,
    };
  }

  const sheet = workbook.Sheets[firstSheetName];
  const rawData: unknown[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

  if (rawData.length === 0) {
    return {
      headers: [],
      rows: [],
      fileName: file.name,
      fileType: 'xlsx',
      totalRows: 0,
    };
  }

  // First row = headers, trimmed
  const headers: string[] = (rawData[0] as unknown[])
    .map((h) => String(h ?? '').trim());

  // Remaining rows = data
  const dataRows = rawData.slice(1);

  const rows: Record<string, string>[] = dataRows
    .filter((row): row is unknown[] => Array.isArray(row) && row.length > 0)
    .map((row: unknown[]) => {
      const record: Record<string, string> = {};
      headers.forEach((header, index) => {
        record[header] = index < row.length ? String(row[index] ?? '').trim() : '';
      });
      return record;
    });

  return {
    headers,
    rows,
    fileName: file.name,
    fileType: 'xlsx',
    totalRows: rows.length,
  };
}

/**
 * Parses a CSV file into a ParsedFile structure.
 */
async function parseCsv(file: File): Promise<ParsedFile> {
  const text = await file.text();
  const result = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h: string) => h.trim(),
  });

  const headers: string[] = result.meta.fields?.map((h: string) => h.trim()) ?? [];

  const rows: Record<string, string>[] = result.data.map((row: Record<string, string>) => {
    const record: Record<string, string> = {};
    for (const key of Object.keys(row)) {
      const trimmedKey = key.trim();
      record[trimmedKey] = (row[key] ?? '').trim();
    }
    return record;
  });

  return {
    headers,
    rows,
    fileName: file.name,
    fileType: 'csv',
    totalRows: rows.length,
  };
}

/**
 * Parses an uploaded file (Excel or CSV) into a ParsedFile.
 * Detects file type by extension.
 */
export async function parseFile(file: File): Promise<ParsedFile> {
  const fileType = detectFileType(file.name);

  if (fileType === 'xlsx') {
    return parseExcel(file);
  }

  return parseCsv(file);
}
