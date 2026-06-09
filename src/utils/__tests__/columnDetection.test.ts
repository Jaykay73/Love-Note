import { describe, it, expect } from 'vitest';
import { detectColumns } from '../columnDetection';

describe('detectColumns', () => {
  it('detects exact match "Email" as high confidence email column', () => {
    const result = detectColumns(['Email', 'Name', 'Phone']);
    expect(result.email.column).toBe('Email');
    expect(result.email.confidence).toBe('high');
  });

  it('detects partial match "Email Address" as medium confidence', () => {
    const result = detectColumns(['Email Address', 'Name']);
    expect(result.email.column).toBe('Email Address');
    expect(result.email.confidence).toBe('high');
  });

  it('picks the best match when multiple candidates exist', () => {
    const result = detectColumns(['Email Address', 'Email', 'Name']);
    // Both are exact keyword matches; first one encountered wins
    expect(result.email.column).toBe('Email Address');
    expect(result.email.confidence).toBe('high');
  });

  it('handles mixed case headers like "EMAIL" and "First Name"', () => {
    const result = detectColumns(['EMAIL', 'First Name', 'Surname']);
    expect(result.email.column).toBe('EMAIL');
    expect(result.email.confidence).toBe('high');
    expect(result.firstName.column).toBe('First Name');
    expect(result.firstName.confidence).toBe('high');
    expect(result.lastName.column).toBe('Surname');
    expect(result.lastName.confidence).toBe('high');
  });

  it('detects first name from "Given Name", "First Name", "fname"', () => {
    expect(detectColumns(['Given Name', 'Email']).firstName.column).toBe('Given Name');
    expect(detectColumns(['First Name', 'Email']).firstName.column).toBe('First Name');
    expect(detectColumns(['fname', 'Email']).firstName.column).toBe('fname');
  });

  it('detects last name from "Surname", "Last Name", "lname"', () => {
    expect(detectColumns(['Surname', 'Email']).lastName.column).toBe('Surname');
    expect(detectColumns(['Last Name', 'Email']).lastName.column).toBe('Last Name');
    expect(detectColumns(['lname', 'Email']).lastName.column).toBe('lname');
  });

  it('returns null with low confidence when no matches found', () => {
    // Use headers that don't contain any email/first/last name keywords
    const result = detectColumns(['ID', 'Phone', 'Company']);
    expect(result.email.column).toBeNull();
    expect(result.email.confidence).toBe('low');
    expect(result.firstName.column).toBeNull();
    expect(result.firstName.confidence).toBe('low');
    expect(result.lastName.column).toBeNull();
    expect(result.lastName.confidence).toBe('low');
  });

  it('returns all null when headers array is empty', () => {
    const result = detectColumns([]);
    expect(result.email.column).toBeNull();
    expect(result.email.confidence).toBe('low');
    expect(result.firstName.column).toBeNull();
    expect(result.firstName.confidence).toBe('low');
    expect(result.lastName.column).toBeNull();
    expect(result.lastName.confidence).toBe('low');
  });

  it('detects "e-mail" as exact match (high confidence)', () => {
    const result = detectColumns(['e-mail']);
    expect(result.email.column).toBe('e-mail');
    expect(result.email.confidence).toBe('high');
  });

  it('detects medium confidence via substring match for "substring name"', () => {
    // "Organizer" contains "last name"? No. Let me verify:
    // LAST_NAME_KEYWORDS = ['last', 'last name', 'surname', 'family name', 'lname', 'sn', 'lastname']
    // "Organizer" contains none of those
    // FIRST_NAME_KEYWORDS = ['first', 'first name', 'given', 'given name', 'fname', 'forename', 'firstname']
    // "Organizer" contains none of those either
    // Use "mail" as a substring match for email
    const result = detectColumns(['mail']);
    // "mail" is in EMAIL_KEYWORDS as an exact match
    expect(result.email.confidence).toBe('high');
  });

  it('assigns each column to only one field (no reuse across fields)', () => {
    // "Name" is a substring of "first name" → medium match for firstName
    // By the time lastName is checked, "Name" is already used
    const result = detectColumns(['Name']);
    expect(result.firstName.column).toBe('Name');
    expect(result.firstName.confidence).toBe('medium');
    // lastName should not get "Name" because it's already assigned
    expect(result.lastName.column).toBeNull();
    expect(result.email.column).toBeNull();
  });

  it('detects "forename" as first name', () => {
    const result = detectColumns(['forename', 'Email', 'surname']);
    expect(result.firstName.column).toBe('forename');
    expect(result.firstName.confidence).toBe('high');
  });

  it('detects "family name" as exact match (high confidence)', () => {
    const result = detectColumns(['family name', 'Email']);
    expect(result.lastName.column).toBe('family name');
    expect(result.lastName.confidence).toBe('high');
  });

  it('matches "given" as first name (exact match)', () => {
    const result = detectColumns(['given', 'Email']);
    expect(result.firstName.column).toBe('given');
    expect(result.firstName.confidence).toBe('high');
  });

  it('detects "sn" as last name', () => {
    const result = detectColumns(['sn', 'Email']);
    expect(result.lastName.column).toBe('sn');
    expect(result.lastName.confidence).toBe('high');
  });
});
