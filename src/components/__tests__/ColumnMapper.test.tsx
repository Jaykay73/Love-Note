import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ColumnMapper from '../upload/ColumnMapper';
import type { ColumnDetection, ColumnMapping } from '../../types';

const headers = ['Email', 'First Name', 'Last Name', 'Phone'];

const detection: ColumnDetection = {
  email: { column: 'Email', confidence: 'high' },
  firstName: { column: 'First Name', confidence: 'high' },
  lastName: { column: 'Last Name', confidence: 'high' },
};

const mapping: ColumnMapping = {
  emailColumn: 'Email',
  firstNameColumn: 'First Name',
  lastNameColumn: 'Last Name',
};

describe('ColumnMapper', () => {
  it('renders three dropdown selects', () => {
    render(
      <ColumnMapper
        headers={headers}
        detection={detection}
        mapping={mapping}
        onChange={() => {}}
      />
    );
    // Each field should have a select
    const selects = screen.getAllByRole('combobox');
    expect(selects).toHaveLength(3);
  });

  it('pre-selects values from the mapping prop', () => {
    render(
      <ColumnMapper
        headers={headers}
        detection={detection}
        mapping={mapping}
        onChange={() => {}}
      />
    );
    const selects = screen.getAllByRole('combobox') as HTMLSelectElement[];
    // Email select
    expect(selects[0].value).toBe('Email');
    // First Name select
    expect(selects[1].value).toBe('First Name');
    // Last Name select
    expect(selects[2].value).toBe('Last Name');
  });

  it('shows "Detected" badge for high confidence columns', () => {
    render(
      <ColumnMapper
        headers={headers}
        detection={detection}
        mapping={mapping}
        onChange={() => {}}
      />
    );
    const badges = screen.getAllByText('Detected');
    expect(badges).toHaveLength(3);
  });

  it('shows "Best guess" badge for medium confidence columns', () => {
    const mediumDetection: ColumnDetection = {
      email: { column: 'Email Address', confidence: 'medium' },
      firstName: { column: null, confidence: 'low' },
      lastName: { column: null, confidence: 'low' },
    };
    render(
      <ColumnMapper
        headers={['Email Address']}
        detection={mediumDetection}
        mapping={{ emailColumn: '', firstNameColumn: '', lastNameColumn: '' }}
        onChange={() => {}}
      />
    );
    expect(screen.getByText('Best guess')).toBeInTheDocument();
  });

  it('does not render badges for undetected columns (null column)', () => {
    const noDetection: ColumnDetection = {
      email: { column: null, confidence: 'low' },
      firstName: { column: null, confidence: 'low' },
      lastName: { column: null, confidence: 'low' },
    };
    render(
      <ColumnMapper
        headers={headers}
        detection={noDetection}
        mapping={{ emailColumn: '', firstNameColumn: '', lastNameColumn: '' }}
        onChange={() => {}}
      />
    );
    expect(screen.queryByText('Detected')).not.toBeInTheDocument();
    expect(screen.queryByText('Best guess')).not.toBeInTheDocument();
  });

  it('marks email dropdown as required with asterisk', () => {
    render(
      <ColumnMapper
        headers={headers}
        detection={detection}
        mapping={mapping}
        onChange={() => {}}
      />
    );
    // The email label should have an asterisk with aria-label "required"
    const requiredMarker = screen.getByLabelText('required');
    expect(requiredMarker).toHaveTextContent('*');
  });

  it('calls onChange when email selection changes', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(
      <ColumnMapper
        headers={headers}
        detection={detection}
        mapping={{ emailColumn: '', firstNameColumn: '', lastNameColumn: '' }}
        onChange={handleChange}
      />
    );
    const selects = screen.getAllByRole('combobox');
    await user.selectOptions(selects[0], 'Email');
    expect(handleChange).toHaveBeenCalledWith(
      expect.objectContaining({ emailColumn: 'Email' })
    );
  });

  it('calls onChange when first name selection changes', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(
      <ColumnMapper
        headers={headers}
        detection={detection}
        mapping={{ emailColumn: '', firstNameColumn: '', lastNameColumn: '' }}
        onChange={handleChange}
      />
    );
    const selects = screen.getAllByRole('combobox');
    await user.selectOptions(selects[1], 'First Name');
    expect(handleChange).toHaveBeenCalledWith(
      expect.objectContaining({ firstNameColumn: 'First Name' })
    );
  });

  it('provides empty "-- Select a column --" option in each dropdown', () => {
    render(
      <ColumnMapper
        headers={headers}
        detection={detection}
        mapping={{ emailColumn: '', firstNameColumn: '', lastNameColumn: '' }}
        onChange={() => {}}
      />
    );
    // Each select should have the default empty option
    const selects = screen.getAllByRole('combobox');
    selects.forEach((select) => {
      const options = select.querySelectorAll('option');
      expect(options[0].textContent).toBe('-- Select a column --');
      expect(options[0].getAttribute('value')).toBe('');
    });
  });
});
