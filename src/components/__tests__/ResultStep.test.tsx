import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SuccessSummary from '../result/SuccessSummary';
import FailureList from '../result/FailureList';
import ExportButton from '../result/ExportButton';
import type { SendResult, Recipient } from '../../types';

describe('SuccessSummary', () => {
  it('shows green checkmark for 100% success (allSent)', () => {
    render(<SuccessSummary sent={10} failed={0} total={10} />);
    expect(screen.getByText('All emails sent!')).toBeInTheDocument();
    expect(screen.getByText(/10 emails delivered successfully/)).toBeInTheDocument();
  });

  it('shows yellow warning icon for partial success (someSent)', () => {
    render(<SuccessSummary sent={7} failed={3} total={10} />);
    expect(screen.getByText('Almost there!')).toBeInTheDocument();
    expect(screen.getByText(/7 sent, 3 failed/)).toBeInTheDocument();
  });

  it('shows red X when all emails failed (noneSent)', () => {
    render(<SuccessSummary sent={0} failed={5} total={5} />);
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText(/5 emails could not be sent/)).toBeInTheDocument();
  });

  it('shows "No recipients" when total is 0', () => {
    render(<SuccessSummary sent={0} failed={0} total={0} />);
    expect(screen.getByText('No recipients')).toBeInTheDocument();
  });

  it('shows count line with singular when sent is 1', () => {
    render(<SuccessSummary sent={1} failed={0} total={1} />);
    expect(screen.getByText('All emails sent!')).toBeInTheDocument();
    expect(screen.getByText(/1 email sent successfully/)).toBeInTheDocument();
  });

  it('shows singular failure message when failed is 1 and none sent', () => {
    render(<SuccessSummary sent={0} failed={1} total={1} />);
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('1 email could not be sent.')).toBeInTheDocument();
  });

  it('applies correct heading color for all sent (green)', () => {
    render(<SuccessSummary sent={10} failed={0} total={10} />);
    const heading = screen.getByText('All emails sent!');
    expect(heading.className).toContain('text-green-800');
  });

  it('applies correct heading color for some sent (yellow)', () => {
    render(<SuccessSummary sent={5} failed={5} total={10} />);
    const heading = screen.getByText('Almost there!');
    expect(heading.className).toContain('text-yellow-800');
  });

  it('applies correct heading color for none sent (red)', () => {
    render(<SuccessSummary sent={0} failed={5} total={5} />);
    const heading = screen.getByText('Something went wrong');
    expect(heading.className).toContain('text-red-800');
  });
});

describe('FailureList', () => {
  const failedResult = (
    overrides: Partial<SendResult> = {}
  ): SendResult => ({
    recipient: {
      email: 'fail@test.com',
      first_name: 'Fail',
      last_name: 'User',
      full_name: 'Fail User',
      rowIndex: 0,
    },
    status: 'failed',
    error: 'Server error',
    errorType: 'permanent',
    ...overrides,
  });

  it('renders nothing when there are no failures', () => {
    const { container } = render(<FailureList failedResults={[]} />);
    expect(container.innerHTML).toBe('');
  });

  it('shows failure count in the toggle button when failures exist', () => {
    render(<FailureList failedResults={[failedResult()]} />);
    expect(screen.getByText('View failed emails (1)')).toBeInTheDocument();
  });

  it('starts collapsed (not expanded)', () => {
    render(<FailureList failedResults={[failedResult()]} />);
    expect(screen.getByText('View failed emails (1)')).toBeInTheDocument();
    // The failure table should not be visible initially
    // aria-expanded should be false
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-expanded', 'false');
  });

  it('expands to show the table when toggle is clicked', async () => {
    const user = userEvent.setup();
    render(<FailureList failedResults={[failedResult()]} />);
    await user.click(screen.getByRole('button'));
    // After clicking, the table should be visible
    expect(screen.getByText('Email')).toBeInTheDocument(); // column header
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Error Reason')).toBeInTheDocument();
  });

  it('shows the recipient email in the row', async () => {
    const user = userEvent.setup();
    render(<FailureList failedResults={[failedResult()]} />);
    await user.click(screen.getByRole('button'));
    expect(screen.getByText('fail@test.com')).toBeInTheDocument();
  });

  it('maps error types to user-friendly messages', async () => {
    const user = userEvent.setup();
    render(<FailureList failedResults={[failedResult({ errorType: 'rate-limit' })]} />);
    await user.click(screen.getByRole('button'));
    expect(screen.getByText('Gmail rate limit reached')).toBeInTheDocument();
  });

  it('renders fallback error string when errorType is not in map', async () => {
    const user = userEvent.setup();
    render(
      <FailureList
        failedResults={[failedResult({ errorType: 'network' as const })]}
      />
    );
    await user.click(screen.getByRole('button'));
    expect(screen.getByText('Network error')).toBeInTheDocument();
  });

  it('shows em dash for missing name', async () => {
    const user = userEvent.setup();
    render(
      <FailureList
        failedResults={[
          failedResult({
            recipient: { ...failedResult().recipient, full_name: '' },
          }),
        ]}
      />
    );
    await user.click(screen.getByRole('button'));
    expect(screen.getByText('—')).toBeInTheDocument();
  });
});

describe('ExportButton', () => {
  const makeSendResult = (email: string): SendResult => ({
    recipient: {
      email,
      first_name: 'Test',
      last_name: 'User',
      full_name: 'Test User',
      rowIndex: 0,
    },
    status: 'failed',
    error: 'Error',
  });

  const makeRecipient = (email: string): Recipient => ({
    email,
    first_name: 'Test',
    last_name: 'User',
    full_name: 'Test User',
    rowIndex: 0,
  });

  it('renders nothing when there are no failures and no unsent', () => {
    const { container } = render(
      <ExportButton failedResults={[]} unsentRecipients={[]} />
    );
    expect(container.innerHTML).toBe('');
  });

  it('shows "Download Failed List (CSV)" when failures exist', () => {
    render(
      <ExportButton
        failedResults={[makeSendResult('fail@test.com')]}
        unsentRecipients={[]}
      />
    );
    expect(screen.getByText('Download Failed List (CSV)')).toBeInTheDocument();
  });

  it('shows "Download Unsent List (CSV)" when unsent recipients exist', () => {
    render(
      <ExportButton
        failedResults={[]}
        unsentRecipients={[makeRecipient('unsent@test.com')]}
      />
    );
    expect(screen.getByText('Download Unsent List (CSV)')).toBeInTheDocument();
  });

  it('shows both buttons when failures and unsent both exist', () => {
    render(
      <ExportButton
        failedResults={[makeSendResult('fail@test.com')]}
        unsentRecipients={[makeRecipient('unsent@test.com')]}
      />
    );
    expect(screen.getByText('Download Failed List (CSV)')).toBeInTheDocument();
    expect(screen.getByText('Download Unsent List (CSV)')).toBeInTheDocument();
  });
});
