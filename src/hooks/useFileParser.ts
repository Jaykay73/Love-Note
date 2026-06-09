// =========================================================================
// useFileParser — Custom hook that orchestrates the file processing
// pipeline: parse → detect columns → auto-create mapping → validate
//
// Maintains all derived state (parsedFile, detection, mapping, validation)
// and provides methods to update the mapping and retrieve valid recipients.
// =========================================================================

import { useState, useCallback } from 'react';
import type { ParsedFile, ColumnDetection, ColumnMapping, RecipientValidation, Recipient } from '../types';
import { parseFile } from '../services/fileParser';
import { detectColumns } from '../utils/columnDetection';
import { validateRecipients } from '../utils/validators';

export interface UseFileParserReturn {
  /** The parsed file data (null until a file is processed) */
  parsedFile: ParsedFile | null;
  /** The auto-detected column mapping (null until a file is processed) */
  detection: ColumnDetection | null;
  /** The current column mapping */
  mapping: ColumnMapping;
  /** The validation result (null until mapping has an email column) */
  validation: RecipientValidation | null;
  /** Whether a file is currently being processed */
  isProcessing: boolean;
  /** Error message if processing failed */
  error: string | null;
  /** Process a selected file */
  handleFile: (file: File) => Promise<void>;
  /** Update the column mapping and re-run validation */
  updateMapping: (mapping: ColumnMapping) => void;
  /** Get the list of valid recipients from the latest validation */
  getValidRecipients: () => Recipient[];
}

const EMPTY_MAPPING: ColumnMapping = {
  emailColumn: '',
  firstNameColumn: '',
  lastNameColumn: '',
};

/**
 * Orchestrates the file processing pipeline.
 *
 * 1. Parse the uploaded file (Excel or CSV) → ParsedFile
 * 2. Auto-detect columns (email, first name, last name) → ColumnDetection
 * 3. Create an initial mapping from the detection result
 * 4. Validate recipients using the initial mapping → RecipientValidation
 *
 * When the user changes the mapping via `updateMapping`, validation is
 * re-run automatically.
 */
export function useFileParser(): UseFileParserReturn {
  const [parsedFile, setParsedFile] = useState<ParsedFile | null>(null);
  const [detection, setDetection] = useState<ColumnDetection | null>(null);
  const [mapping, setMapping] = useState<ColumnMapping>(EMPTY_MAPPING);
  const [validation, setValidation] = useState<RecipientValidation | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // -------------------------------------------------------------------
  // handleFile — Process a selected file through the full pipeline
  // -------------------------------------------------------------------

  const handleFile = useCallback(async (file: File) => {
    setIsProcessing(true);
    setError(null);
    setValidation(null);

    try {
      // Step 1: Parse the file
      const parsed = await parseFile(file);
      setParsedFile(parsed);

      if (parsed.headers.length === 0 || parsed.rows.length === 0) {
        // File parsed but has no usable data
        setDetection(null);
        setMapping(EMPTY_MAPPING);
        setError(
          parsed.headers.length === 0
            ? 'The file appears to be empty or has no readable headers.'
            : 'The file has headers but no data rows.'
        );
        setIsProcessing(false);
        return;
      }

      // Step 2: Auto-detect columns
      const colDetection = detectColumns(parsed.headers);
      setDetection(colDetection);

      // Step 3: Auto-create mapping from detection
      const autoMapping: ColumnMapping = {
        emailColumn: colDetection.email.column ?? '',
        firstNameColumn: colDetection.firstName.column ?? '',
        lastNameColumn: colDetection.lastName.column ?? '',
      };
      setMapping(autoMapping);

      // Step 4: Validate if email column is mapped
      if (autoMapping.emailColumn) {
        const result = validateRecipients(parsed.rows, autoMapping);
        setValidation(result);
      } else {
        setValidation(null);
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'An unexpected error occurred while reading the file.';
      setError(message);
      setParsedFile(null);
      setDetection(null);
      setMapping(EMPTY_MAPPING);
      setValidation(null);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  // -------------------------------------------------------------------
  // updateMapping — Update column mapping and re-run validation
  // -------------------------------------------------------------------

  const updateMapping = useCallback(
    (newMapping: ColumnMapping) => {
      setMapping(newMapping);

      if (parsedFile && newMapping.emailColumn) {
        const result = validateRecipients(parsedFile.rows, newMapping);
        setValidation(result);
      } else {
        setValidation(null);
      }
    },
    [parsedFile]
  );

  // -------------------------------------------------------------------
  // getValidRecipients — Extract valid recipients from validation
  // -------------------------------------------------------------------

  const getValidRecipients = useCallback((): Recipient[] => {
    return validation?.valid ?? [];
  }, [validation]);

  // -------------------------------------------------------------------
  // Return
  // -------------------------------------------------------------------

  return {
    parsedFile,
    detection,
    mapping,
    validation,
    isProcessing,
    error,
    handleFile,
    updateMapping,
    getValidRecipients,
  };
}
