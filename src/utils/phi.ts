import type { SoapNoteRecord } from '../models/note';

const fullNamePattern = /^[A-Z][a-z]+\s+[A-Z][a-z]+$/;
const datePattern = /\b\d{4}-\d{2}-\d{2}\b|\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b/;

export function getHeaderPhiWarnings(header: SoapNoteRecord['header']): string[] {
  const warnings: string[] = [];

  if (header.clientName && fullNamePattern.test(header.clientName.trim())) {
    warnings.push('clientName appears to be a full name. Use minimum identifiers needed by clinic policy.');
  }

  if (header.dob && datePattern.test(header.dob)) {
    warnings.push('DOB appears to contain a date pattern. Avoid DOB unless required by policy.');
  }

  return warnings;
}
