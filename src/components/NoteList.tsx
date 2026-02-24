import type { DraftSummary } from '../models/note';
import { formatDate } from '../utils/date';
import { StatusChip } from './StatusChip';

interface Props {
  drafts: DraftSummary[];
  onOpen: (draftId: string) => void;
}

export function NoteList({ drafts, onOpen }: Props): JSX.Element {
  if (!drafts.length) {
    return <p className="muted">No local drafts found. Create a new session note to begin.</p>;
  }

  return (
    <div className="noteList" role="list">
      {drafts.map((d) => (
        <button key={d.id} className="noteRow" onClick={() => onOpen(d.id)} role="listitem" type="button">
          <div>
            <div className="noteTitle">{d.clientKey || 'Unknown client'} • Session {d.sessionNumber ?? '?'}</div>
            <div className="noteMeta">{d.dateOfSession || 'No date'} • Updated {formatDate(d.updatedAt)}</div>
          </div>
          <div className="row gap">
            <StatusChip label="Plan" done={d.planComplete} />
            <StatusChip label="SOAP" done={d.soapComplete} />
          </div>
        </button>
      ))}
    </div>
  );
}
