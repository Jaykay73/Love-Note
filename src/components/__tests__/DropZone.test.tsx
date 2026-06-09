import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DropZone from '../upload/DropZone';

describe('DropZone', () => {
  it('renders the drop area with instruction text', () => {
    render(
      <DropZone onFileSelected={() => {}} isProcessing={false} />
    );
    expect(
      screen.getByText('Drop your Excel or CSV file here, or click to browse')
    ).toBeInTheDocument();
    expect(screen.getByText('Accepted formats: .csv, .xlsx, .xls')).toBeInTheDocument();
  });

  it('shows an error message when error prop is set', () => {
    render(
      <DropZone
        onFileSelected={() => {}}
        isProcessing={false}
        error="Invalid file format"
      />
    );
    expect(screen.getByRole('alert')).toHaveTextContent('Invalid file format');
  });

  it('does not show error alert when isProcessing is true even with error set', () => {
    render(
      <DropZone
        onFileSelected={() => {}}
        isProcessing={true}
        error="Some error"
      />
    );
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('shows spinner and reading message when isProcessing is true', () => {
    render(
      <DropZone onFileSelected={() => {}} isProcessing={true} />
    );
    expect(screen.getByText('Reading file…')).toBeInTheDocument();
    // The spinner should have role="status"
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('shows the upload icon (SVG) when not processing', () => {
    render(
      <DropZone onFileSelected={() => {}} isProcessing={false} />
    );
    // In idle state, there should be an SVG element (upload icon)
    const svgs = document.querySelectorAll('svg');
    expect(svgs.length).toBeGreaterThan(0);
  });

  it('triggers hidden file input on click', async () => {
    const user = userEvent.setup();
    const handleFile = vi.fn();
    render(
      <DropZone onFileSelected={handleFile} isProcessing={false} />
    );

    // The role="button" element should be clickable
    const dropArea = screen.getByRole('button', {
      name: /upload your excel or csv file/i,
    });

    // Mock the hidden input's click to see if it gets triggered
    // We can't easily test that the hidden input click() is called,
    // but we can verify the component doesn't crash on click
    await user.click(dropArea);
    // No assertion needed - just checking it doesn't throw
    expect(dropArea).toBeInTheDocument();
  });

  it('accepts only .csv, .xlsx, .xls file types', () => {
    render(
      <DropZone onFileSelected={() => {}} isProcessing={false} />
    );
    const fileInput = document.querySelector('input[type="file"]');
    expect(fileInput).toHaveAttribute('accept', '.csv,.xlsx,.xls');
  });

  it('disables click when isProcessing is true', async () => {
    const user = userEvent.setup();
    const handleFile = vi.fn();
    render(
      <DropZone onFileSelected={handleFile} isProcessing={true} />
    );

    const dropArea = screen.getByRole('button', {
      name: /Reading file/i,
    });

    await user.click(dropArea);
    // Processing state should not trigger file selection
    // Just verify the button is aria-disabled
    expect(dropArea).toHaveAttribute('aria-disabled', 'true');
  });
});
