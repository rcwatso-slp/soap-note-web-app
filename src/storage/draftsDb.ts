import type { DraftSummary, StoredDraft } from '../models/note';

const DB_NAME = 'soap-note-local-db';
const STORE_NAME = 'drafts';
const DB_VERSION = 1;
const FALLBACK_KEY = 'soap-note-drafts-fallback';

function supportsIndexedDb(): boolean {
  return typeof window !== 'undefined' && 'indexedDB' in window;
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(new Error('Failed to open local draft database.'));
  });
}

function readFallback(): StoredDraft[] {
  const raw = localStorage.getItem(FALLBACK_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as StoredDraft[];
  } catch {
    return [];
  }
}

function writeFallback(list: StoredDraft[]): void {
  localStorage.setItem(FALLBACK_KEY, JSON.stringify(list));
}

function summarize(draft: StoredDraft): DraftSummary {
  return {
    id: draft.id,
    updatedAt: draft.updatedAt,
    dateOfSession: draft.note.header.dateOfSession,
    clientKey: draft.note.header.clientKey,
    sessionNumber: draft.note.header.sessionNumber,
    planComplete: draft.note.therapyPlan.planComplete,
    soapComplete: draft.note.soap.soapComplete,
  };
}

export async function saveDraft(draft: StoredDraft): Promise<void> {
  if (!supportsIndexedDb()) {
    const list = readFallback().filter((d) => d.id !== draft.id);
    list.push(draft);
    writeFallback(list);
    return;
  }

  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const req = tx.objectStore(STORE_NAME).put(draft);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(new Error('Failed to save local draft.'));
  });
  db.close();
}

export async function listDrafts(): Promise<DraftSummary[]> {
  if (!supportsIndexedDb()) {
    return readFallback().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).map(summarize);
  }

  const db = await openDb();
  const list = await new Promise<StoredDraft[]>((resolve, reject) => {
    const req = db.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME).getAll();
    req.onsuccess = () => resolve(req.result as StoredDraft[]);
    req.onerror = () => reject(new Error('Failed to read local drafts.'));
  });
  db.close();
  return list.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).map(summarize);
}

export async function getDraft(id: string): Promise<StoredDraft | null> {
  if (!supportsIndexedDb()) {
    return readFallback().find((d) => d.id === id) || null;
  }

  const db = await openDb();
  const draft = await new Promise<StoredDraft | null>((resolve, reject) => {
    const req = db.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME).get(id);
    req.onsuccess = () => resolve((req.result as StoredDraft | undefined) || null);
    req.onerror = () => reject(new Error('Failed to load local draft.'));
  });
  db.close();
  return draft;
}

export async function deleteDraft(id: string): Promise<void> {
  if (!supportsIndexedDb()) {
    writeFallback(readFallback().filter((d) => d.id !== id));
    return;
  }

  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const req = db.transaction(STORE_NAME, 'readwrite').objectStore(STORE_NAME).delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(new Error('Failed to delete local draft.'));
  });
  db.close();
}

export async function clearAllDrafts(): Promise<void> {
  if (!supportsIndexedDb()) {
    localStorage.removeItem(FALLBACK_KEY);
    return;
  }

  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const req = db.transaction(STORE_NAME, 'readwrite').objectStore(STORE_NAME).clear();
    req.onsuccess = () => resolve();
    req.onerror = () => reject(new Error('Failed to clear local drafts.'));
  });
  db.close();
}
