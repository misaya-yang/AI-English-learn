import type { ReactNode } from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { ExamItem } from '@/types/examContent';

const examMocks = vi.hoisted(() => ({
  getAiFeedbackHistory: vi.fn(() => []),
  getLatestAiFeedback: vi.fn(() => null),
  saveAiFeedbackRecord: vi.fn(),
  saveItemAttempt: vi.fn(),
  askWritingTutor: vi.fn().mockResolvedValue('Tutor reply'),
  buildQuickOutline: vi.fn(() => ({
    intro: '',
    body1: '',
    body2: '',
    conclusion: '',
    checklist: [],
  })),
  consumeExamFeatureQuota: vi.fn().mockResolvedValue({ allowed: true, remaining: 2 }),
  createAttempt: vi.fn(() => ({
    id: 'attempt-1',
    userId: 'exam-user',
    itemId: 'item-1',
    examType: 'IELTS',
    skill: 'writing',
    answer: 'answer',
    createdAt: '2026-07-16T00:00:00.000Z',
  })),
  enhanceVocabularyDraft: vi.fn(() => []),
  generateMicroLessonFromErrors: vi.fn(),
  generateRandomIeltsPrompt: vi.fn(() => ({
    prompt: 'Generated prompt',
    taskType: 'task2',
    topic: 'topic',
    difficulty: 'medium',
  })),
  generateSimulationItem: vi.fn(),
  gradeIeltsWriting: vi.fn(),
  recordLearningEvent: vi.fn().mockResolvedValue(undefined),
  toastError: vi.fn(),
  toastInfo: vi.fn(),
  toastSuccess: vi.fn(),
}));

vi.mock('@/data/examContent', () => ({
  getAiFeedbackHistory: examMocks.getAiFeedbackHistory,
  getLatestAiFeedback: examMocks.getLatestAiFeedback,
  saveAiFeedbackRecord: examMocks.saveAiFeedbackRecord,
  saveItemAttempt: examMocks.saveItemAttempt,
}));

vi.mock('@/services/aiExamCoach', () => ({
  askWritingTutor: examMocks.askWritingTutor,
  buildQuickOutline: examMocks.buildQuickOutline,
  consumeExamFeatureQuota: examMocks.consumeExamFeatureQuota,
  createAttempt: examMocks.createAttempt,
  enhanceVocabularyDraft: examMocks.enhanceVocabularyDraft,
  generateMicroLessonFromErrors: examMocks.generateMicroLessonFromErrors,
  generateRandomIeltsPrompt: examMocks.generateRandomIeltsPrompt,
  generateSimulationItem: examMocks.generateSimulationItem,
  gradeIeltsWriting: examMocks.gradeIeltsWriting,
}));

vi.mock('@/services/learningEvents', () => ({
  recordLearningEvent: examMocks.recordLearningEvent,
}));

vi.mock('sonner', () => ({
  toast: {
    error: examMocks.toastError,
    info: examMocks.toastInfo,
    success: examMocks.toastSuccess,
  },
}));

import { useExamPrepRuntime } from './useExamPrepRuntime';

const wrapper = ({ children }: { children: ReactNode }) => (
  <MemoryRouter>{children}</MemoryRouter>
);

const createExamItem = (id: string, prompt: string): ExamItem => ({
  id,
  unitId: `unit-${id}`,
  examType: 'IELTS',
  skill: 'writing',
  itemType: 'writing_task_2',
  prompt,
  referenceAnswer: '',
  rubricId: 'rubric-1',
  source: 'test',
  license: 'test',
});

const createDeferred = <T,>() => {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
};

const refreshQuota = vi.fn().mockResolvedValue(undefined);
const onSwitchTrack = vi.fn();
const onSwitchUnit = vi.fn();

