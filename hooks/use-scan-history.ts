"use client";

import { openDB, type DBSchema, type IDBPDatabase } from "idb";
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

const DATABASE_NAME = "malicious-url-detector-v2";
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
    dbPromise = openDB<HistoryDatabase>(DATABASE_NAME, 1, {
      upgrade(database) {
        const store = database.createObjectStore(STORE_NAME, { keyPath: "id" });
        store.createIndex("by-saved-at", "savedAt");
      },
    });
  }

  return dbPromise;
}
