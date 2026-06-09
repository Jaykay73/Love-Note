// =========================================================================
// DropZone — Drag-and-drop file upload area
//
// Supports:
// - Drag-and-drop with visual highlight on dragover
// - Click to open native file picker
// - .csv, .xlsx, .xls file types
// - Processing state (spinner + message)
// - Error state (red message)
// - Keyboard accessibility
// =========================================================================

import { useState, useRef, useCallback, type ChangeEvent, type DragEvent } from 'react';
import Spinner from '../common/Spinner';

export interface DropZoneProps {
  /** Called when the user selects a valid file */
  onFileSelected: (file: File) => void;
  /** Whether a file is currently being processed */
  isProcessing: boolean;
  /** Optional error message to display */
  error?: string | null;
}

const ACCEPTED_TYPES = '.csv,.xlsx,.xls';

/**
 * A drop zone for uploading Excel and CSV files.
 *
 * Manages its own drag-over state for visual feedback. Delegates actual
 * file handling to the `onFileSelected` callback.
 */
export default function DropZone({ onFileSelected, isProcessing, error }: DropZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // -------------------------------------------------------------------
  // Handlers
  // -------------------------------------------------------------------

  const handleFile = useCallback(
    (file: File) => {
      onFileSelected(file);
    },
    [onFileSelected]
  );

  const handleInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFile(file);
      }
      // Reset so the same file can be selected again
      e.target.value = '';
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);

      const file = e.dataTransfer.files?.[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile]
  );

  const handleClick = useCallback(() => {
    if (!isProcessing) {
      inputRef.current?.click();
    }
  }, [isProcessing]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      // Activate on Enter or Space (accessibility)
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleClick();
      }
    },
    [handleClick]
  );

  // -------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------

  const borderColor = isDragOver
    ? 'border-rose-400 bg-rose-50'
    : error
      ? 'border-red-400 bg-red-50'
      : 'border-sky-200 bg-sky-50/30';

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        aria-label={isProcessing ? 'Reading file…' : 'Upload your Excel or CSV file'}
        aria-disabled={isProcessing}
        className={`
          flex cursor-pointer flex-col items-center justify-center rounded-xl border-2
          border-dashed px-6 py-12 transition-colors duration-150
          hover:border-rose-400 hover:bg-rose-50/50
          focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2
          focus:outline-none
          ${borderColor}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
      >
        {/* Hidden file input */}
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_TYPES}
          className="hidden"
          onChange={handleInputChange}
          aria-hidden="true"
          tabIndex={-1}
        />

        {isProcessing ? (
          /* --- Processing state --- */
          <div className="flex flex-col items-center gap-3">
            <Spinner size="lg" />
            <p className="text-sm font-medium text-gray-600">Reading file…</p>
          </div>
        ) : (
          /* --- Default / idle state --- */
          <>
            {/* Upload icon */}
            <svg
              aria-hidden="true"
              className="mb-3 h-12 w-12 text-sky-400"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
              />
            </svg>

            <p className="text-base font-semibold text-sky-700">
              Drop your Excel or CSV file here, or click to browse
            </p>
            <p className="mt-1 text-sm text-sky-400">
              Accepted formats: .csv, .xlsx, .xls
            </p>
          </>
        )}
      </div>

      {/* --- Error message --- */}
      {error && !isProcessing && (
        <p
          role="alert"
          className="mt-3 rounded-md bg-red-50 px-4 py-2 text-sm text-red-700"
        >
          {error}
        </p>
      )}
    </div>
  );
}
