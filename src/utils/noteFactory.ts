import type { SoapNoteRecord } from '../models/note';

interface CreateArgs {
  dateOfSession: string;
  sessionNumber: number;
  clientKey: string;
  clientName?: string;
  studentClinician: string;
  supervisor: string;
}

function nowIso(): string {
  return new Date().toISOString();
}

export function computeAccuracy(trials: number | null, correct: number | null): number | null {
  if (trials === null || correct === null || trials <= 0) return null;
  return Math.max(0, Math.min(100, Number(((correct / trials) * 100).toFixed(1))));
}

export function applyDerivedFields(note: SoapNoteRecord): SoapNoteRecord {
  return {
    ...note,
    soap: {
      ...note.soap,
      objective: {
        ...note.soap.objective,
        dataRows: note.soap.objective.dataRows.map((row) => ({
          ...row,
          accuracy: computeAccuracy(row.trials, row.correct),
        })),
      },
    },
  };
}

export function createNewNote(args: CreateArgs): SoapNoteRecord {
  const now = nowIso();
  return {
    metadata: {
      noteId: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
      createdBy: 'local-user',
      updatedBy: 'local-user',
      version: 1,
    },
    header: {
      clientKey: args.clientKey,
      clientName: args.clientName,
      dateOfSession: args.dateOfSession,
      sessionNumber: args.sessionNumber,
      studentClinician: args.studentClinician,
      supervisor: args.supervisor,
    },
    therapyPlan: {
      longTermGoals: '',
      shortTermObjectives: [{ objectiveText: '', cueingLevel: 'independent' }],
      methodsProcedures: '',
      cueingSupports: [],
      materialsStimuli: '',
      dataPlan: '',
      anticipatedBarriers: '',
      homeProgramPlanned: '',
      planComplete: false,
    },
    soap: {
      subjective: '',
      objective: {
        narrative: '',
        dataRows: [{ target: '', trials: null, correct: null, accuracy: null, cueing: '', notes: '' }],
      },
      assessment: '',
      plan: '',
      soapComplete: false,
    },
  };
}

export function prepareForSave(note: SoapNoteRecord): SoapNoteRecord {
  return applyDerivedFields({
    ...note,
    metadata: {
      ...note.metadata,
      updatedAt: nowIso(),
      updatedBy: 'local-user',
      version: note.metadata.version + 1,
    },
  });
}
