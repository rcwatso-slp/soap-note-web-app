import type { SoapNoteRecord } from '../models/note';
import { buildDraftFilename } from './filename';

export function downloadDraftFile(note: SoapNoteRecord): void {
  const content = JSON.stringify(note, null, 2);
  const blob = new Blob([content], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = buildDraftFilename({
    dateOfSession: note.header.dateOfSession,
    clientKey: note.header.clientKey,
    sessionNumber: note.header.sessionNumber,
  });
  a.click();
  URL.revokeObjectURL(url);
}

export async function readDraftFile(file: File): Promise<SoapNoteRecord> {
  const text = await file.text();
  const parsed = JSON.parse(text) as SoapNoteRecord;

  if (!parsed?.metadata?.noteId || !parsed?.header?.clientKey || !parsed?.therapyPlan || !parsed?.soap) {
    throw new Error('Selected file is not a valid SOAP draft JSON.');
  }

  return parsed;
}
