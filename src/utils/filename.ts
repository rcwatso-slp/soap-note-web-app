interface FilenameParts {
  dateOfSession: string;
  clientKey: string;
  sessionNumber: number;
}

function clean(value: string): string {
  return value.replace(/[^a-zA-Z0-9_-]/g, '').trim();
}

export function buildDraftFilename(parts: FilenameParts): string {
  const date = clean(parts.dateOfSession) || '0000-00-00';
  const client = clean(parts.clientKey) || 'ClientKey';
  const session = String(parts.sessionNumber).padStart(2, '0');
  return `${date}__${client}__Session${session}.soap.json`;
}
