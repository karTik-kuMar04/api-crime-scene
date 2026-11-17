import type { Investigation, Report } from "./types";

const DB_NAME = "api-crime-scene";
const DB_VERSION = 1;
const STORE_INVESTIGATIONS = "investigations";
const STORE_REPORTS = "reports";

function isIndexedDBAvailable(): boolean {
  return typeof window !== "undefined" && "indexedDB" in window;
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!isIndexedDBAvailable()) {
      reject(new Error("IndexedDB is not available in this environment"));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains(STORE_INVESTIGATIONS)) {
        const invStore = db.createObjectStore(STORE_INVESTIGATIONS, { keyPath: "id" });
        invStore.createIndex("updatedAt", "updatedAt", { unique: false });
        invStore.createIndex("status", "status", { unique: false });
      }

      if (!db.objectStoreNames.contains(STORE_REPORTS)) {
        const repStore = db.createObjectStore(STORE_REPORTS, { keyPath: "id" });
        repStore.createIndex("createdAt", "createdAt", { unique: false });
        repStore.createIndex("investigationId", "investigationId", { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveInvestigation(investigation: Investigation): Promise<void> {
  if (!isIndexedDBAvailable()) return;
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_INVESTIGATIONS, "readwrite");
    const store = tx.objectStore(STORE_INVESTIGATIONS);
    const req = store.put(investigation);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function getInvestigations(): Promise<Investigation[]> {
  if (!isIndexedDBAvailable()) return [];
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_INVESTIGATIONS, "readonly");
    const store = tx.objectStore(STORE_INVESTIGATIONS);
    const req = store.getAll();
    req.onsuccess = () => {
      const list = (req.result as Investigation[]) || [];
      // Sort by updatedAt descending
      list.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      resolve(list);
    };
    req.onerror = () => reject(req.error);
  });
}

export async function getInvestigation(id: string): Promise<Investigation | null> {
  if (!isIndexedDBAvailable()) return null;
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_INVESTIGATIONS, "readonly");
    const store = tx.objectStore(STORE_INVESTIGATIONS);
    const req = store.get(id);
    req.onsuccess = () => resolve((req.result as Investigation) || null);
    req.onerror = () => reject(req.error);
  });
}

export async function deleteInvestigation(id: string): Promise<void> {
  if (!isIndexedDBAvailable()) return;
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_INVESTIGATIONS, "readwrite");
    const store = tx.objectStore(STORE_INVESTIGATIONS);
    const req = store.delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function updateInvestigation(id: string, updates: Partial<Investigation>): Promise<void> {
  const current = await getInvestigation(id);
  if (!current) throw new Error(`Investigation ${id} not found`);
  const updated: Investigation = {
    ...current,
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  await saveInvestigation(updated);
}

export async function saveReport(report: Report): Promise<void> {
  if (!isIndexedDBAvailable()) return;
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_REPORTS, "readwrite");
    const store = tx.objectStore(STORE_REPORTS);
    const req = store.put(report);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function getReports(): Promise<Report[]> {
  if (!isIndexedDBAvailable()) return [];
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_REPORTS, "readonly");
    const store = tx.objectStore(STORE_REPORTS);
    const req = store.getAll();
    req.onsuccess = () => {
      const list = (req.result as Report[]) || [];
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      resolve(list);
    };
    req.onerror = () => reject(req.error);
  });
}

export async function deleteReport(id: string): Promise<void> {
  if (!isIndexedDBAvailable()) return;
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_REPORTS, "readwrite");
    const store = tx.objectStore(STORE_REPORTS);
    const req = store.delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function clearAllData(): Promise<void> {
  if (!isIndexedDBAvailable()) return;
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_INVESTIGATIONS, STORE_REPORTS], "readwrite");
    tx.objectStore(STORE_INVESTIGATIONS).clear();
    tx.objectStore(STORE_REPORTS).clear();
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getStorageMetrics(): Promise<{
  investigationsCount: number;
  requestsCount: number;
  failedRequestsCount: number;
  potentialIssuesCount: number;
}> {
  const investigations = await getInvestigations();
  let requestsCount = 0;
  let failedRequestsCount = 0;

  for (const inv of investigations) {
    requestsCount += inv.entryCount || 0;
    if (inv.har?.log?.entries) {
      for (const entry of inv.har.log.entries) {
        if (entry.response && entry.response.status >= 400) {
          failedRequestsCount++;
        }
      }
    }
  }

  return {
    investigationsCount: investigations.length,
    requestsCount,
    failedRequestsCount,
    potentialIssuesCount: 0, // Rules engine placeholder
  };
}
