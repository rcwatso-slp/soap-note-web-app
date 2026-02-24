import { useMemo, useRef, useState } from 'react';
import type { DataRow, Objective, SoapNoteRecord } from '../models/note';
import { getHeaderPhiWarnings } from '../utils/phi';

interface Props {
  note: SoapNoteRecord;
  onChange: (note: SoapNoteRecord) => void;
  onBack: () => void;
  onDownloadDraft: () => void;
  onImportDraft: (file: File) => Promise<void>;
  onClearCurrentDraft: () => Promise<void>;
  onClearLocalDrafts: () => Promise<void>;
  onExportPdf: () => void;
  onExportDocx: () => Promise<void>;
}

function updateObjective(objs: Objective[], index: number, patch: Partial<Objective>): Objective[] {
  return objs.map((o, i) => (i === index ? { ...o, ...patch } : o));
}

function updateDataRow(rows: DataRow[], index: number, patch: Partial<DataRow>): DataRow[] {
  return rows.map((r, i) => (i === index ? { ...r, ...patch } : r));
}

export function EditorPage({
  note,
  onChange,
  onBack,
  onDownloadDraft,
  onImportDraft,
  onClearCurrentDraft,
  onClearLocalDrafts,
  onExportPdf,
  onExportDocx,
}: Props): JSX.Element {
  const [tab, setTab] = useState<'plan' | 'soap' | 'export'>('plan');
  const warnings = useMemo(() => getHeaderPhiWarnings(note.header), [note.header]);
  const importRef = useRef<HTMLInputElement | null>(null);

  return (
    <div>
      <div className="toolbar noPrint">
        <button type="button" className="btnSecondary" onClick={onBack}>
          Back to Dashboard
        </button>
      </div>

      <div className="phiBanner">Avoid full identifiers when possible. Do not use shared/public computers for clinic documentation.</div>
      {warnings.length > 0 && (
        <div className="warnBanner">
          {warnings.map((w) => (
            <div key={w}>{w}</div>
          ))}
        </div>
      )}

      <section className="card grid2">
        <label>
          Client Key
          <input value={note.header.clientKey} onChange={(e) => onChange({ ...note, header: { ...note.header, clientKey: e.target.value } })} />
        </label>
        <label>
          Client Name (optional)
          <input value={note.header.clientName || ''} onChange={(e) => onChange({ ...note, header: { ...note.header, clientName: e.target.value } })} />
        </label>
        <label>
          Date of Session
          <input type="date" value={note.header.dateOfSession} onChange={(e) => onChange({ ...note, header: { ...note.header, dateOfSession: e.target.value } })} />
        </label>
        <label>
          Session Number
          <input type="number" min={1} value={note.header.sessionNumber} onChange={(e) => onChange({ ...note, header: { ...note.header, sessionNumber: Number(e.target.value) || 1 } })} />
        </label>
        <label>
          Student Clinician
          <input value={note.header.studentClinician} onChange={(e) => onChange({ ...note, header: { ...note.header, studentClinician: e.target.value } })} />
        </label>
        <label>
          Supervisor
          <input value={note.header.supervisor} onChange={(e) => onChange({ ...note, header: { ...note.header, supervisor: e.target.value } })} />
        </label>
      </section>

      <div className="tabs noPrint">
        <button type="button" className={tab === 'plan' ? 'tab activeTab' : 'tab'} onClick={() => setTab('plan')}>
          Therapy Plan
        </button>
        <button type="button" className={tab === 'soap' ? 'tab activeTab' : 'tab'} onClick={() => setTab('soap')}>
          SOAP
        </button>
        <button type="button" className={tab === 'export' ? 'tab activeTab' : 'tab'} onClick={() => setTab('export')}>
          Export
        </button>
      </div>

      {tab === 'plan' && (
        <section className="card stack">
          <label>
            Long-Term Goals
            <textarea rows={3} value={note.therapyPlan.longTermGoals} onChange={(e) => onChange({ ...note, therapyPlan: { ...note.therapyPlan, longTermGoals: e.target.value } })} />
          </label>

          <h3>Short-Term Objectives</h3>
          {note.therapyPlan.shortTermObjectives.map((obj, idx) => (
            <div key={idx} className="card innerCard stack">
              <label>
                Objective Text
                <input
                  value={obj.objectiveText}
                  onChange={(e) =>
                    onChange({ ...note, therapyPlan: { ...note.therapyPlan, shortTermObjectives: updateObjective(note.therapyPlan.shortTermObjectives, idx, { objectiveText: e.target.value }) } })
                  }
                />
              </label>
              <label>
                Cueing Level
                <select
                  value={obj.cueingLevel}
                  onChange={(e) =>
                    onChange({ ...note, therapyPlan: { ...note.therapyPlan, shortTermObjectives: updateObjective(note.therapyPlan.shortTermObjectives, idx, { cueingLevel: e.target.value as Objective['cueingLevel'] }) } })
                  }
                >
                  <option value="independent">independent</option>
                  <option value="min">min</option>
                  <option value="mod">mod</option>
                  <option value="max">max</option>
                  <option value="models">models</option>
                  <option value="other">other</option>
                </select>
              </label>
            </div>
          ))}

          <button type="button" className="btnSecondary noPrint" onClick={() => onChange({ ...note, therapyPlan: { ...note.therapyPlan, shortTermObjectives: [...note.therapyPlan.shortTermObjectives, { objectiveText: '', cueingLevel: 'independent' }] } })}>
            Add Objective
          </button>

          <label>
            Methods/Procedures
            <textarea rows={3} value={note.therapyPlan.methodsProcedures} onChange={(e) => onChange({ ...note, therapyPlan: { ...note.therapyPlan, methodsProcedures: e.target.value } })} />
          </label>

          <label>
            Materials/Stimuli
            <textarea rows={3} value={note.therapyPlan.materialsStimuli} onChange={(e) => onChange({ ...note, therapyPlan: { ...note.therapyPlan, materialsStimuli: e.target.value } })} />
          </label>

          <label>
            Data Plan
            <textarea rows={3} value={note.therapyPlan.dataPlan} onChange={(e) => onChange({ ...note, therapyPlan: { ...note.therapyPlan, dataPlan: e.target.value } })} />
          </label>

          <label className="inlineCheck noPrint">
            <input
              type="checkbox"
              checked={note.therapyPlan.planComplete}
              onChange={(e) => {
                const checked = e.target.checked;
                onChange({ ...note, therapyPlan: { ...note.therapyPlan, planComplete: checked, planCompletedAt: checked ? new Date().toISOString() : undefined } });
              }}
            />
            Mark Plan Complete
          </label>
        </section>
      )}

      {tab === 'soap' && (
        <section className="card stack">
          <label>
            Subjective
            <textarea rows={4} value={note.soap.subjective} onChange={(e) => onChange({ ...note, soap: { ...note.soap, subjective: e.target.value } })} />
          </label>

          <label>
            Objective Narrative
            <textarea rows={4} value={note.soap.objective.narrative} onChange={(e) => onChange({ ...note, soap: { ...note.soap, objective: { ...note.soap.objective, narrative: e.target.value } } })} />
          </label>

          <h3>Objective Data Rows</h3>
          {note.soap.objective.dataRows.map((row, idx) => (
            <div key={idx} className="grid5 card innerCard">
              <label>
                Target
                <input value={row.target} onChange={(e) => onChange({ ...note, soap: { ...note.soap, objective: { ...note.soap.objective, dataRows: updateDataRow(note.soap.objective.dataRows, idx, { target: e.target.value }) } } })} />
              </label>
              <label>
                Trials
                <input
                  type="number"
                  min={0}
                  value={row.trials ?? ''}
                  onChange={(e) => {
                    const val = e.target.value === '' ? null : Number(e.target.value);
                    onChange({ ...note, soap: { ...note.soap, objective: { ...note.soap.objective, dataRows: updateDataRow(note.soap.objective.dataRows, idx, { trials: val }) } } });
                  }}
                />
              </label>
              <label>
                Correct
                <input
                  type="number"
                  min={0}
                  value={row.correct ?? ''}
                  onChange={(e) => {
                    const val = e.target.value === '' ? null : Number(e.target.value);
                    onChange({ ...note, soap: { ...note.soap, objective: { ...note.soap.objective, dataRows: updateDataRow(note.soap.objective.dataRows, idx, { correct: val }) } } });
                  }}
                />
              </label>
              <label>
                Accuracy (%)
                <input value={row.accuracy ?? ''} readOnly />
              </label>
              <label>
                Cueing
                <input value={row.cueing || ''} onChange={(e) => onChange({ ...note, soap: { ...note.soap, objective: { ...note.soap.objective, dataRows: updateDataRow(note.soap.objective.dataRows, idx, { cueing: e.target.value }) } } })} />
              </label>
            </div>
          ))}

          <button type="button" className="btnSecondary noPrint" onClick={() => onChange({ ...note, soap: { ...note.soap, objective: { ...note.soap.objective, dataRows: [...note.soap.objective.dataRows, { target: '', trials: null, correct: null, accuracy: null, cueing: '', notes: '' }] } } })}>
            Add Data Row
          </button>

          <label>
            Assessment
            <textarea rows={3} value={note.soap.assessment} onChange={(e) => onChange({ ...note, soap: { ...note.soap, assessment: e.target.value } })} />
          </label>

          <label>
            Plan
            <textarea rows={3} value={note.soap.plan} onChange={(e) => onChange({ ...note, soap: { ...note.soap, plan: e.target.value } })} />
          </label>

          <label className="inlineCheck noPrint">
            <input
              type="checkbox"
              checked={note.soap.soapComplete}
              onChange={(e) => {
                const checked = e.target.checked;
                onChange({ ...note, soap: { ...note.soap, soapComplete: checked, soapCompletedAt: checked ? new Date().toISOString() : undefined } });
              }}
            />
            Mark SOAP Complete
          </label>
        </section>
      )}

      {tab === 'export' && (
        <section className="card stack">
          <div className="toolbar noPrint">
            <button type="button" className="btnPrimary" onClick={onExportPdf}>
              Export to PDF
            </button>
            <button type="button" className="btnPrimary" onClick={() => void onExportDocx()}>
              Export DOCX
            </button>
            <button type="button" className="btnSecondary" onClick={onDownloadDraft}>
              Download Draft
            </button>
            <button type="button" className="btnSecondary" onClick={() => importRef.current?.click()}>
              Import Draft
            </button>
            <button
              type="button"
              className="btnDanger"
              onClick={() => {
                if (window.confirm('Delete this local draft?')) {
                  void onClearCurrentDraft();
                }
              }}
            >
              Clear Draft
            </button>
            <button
              type="button"
              className="btnDanger"
              onClick={() => {
                if (window.confirm('Delete all local drafts in this browser?')) {
                  void onClearLocalDrafts();
                }
              }}
            >
              Clear Local Drafts
            </button>
            <input
              ref={importRef}
              type="file"
              accept=".json,.soap.json,application/json"
              className="hiddenInput"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  void onImportDraft(file);
                }
                e.currentTarget.value = '';
              }}
            />
          </div>

          <p className="muted">Export to PDF opens the print-friendly view. Export DOCX downloads a structured Word version.</p>
        </section>
      )}
    </div>
  );
}
