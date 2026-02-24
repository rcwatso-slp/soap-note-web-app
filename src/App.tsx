import { useEffect, useState } from 'react';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { CreateNoteModal } from './components/CreateNoteModal';
import type { CreateNoteInput } from './components/CreateNoteModal';
import { ErrorBanner } from './components/ErrorBanner';
import type { DraftSummary, SoapNoteRecord } from './models/note';
import { DashboardPage } from './pages/DashboardPage';
import { EditorPage } from './pages/EditorPage';
import { PrintViewPage } from './pages/PrintViewPage';
import { clearAllDrafts, deleteDraft, getDraft, listDrafts, saveDraft } from './storage/draftsDb';
import { downloadDraftFile, readDraftFile } from './utils/draftFile';
import { createNewNote, prepareForSave } from './utils/noteFactory';
import './styles/app.css';

function HomeRoute(): JSX.Element {
  const navigate = useNavigate();
  const logoSrc = `${import.meta.env.BASE_URL}clinic-logo.png`;
  const [drafts, setDrafts] = useState<DraftSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [activeDraftId, setActiveDraftId] = useState<string | null>(null);
  const [activeNote, setActiveNote] = useState<SoapNoteRecord | null>(null);

  const refresh = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      setDrafts(await listDrafts());
    } catch {
      setError('Unable to load local drafts from this browser.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
  }, []);

  useEffect(() => {
    if (!activeNote || !activeDraftId) return;

    const timer = window.setTimeout(() => {
      const prepared = prepareForSave(activeNote);
      void saveDraft({ id: activeDraftId, updatedAt: prepared.metadata.updatedAt, note: prepared });
      void refresh();
    }, 700);

    return () => window.clearTimeout(timer);
  }, [activeNote, activeDraftId]);

  const openDraft = async (draftId: string): Promise<void> => {
    try {
      const draft = await getDraft(draftId);
      if (!draft) {
        setError('Draft not found in local storage.');
        return;
      }
      setActiveDraftId(draft.id);
      setActiveNote(draft.note);
      setError(null);
    } catch {
      setError('Unable to open local draft.');
    }
  };

  const onCreate = async (input: CreateNoteInput): Promise<void> => {
    const note = createNewNote(input);
    const id = note.metadata.noteId;
    const prepared = prepareForSave(note);
    await saveDraft({ id, updatedAt: prepared.metadata.updatedAt, note: prepared });
    setShowCreate(false);
    setActiveDraftId(id);
    setActiveNote(prepared);
    await refresh();
  };

  return (
    <main className="container">
      <header className="appHeader">
        <div className="brandHeader">
          <img
            src={logoSrc}
            alt="EIU CDS Clinic logo"
            className="brandLogo"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
          <div>
            <h1>EIU CDS Speech Language Hearing Clinic SOAP Note System</h1>
            <p className="muted">Front-end only app with local browser drafts (IndexedDB) and manual export/import.</p>
          </div>
        </div>
      </header>

      <div className="phiBanner">Do not use shared/public computers. Avoid full identifiers unless clinic policy requires them.</div>
      <ErrorBanner message={error} />

      {!activeNote && (
        <DashboardPage
          drafts={drafts}
          loading={loading}
          onRefresh={refresh}
          onOpen={(draftId) => void openDraft(draftId)}
          onCreateClicked={() => setShowCreate(true)}
          onClearAll={async () => {
            await clearAllDrafts();
            setActiveDraftId(null);
            setActiveNote(null);
            await refresh();
          }}
        />
      )}

      {activeNote && activeDraftId && (
        <EditorPage
          note={activeNote}
          onChange={setActiveNote}
          onBack={() => {
            setActiveDraftId(null);
            setActiveNote(null);
            void refresh();
          }}
          onDownloadDraft={() => downloadDraftFile(activeNote)}
          onImportDraft={async (file) => {
            try {
              const parsed = await readDraftFile(file);
              const prepared = prepareForSave(parsed);
              setActiveNote(prepared);
              await saveDraft({ id: activeDraftId, updatedAt: prepared.metadata.updatedAt, note: prepared });
              await refresh();
              setError(null);
            } catch {
              setError('Unable to import draft file. Confirm it is a valid .soap.json draft.');
            }
          }}
          onClearCurrentDraft={async () => {
            await deleteDraft(activeDraftId);
            setActiveDraftId(null);
            setActiveNote(null);
            await refresh();
          }}
          onClearLocalDrafts={async () => {
            await clearAllDrafts();
            setActiveDraftId(null);
            setActiveNote(null);
            await refresh();
          }}
          onExportPdf={() => {
            navigate('/print', { state: { note: activeNote } });
          }}
        />
      )}

      <CreateNoteModal
        open={showCreate}
        defaultStudentClinician=""
        onClose={() => setShowCreate(false)}
        onCreate={onCreate}
      />
    </main>
  );
}

export default function App(): JSX.Element {
  return (
    <Routes>
      <Route path="/" element={<HomeRoute />} />
      <Route path="/print" element={<PrintViewPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
