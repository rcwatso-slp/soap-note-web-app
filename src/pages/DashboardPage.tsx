import React, { useMemo, useState } from 'react';
import type { DraftSummary } from '../models/note';
import { NoteList } from '../components/NoteList';

interface Props {
  drafts: DraftSummary[];
  loading: boolean;
  onRefresh: () => Promise<void>;
  onOpen: (draftId: string) => void;
  onCreateClicked: () => void;
  onClearAll: () => Promise<void>;
}

export function DashboardPage({ drafts, loading, onRefresh, onOpen, onCreateClicked, onClearAll }: Props): JSX.Element {
  const [clientFilter, setClientFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const filtered = useMemo(() => {
    return drafts.filter((d) => {
      const matchesClient = !clientFilter || (d.clientKey || '').toLowerCase().includes(clientFilter.toLowerCase());
      const date = d.dateOfSession || '';
      const matchesStart = !startDate || (date && date >= startDate);
      const matchesEnd = !endDate || (date && date <= endDate);
      return matchesClient && matchesStart && matchesEnd;
    });
  }, [drafts, clientFilter, startDate, endDate]);

  return (
    <div>
      <div className="toolbar">
        <button className="btnPrimary" type="button" onClick={onCreateClicked}>
          Create New Session Note
        </button>
        <button className="btnSecondary" type="button" onClick={() => void onRefresh()} disabled={loading}>
          {loading ? 'Refreshing...' : 'Refresh List'}
        </button>
        <button
          className="btnDanger"
          type="button"
          onClick={() => {
            if (window.confirm('Delete all local drafts from this browser?')) {
              void onClearAll();
            }
          }}
        >
          Clear Local Drafts
        </button>
      </div>

      <div className="filters">
        <label>
          Client Key
          <input value={clientFilter} onChange={(e) => setClientFilter(e.target.value)} placeholder="e.g., CL123" />
        </label>
        <label>
          Start Date
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </label>
        <label>
          End Date
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </label>
      </div>

      <NoteList drafts={filtered} onOpen={onOpen} />
    </div>
  );
}
