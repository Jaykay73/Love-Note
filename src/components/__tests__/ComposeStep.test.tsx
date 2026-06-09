import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SubjectField from '../compose/SubjectField';
import MessageBodyEditor from '../compose/MessageBodyEditor';
import PlaceholderButtons from '../compose/PlaceholderButtons';

describe('SubjectField', () => {
  it('renders an input with the provided value', () => {
    render(<SubjectField value="Hello {{first_name}}" onChange={() => {}} />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveValue('Hello {{first_name}}');
  });

  it('calls onChange when the value changes', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(<SubjectField value="" onChange={handleChange} />);
    const input = screen.getByRole('textbox');
    await user.type(input, 'Hi');
    expect(handleChange).toHaveBeenCalled();
  });

  it('renders the subject label', () => {
    render(<SubjectField value="" onChange={() => {}} />);
    expect(screen.getByText('Subject')).toBeInTheDocument();
  });

  it('has accessible label linked to input', () => {
    render(<SubjectField value="" onChange={() => {}} />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('id', 'subject-field');
  });
});

describe('MessageBodyEditor', () => {
  it('renders a textarea with the provided value', () => {
    render(<MessageBodyEditor value="Dear {{first_name}}," onChange={() => {}} />);
    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveValue('Dear {{first_name}},');});

  it('calls onChange when the textarea value changes', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(<MessageBodyEditor value="" onChange={handleChange} />);
    const textarea = screen.getByRole('textbox');
    await user.type(textarea, 'Hello');
    expect(handleChange).toHaveBeenCalled();
  });

  it('renders the "Your Message" label', () => {
    render(<MessageBodyEditor value="" onChange={() => {}} />);
    expect(screen.getByText('Your Message')).toBeInTheDocument();
  });

  it('has accessible label linked to textarea', () => {
    render(<MessageBodyEditor value="" onChange={() => {}} />);
    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveAttribute('id', 'message-body-editor');
  });
});

describe('PlaceholderButtons', () => {
  it('renders all 4 placeholder buttons', () => {
    render(<PlaceholderButtons onInsert={() => {}} />);
    expect(screen.getByText('{first_name}')).toBeInTheDocument();
    expect(screen.getByText('{last_name}')).toBeInTheDocument();
    expect(screen.getByText('{full_name}')).toBeInTheDocument();
    expect(screen.getByText('{email}')).toBeInTheDocument();
  });

  it('calls onInsert with correct PlaceholderKey when first_name button is clicked', async () => {
    const user = userEvent.setup();
    const handleInsert = vi.fn();
    render(<PlaceholderButtons onInsert={handleInsert} />);
    await user.click(screen.getByText('{first_name}'));
    expect(handleInsert).toHaveBeenCalledWith('{{first_name}}');
  });

  it('calls onInsert with correct PlaceholderKey when last_name button is clicked', async () => {
    const user = userEvent.setup();
    const handleInsert = vi.fn();
    render(<PlaceholderButtons onInsert={handleInsert} />);
    await user.click(screen.getByText('{last_name}'));
    expect(handleInsert).toHaveBeenCalledWith('{{last_name}}');
  });

  it('calls onInsert with correct PlaceholderKey when full_name button is clicked', async () => {
    const user = userEvent.setup();
    const handleInsert = vi.fn();
    render(<PlaceholderButtons onInsert={handleInsert} />);
    await user.click(screen.getByText('{full_name}'));
    expect(handleInsert).toHaveBeenCalledWith('{{full_name}}');
  });

  it('calls onInsert with correct PlaceholderKey when email button is clicked', async () => {
    const user = userEvent.setup();
    const handleInsert = vi.fn();
    render(<PlaceholderButtons onInsert={handleInsert} />);
    await user.click(screen.getByText('{email}'));
    expect(handleInsert).toHaveBeenCalledWith('{{email}}');
  });

  it('renders the "Insert Placeholder" label', () => {
    render(<PlaceholderButtons onInsert={() => {}} />);
    expect(screen.getByText('Insert Placeholder')).toBeInTheDocument();
  });

  it('each button has an aria-label matching its description', () => {
    render(<PlaceholderButtons onInsert={() => {}} />);
    expect(
      screen.getByLabelText("Inserts the recipient's first name")
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText("Inserts the recipient's last name")
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText("Inserts the recipient's full name")
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText("Inserts the recipient's email address")
    ).toBeInTheDocument();
  });
});
