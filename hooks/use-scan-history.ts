"use client";

import { deleteDB, openDB, type DBSchema, type IDBPDatabase } from "idb";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";

import type { AnalysisResult, HistoryEntry, Verdict } from "@/lib/domain/types";

interface HistoryDatabase extends DBSchema {
  scans: {
    key: string;
    value: HistoryEntry;
    indexes: {
      "by-saved-at": string;
    };
  };
}

const DATABASE_NAME = "scrutinix-v2";
const LEGACY_DATABASE_NAME = "malicious-url-detector-v2";
const STORE_NAME = "scans";

let dbPromise: Promise<IDBPDatabase<HistoryDatabase>> | null = null;

export function useScanHistory() {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [historyQuery, setHistoryQuery] = useState("");
  const [filterVerdict, setFilterVerdict] = useState<Verdict | "all">("all");
  const [lastClearedEntries, setLastClearedEntries] = useState<HistoryEntry[]>(
    [],
  );
  const [, startTransition] = useTransition();

  useEffect(() => {
    void loadHistory().then((loaded) => {
      setEntries(loaded);
    });
  }, []);

  const addResult = useCallback(
    async (result: AnalysisResult) => {
      const entry: HistoryEntry = {
        ...result,
        savedAt: new Date().toISOString(),
      };
      const db = await getDatabase();
      await db.put(STORE_NAME, entry);
      startTransition(() => {
        setEntries((previous) =>
          sortEntries([
            entry,
            ...previous.filter((item) => item.id !== entry.id),
          ]),
        );
        setLastClearedEntries([]);
      });
    },
    [startTransition],
  );

  const clearHistory = useCallback(async () => {
    const snapshot = entries;
    const db = await getDatabase();
    await db.clear(STORE_NAME);
    startTransition(() => {
      setEntries([]);
      setLastClearedEntries(snapshot);
    });
  }, [entries, startTransition]);

  const undoClearHistory = useCallback(async () => {
    if (!lastClearedEntries.length) {
      return;
    }

    const db = await getDatabase();
    const tx = db.transaction(STORE_NAME, "readwrite");
    await Promise.all(lastClearedEntries.map((entry) => tx.store.put(entry)));
    await tx.done;

    startTransition(() => {
      setEntries(sortEntries(lastClearedEntries));
      setLastClearedEntries([]);
    });
  }, [lastClearedEntries, startTransition]);

  const filteredEntries = useMemo(() => {
    const query = historyQuery.trim().toLowerCase();
    return entries.filter((entry) => {
      const matchesVerdict =
        filterVerdict === "all" || entry.verdict === filterVerdict;
      const matchesQuery =
        query.length === 0 ||
        entry.url.toLowerCase().includes(query) ||
        entry.threatInfo?.summary.toLowerCase().includes(query);
      return matchesVerdict && matchesQuery;
    });
  }, [entries, filterVerdict, historyQuery]);

  return {
    entries,
    filteredEntries,
    historyQuery,
    setHistoryQuery,
    filterVerdict,
    setFilterVerdict,
    addResult,
    clearHistory,
    undoClearHistory,
    canUndoClear: lastClearedEntries.length > 0,
  };
}

async function loadHistory() {
  const db = await getDatabase();
  const values = await db.getAllFromIndex(STORE_NAME, "by-saved-at");
  return sortEntries(values);
}

function sortEntries(entries: HistoryEntry[]) {
  return [...entries].sort((left, right) =>
    right.savedAt.localeCompare(left.savedAt),
  );
}

function getDatabase() {
  if (typeof window === "undefined") {
    return Promise.reject(
      new Error("IndexedDB is only available in the browser."),
    );
  }

  if (!dbPromise) {
    dbPromise = openHistoryDatabase();
  }

  return dbPromise;
}

async function openHistoryDatabase() {
  const database = await openDB<HistoryDatabase>(DATABASE_NAME, 1, {
    upgrade(upgradeDatabase) {
      initializeHistoryStore(upgradeDatabase);
    },
  });

  try {
    await migrateLegacyHistory(database);
  } catch (error) {
    console.warn("[Scrutinix] Failed to migrate legacy scan history.", error);
  }
  return database;
}

function initializeHistoryStore(database: IDBPDatabase<HistoryDatabase>) {
  if (database.objectStoreNames.contains(STORE_NAME)) {
    return;
  }

  const store = database.createObjectStore(STORE_NAME, { keyPath: "id" });
  store.createIndex("by-saved-at", "savedAt");
}

async function migrateLegacyHistory(database: IDBPDatabase<HistoryDatabase>) {
  const legacyEntries = await readLegacyHistoryEntries();
  if (legacyEntries.length === 0) {
    return;
  }

  const transaction = database.transaction(STORE_NAME, "readwrite");
  await Promise.all(legacyEntries.map((entry) => transaction.store.put(entry)));
  await transaction.done;

  await deleteDB(LEGACY_DATABASE_NAME);
}

async function readLegacyHistoryEntries() {
  const legacyDatabase = await openLegacyDatabase();
  if (!legacyDatabase) {
    return [];
  }

  if (legacyDatabase.wasCreated) {
    legacyDatabase.database.close();
    await deleteDB(LEGACY_DATABASE_NAME);
    return [];
  }

  if (!legacyDatabase.database.objectStoreNames.contains(STORE_NAME)) {
    legacyDatabase.database.close();
    return [];
  }

  const transaction = legacyDatabase.database.transaction(
    STORE_NAME,
    "readonly",
  );
  const store = transaction.objectStore(STORE_NAME);
  const entries = await requestToPromise<HistoryEntry[]>(store.getAll());
  legacyDatabase.database.close();
  return entries;
}

async function openLegacyDatabase() {
  return await new Promise<{
    database: IDBDatabase;
    wasCreated: boolean;
  } | null>((resolve, reject) => {
    const request = window.indexedDB.open(LEGACY_DATABASE_NAME);
    let wasCreated = false;

    request.onupgradeneeded = () => {
      wasCreated = true;
    };
    request.onsuccess = () => {
      resolve({
        database: request.result,
        wasCreated,
      });
    };
    request.onerror = () => {
      reject(
        request.error ??
          new Error("Failed to open the legacy history database."),
      );
    };
    request.onblocked = () => {
      reject(new Error("Legacy history migration was blocked by another tab."));
    };
  });
}

async function requestToPromise<T>(request: IDBRequest<T>) {
  return await new Promise<T>((resolve, reject) => {
    request.onsuccess = () => {
      resolve(request.result);
    };
    request.onerror = () => {
      reject(request.error ?? new Error("IndexedDB request failed."));
    };
  });
}