const renderRuntime = (selectedItem: ExamItem | null = createExamItem('item-1', 'Prompt one')) =>
  renderHook(
    ({ item }) => useExamPrepRuntime({
      userId: 'exam-user',
      selectedTrackBandTarget: '7.0',
      selectedTrackId: 'track-1',
      selectedUnitId: item?.unitId || 'unit-1',
      selectedItem: item,
      refreshQuota,
      onSwitchTrack,
      onSwitchUnit,
    }),
    {
      initialProps: { item: selectedItem },
      wrapper,
    },
  );

describe('useExamPrepRuntime', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    refreshQuota.mockResolvedValue(undefined);
    examMocks.consumeExamFeatureQuota.mockResolvedValue({ allowed: true, remaining: 2 });
    examMocks.generateRandomIeltsPrompt.mockReturnValue({
      prompt: 'Generated prompt',
      taskType: 'task2',
      topic: 'topic',
      difficulty: 'medium',
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('clears the previous draft when the selected exam item changes', async () => {
    const firstItem = createExamItem('item-1', 'Prompt one');
    const secondItem = createExamItem('item-2', 'Prompt two');
    const runtime = renderRuntime(firstItem);

    await waitFor(() => {
      expect(runtime.result.current.writingPrompt).toBe('Prompt one');
    });
    act(() => {
      runtime.result.current.setWritingAnswer('Draft for prompt one');
    });

    runtime.rerender({ item: secondItem });

    await waitFor(() => {
      expect(runtime.result.current.writingPrompt).toBe('Prompt two');
      expect(runtime.result.current.writingAnswer).toBe('');
    });
  });

  it('clears the previous draft when a new random prompt is generated', async () => {
    const runtime = renderRuntime();

    act(() => {
      runtime.result.current.setWritingAnswer('Old draft');
      runtime.result.current.handleGeneratePrompt();
    });

    expect(runtime.result.current.writingPrompt).toBe('Generated prompt');
    expect(runtime.result.current.writingAnswer).toBe('');
    expect(runtime.result.current.workspaceView).toBe('draft');
  });

  it('ignores a simulation response that arrives after the timeout', async () => {
    vi.useFakeTimers();
    const generated = createDeferred<ExamItem>();
    examMocks.generateSimulationItem.mockReturnValueOnce(generated.promise);
    const runtime = renderRuntime();

    let pending!: Promise<void>;
    act(() => {
      pending = runtime.result.current.handleGenerateSimItem();
    });
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(examMocks.generateSimulationItem).toHaveBeenCalledTimes(1);
    expect(runtime.result.current.loadingStage).toBe('simulating');

    act(() => {
      vi.advanceTimersByTime(30000);
    });
    expect(runtime.result.current.loadingStage).toBe('idle');
    expect(examMocks.toastError).toHaveBeenCalledWith('准备超时，请检查网络后重试。');

    generated.resolve(createExamItem('late-item', 'Late prompt'));
    await act(async () => {
      await pending;
    });

    expect(runtime.result.current.writingPrompt).toBe('Prompt one');
    expect(runtime.result.current.simItem).toBeNull();
    expect(examMocks.toastSuccess).not.toHaveBeenCalledWith('仿真题已就绪，计时已启动。');
  });

  it('lets the newest simulation request win over an older late response', async () => {
    const first = createDeferred<ExamItem>();
    const second = createDeferred<ExamItem>();
    examMocks.generateSimulationItem
      .mockReturnValueOnce(first.promise)
      .mockReturnValueOnce(second.promise);
    const runtime = renderRuntime();

    let firstPending!: Promise<void>;
    act(() => {
      firstPending = runtime.result.current.handleGenerateSimItem();
    });
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    let secondPending!: Promise<void>;
    act(() => {
      secondPending = runtime.result.current.handleGenerateSimItem();
    });
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    second.resolve(createExamItem('new-item', 'Newest prompt'));
    await act(async () => {
      await secondPending;
    });
    expect(runtime.result.current.writingPrompt).toBe('Newest prompt');

    first.resolve(createExamItem('old-item', 'Old late prompt'));
    await act(async () => {
      await firstPending;
    });
    expect(runtime.result.current.writingPrompt).toBe('Newest prompt');
  });
});
