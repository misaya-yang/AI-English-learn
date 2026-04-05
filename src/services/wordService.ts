/**
 * wordService.ts — Unified word access layer
 * ─────────────────────────────────────────────────────────────────────────────
 * Priority: Supabase (authoritative) → IndexedDB cache → static fallback
 *
 * The static wordsDatabase remains the offline fallback. When Supabase is
 * reachable and contains words, those are preferred and cached in IDB.
 */

import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import { wordsDatabase, type WordData } from '@/data/words';

// ─── IDB cache via words_cache store ─────────────────────────────────────────

import { openDB, type IDBPDatabase } from 'idb';

const CACHE_DB_NAME = 'vocabdaily';
const CACHE_STORE = 'words_cache';
const CACHE_META_KEY = '__words_cache_meta';

interface CacheMeta {
  id: string;
  fetchedAt: string;
  count: number;
}

async function getCacheDb(): Promise<IDBPDatabase | null> {
  try {
    return await openDB(CACHE_DB_NAME, undefined);
  } catch {
    return null;
  }
}

async function getCachedWords(): Promise<WordData[] | null> {
  const db = await getCacheDb();
  if (!db || !db.objectStoreNames.contains(CACHE_STORE)) return null;

  try {
    const meta = await db.get(CACHE_STORE, CACHE_META_KEY) as CacheMeta | undefined;
    if (!meta) return null;

    // Cache valid for 24 hours
    const age = Date.now() - new Date(meta.fetchedAt).getTime();
    if (age > 24 * 60 * 60 * 1000) return null;

    const all = await db.getAll(CACHE_STORE);
    return all
      .filter((item) => item.id !== CACHE_META_KEY && item.word)
      .map(mapToWordData);
  } catch {
    return null;
  }
}

async function setCachedWords(words: WordData[]): Promise<void> {
  const db = await getCacheDb();
  if (!db || !db.objectStoreNames.contains(CACHE_STORE)) return;

  try {
    const tx = db.transaction(CACHE_STORE, 'readwrite');
    const store = tx.objectStore(CACHE_STORE);

    await store.clear();

    const puts = words.map((word) => store.put({ ...word }));
    puts.push(
      store.put({
        id: CACHE_META_KEY,
        fetchedAt: new Date().toISOString(),
        count: words.length,
      }),
    );
    await Promise.all(puts);

    await tx.done;
  } catch (err) {
    logger.error('[wordService] cache write failed:', err);
  }
}

// ─── Supabase fetch ──────────────────────────────────────────────────────────

interface SupabaseWord {
  id: string;
  word: string;
  phonetic?: string;
  part_of_speech?: string;
  definition?: string;
  definition_zh?: string;
  examples?: Array<{ en: string; zh: string }>;
  synonyms?: string[];
  antonyms?: string[];
  collocations?: string[];
  level?: string;
  topic?: string;
  etymology?: string;
  memory_tip?: string;
}

function mapToWordData(row: SupabaseWord | Record<string, unknown>): WordData {
  const r = row as Record<string, unknown>;
  return {
    id: String(r.id ?? ''),
    word: String(r.word ?? ''),
    phonetic: String(r.phonetic ?? ''),
    partOfSpeech: String(r.part_of_speech ?? r.partOfSpeech ?? ''),
    definition: String(r.definition ?? ''),
    definitionZh: String(r.definition_zh ?? r.definitionZh ?? ''),
    examples: (r.examples as Array<{ en: string; zh: string }>) ?? [],
    synonyms: (r.synonyms as string[]) ?? [],
    antonyms: (r.antonyms as string[]) ?? [],
    collocations: (r.collocations as string[]) ?? [],
    level: (r.level as WordData['level']) ?? 'B1',
    topic: String(r.topic ?? 'daily'),
    etymology: r.etymology as string | undefined,
    memoryTip: (r.memory_tip ?? r.memoryTip) as string | undefined,
  };
}

async function fetchFromSupabase(): Promise<WordData[] | null> {
  try {
    const { data, error } = await supabase
      .from('words')
      .select('*')
      .order('level')
      .limit(5000);

    if (error || !data || data.length === 0) return null;
    return data.map(mapToWordData);
  } catch {
    return null;
  }
}

// ─── Unified word provider ──────────────────────────────────────────────────

let _allWords: WordData[] | null = null;
let _loadPromise: Promise<WordData[]> | null = null;

/**
 * Returns all available words, using the best available source.
 * Safe to call multiple times — deduplicates concurrent fetches.
 */
export async function getAllWords(): Promise<WordData[]> {
  if (_allWords) return _allWords;
  if (_loadPromise) return _loadPromise;

  _loadPromise = (async () => {
    // 1. Try IDB cache
    const cached = await getCachedWords();
    if (cached && cached.length > 0) {
      _allWords = cached;
      // Background refresh from Supabase
      void refreshFromSupabase();
      return cached;
    }

    // 2. Try Supabase directly
    const remote = await fetchFromSupabase();
    if (remote && remote.length > 0) {
      _allWords = remote;
      void setCachedWords(remote);
      return remote;
    }

    // 3. Fallback to static database
    _allWords = wordsDatabase;
    return wordsDatabase;
  })();

  return _loadPromise;
}

/**
 * Returns the static wordsDatabase synchronously (for backward compat).
 * Prefer getAllWords() for fresh data.
 */
export function getStaticWords(): WordData[] {
  return _allWords ?? wordsDatabase;
}

async function refreshFromSupabase(): Promise<void> {
  const remote = await fetchFromSupabase();
  if (remote && remote.length > 0) {
    _allWords = remote;
    void setCachedWords(remote);
  }
}

/**
 * Force a reload from Supabase. Useful after importing new words.
 */
export async function invalidateWordCache(): Promise<void> {
  _allWords = null;
  _loadPromise = null;
  await getAllWords();
}

