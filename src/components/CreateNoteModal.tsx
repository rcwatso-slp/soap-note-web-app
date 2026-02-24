import React, { useMemo, useState } from 'react';
import { toDateInput } from '../utils/date';

export interface CreateNoteInput {
  dateOfSession: string;
  sessionNumber: number;
  clientKey: string;
  clientName?: string;
  studentClinician: string;
  supervisor: string;
}

interface Props {
  open: boolean;
  defaultStudentClinician: string;
  onClose: () => void;
  onCreate: (input: CreateNoteInput) => Promise<void>;
}

export function CreateNoteModal({ open, defaultStudentClinician, onClose, onCreate }: Props): JSX.Element | null {
  const [dateOfSession, setDateOfSession] = useState(toDateInput(new Date()));
  const [sessionNumber, setSessionNumber] = useState(1);
  const [clientKey, setClientKey] = useState('');
  const [clientName, setClientName] = useState('');
  const [studentClinician, setStudentClinician] = useState(defaultStudentClinician);
  const [supervisor, setSupervisor] = useState('');
  const [saving, setSaving] = useState(false);

  const valid = useMemo(
    () => Boolean(dateOfSession && sessionNumber > 0 && clientKey.trim() && studentClinician.trim() && supervisor.trim()),
    [dateOfSession, sessionNumber, clientKey, studentClinician, supervisor],
  );

  if (!open) return null;

  return (
    <div className="modalBackdrop" role="dialog" aria-modal="true" aria-label="Create note">
      <div className="modalCard">
        <h2>Create New Session Note</h2>

        <label>
          Date of Session
          <input type="date" value={dateOfSession} onChange={(e) => setDateOfSession(e.target.value)} />
        </label>

        <label>
          Session Number
          <input
            type="number"
            min={1}
            value={sessionNumber}
            onChange={(e) => setSessionNumber(Number(e.target.value) || 1)}
          />
        </label>

        <label>
          Client Key (Clinic ID or initials)
          <input value={clientKey} onChange={(e) => setClientKey(e.target.value)} />
        </label>

        <label>
          Client Name (optional, caution)
          <input value={clientName} onChange={(e) => setClientName(e.target.value)} />
        </label>

        <label>
          Student Clinician
          <input value={studentClinician} onChange={(e) => setStudentClinician(e.target.value)} />
        </label>

        <label>
          Supervisor
          <input value={supervisor} onChange={(e) => setSupervisor(e.target.value)} />
        </label>

        <div className="row end gap">
          <button type="button" className="btnSecondary" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button
            type="button"
            className="btnPrimary"
            disabled={!valid || saving}
            onClick={async () => {
              setSaving(true);
              try {
                await onCreate({
                  dateOfSession,
                  sessionNumber,
                  clientKey: clientKey.trim(),
                  clientName: clientName.trim() || undefined,
                  studentClinician: studentClinician.trim(),
                  supervisor: supervisor.trim(),
                });
              } finally {
                setSaving(false);
              }
            }}
          >
            {saving ? 'Creating...' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
}
