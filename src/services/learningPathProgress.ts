const STORAGE_KEY = 'vocabdaily_learning_path_progress_v1';

export interface LearningPathProgressState {
  completedLessonIds: string[];
  activePathId: string | null;
  updatedAt: string | null;
}

interface LearningPathProgressMap {
  [userId: string]: LearningPathProgressState | undefined;
}

const EMPTY_STATE: LearningPathProgressState = {
  completedLessonIds: [],
  activePathId: null,
  updatedAt: null,
};

const isBrowser = (): boolean => typeof window !== 'undefined' && typeof localStorage !== 'undefined';

const getStore = (): LearningPathProgressMap => {
  if (!isBrowser()) return {};

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as LearningPathProgressMap) : {};
  } catch {
    return {};
  }
};

const setStore = (value: LearningPathProgressMap): void => {
  if (!isBrowser()) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
};

const normalizeState = (value: LearningPathProgressState | undefined): LearningPathProgressState => {
  if (!value) return EMPTY_STATE;

  return {
    completedLessonIds: Array.from(new Set(value.completedLessonIds || [])),
    activePathId: value.activePathId || null,
    updatedAt: value.updatedAt || null,
  };
};

export function getLearningPathProgress(userId: string): LearningPathProgressState {
  const store = getStore();
  return normalizeState(store[userId]);
}

export function setLearningPathActivePath(userId: string, pathId: string | null): LearningPathProgressState {
  const store = getStore();
  const current = normalizeState(store[userId]);
  const next: LearningPathProgressState = {
    ...current,
    activePathId: pathId,
    updatedAt: new Date().toISOString(),
  };

  store[userId] = next;
  setStore(store);
  return next;
}

export function toggleLearningPathLesson(userId: string, lessonId: string): LearningPathProgressState {
  const store = getStore();
  const current = normalizeState(store[userId]);
  const completed = new Set(current.completedLessonIds);

  if (completed.has(lessonId)) {
    completed.delete(lessonId);
  } else {
    completed.add(lessonId);
  }

  const next: LearningPathProgressState = {
    ...current,
    completedLessonIds: [...completed],
    updatedAt: new Date().toISOString(),
  };

  store[userId] = next;
  setStore(store);
  return next;
}

export function getPathCompletionPercent(completedLessonIds: string[], lessonIds: string[]): number {
  if (lessonIds.length === 0) return 0;

  const completed = lessonIds.filter((lessonId) => completedLessonIds.includes(lessonId)).length;
  return Math.round((completed / lessonIds.length) * 100);
}

