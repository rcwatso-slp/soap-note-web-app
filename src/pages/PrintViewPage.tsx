import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { SoapNoteRecord } from '../models/note';

interface PrintState {
  note?: SoapNoteRecord;
}

export function PrintViewPage(): JSX.Element {
  const location = useLocation();
  const navigate = useNavigate();
  const note = (location.state as PrintState | null)?.note;
  const logoSrc = `${import.meta.env.BASE_URL}clinic-logo.png`;

  useEffect(() => {
    if (note) {
      const id = window.setTimeout(() => window.print(), 120);
      return () => window.clearTimeout(id);
    }
    return;
  }, [note]);

  if (!note) {
    return (
      <main className="container printPaper">
        <p>Print view requires an active note loaded from the editor.</p>
        <button className="btnSecondary noPrint" type="button" onClick={() => navigate('/')}>
          Back to Dashboard
        </button>
      </main>
    );
  }

  return (
    <main className="container printPaper">
      <header className="printHeader">
        <div className="printBrandHeader">
          <img
            src={logoSrc}
            alt="EIU CDS Clinic logo"
            className="printBrandLogo"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
          <h1>EIU CDS Speech Language Hearing Clinic SOAP Note System</h1>
        </div>
        <div className="printMetaGrid">
          <div><strong>Client Key:</strong> {note.header.clientKey}</div>
          <div><strong>Date of Session:</strong> {note.header.dateOfSession}</div>
          <div><strong>Session #:</strong> {note.header.sessionNumber}</div>
          <div><strong>Student Clinician:</strong> {note.header.studentClinician}</div>
          <div><strong>Supervisor:</strong> {note.header.supervisor}</div>
          <div><strong>Location:</strong> {note.header.location || ''}</div>
        </div>
      </header>

      <section className="printSection">
        <h2>Therapy Plan</h2>
        <h3>Long-Term Goals</h3>
        <p>{note.therapyPlan.longTermGoals}</p>

        <h3>Short-Term Objectives</h3>
        <ol>
          {note.therapyPlan.shortTermObjectives.map((obj, idx) => (
            <li key={idx}>
              <div>{obj.objectiveText}</div>
              <div><strong>Cueing:</strong> {obj.cueingLevel}</div>
            </li>
          ))}
        </ol>

        <h3>Methods / Procedures</h3>
        <p>{note.therapyPlan.methodsProcedures}</p>

        <h3>Materials / Stimuli</h3>
        <p>{note.therapyPlan.materialsStimuli}</p>

        <h3>Data Plan</h3>
        <p>{note.therapyPlan.dataPlan}</p>
      </section>

      <section className="printSection">
        <h2>SOAP</h2>
        <h3>Subjective</h3>
        <p>{note.soap.subjective}</p>

        <h3>Objective Narrative</h3>
        <p>{note.soap.objective.narrative}</p>

        <h3>Objective Data Table</h3>
        <table className="printTable">
          <thead>
            <tr>
              <th>Target</th>
              <th>Trials</th>
              <th>Correct</th>
              <th>Accuracy (%)</th>
              <th>Cueing</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {note.soap.objective.dataRows.map((row, idx) => (
              <tr key={idx}>
                <td>{row.target}</td>
                <td>{row.trials ?? ''}</td>
                <td>{row.correct ?? ''}</td>
                <td>{row.accuracy ?? ''}</td>
                <td>{row.cueing || ''}</td>
                <td>{row.notes || ''}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h3>Assessment</h3>
        <p>{note.soap.assessment}</p>

        <h3>Plan</h3>
        <p>{note.soap.plan}</p>
      </section>

      <div className="toolbar noPrint">
        <button className="btnSecondary" type="button" onClick={() => navigate(-1)}>
          Back to Editor
        </button>
        <button className="btnPrimary" type="button" onClick={() => window.print()}>
          Print Again
        </button>
      </div>
    </main>
  );
}
