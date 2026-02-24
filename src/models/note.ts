export type CueingLevel = 'independent' | 'min' | 'mod' | 'max' | 'models' | 'other';

export interface Objective {
  objectiveText: string;
  condition?: string;
  behavior?: string;
  criterion?: string;
  cueingLevel: CueingLevel;
  notes?: string;
}

export interface DataRow {
  target: string;
  trials: number | null;
  correct: number | null;
  accuracy?: number | null;
  cueing?: string;
  notes?: string;
}

export interface SoapNoteRecord {
  metadata: {
    noteId: string;
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    updatedBy: string;
    version: number;
  };
  header: {
    clientKey: string;
    clientName?: string;
    dob?: string;
    dateOfSession: string;
    sessionNumber: number;
    studentClinician: string;
    supervisor: string;
    location?: string;
  };
  therapyPlan: {
    longTermGoals: string;
    shortTermObjectives: Objective[];
    methodsProcedures: string;
    cueingSupports: string[];
    materialsStimuli: string;
    dataPlan: string;
    anticipatedBarriers?: string;
    homeProgramPlanned?: string;
    planComplete: boolean;
    planCompletedAt?: string;
  };
  soap: {
    subjective: string;
    objective: {
      narrative: string;
      dataRows: DataRow[];
    };
    assessment: string;
    plan: string;
    soapComplete: boolean;
    soapCompletedAt?: string;
  };
  supervisorReview?: {
    strengths: string;
    growthTargets: string;
    requiredEditsChecklist: string[];
    reviewed: boolean;
    reviewedAt?: string;
  };
}

export interface DraftSummary {
  id: string;
  updatedAt: string;
  dateOfSession?: string;
  clientKey?: string;
  sessionNumber?: number;
  planComplete?: boolean;
  soapComplete?: boolean;
}

export interface StoredDraft {
  id: string;
  updatedAt: string;
  note: SoapNoteRecord;
}
