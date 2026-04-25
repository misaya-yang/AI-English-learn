// LEARN-01 — three-profile coverage for the Today hero source-signal label.
//
// Pins the mapping for low / medium / high burnout learners so a future
// picker change can't silently swap the framing the cockpit shows.

import { describe, expect, it } from 'vitest';

import { deriveMissionSourceSignal } from './missionSourceSignal';

describe('deriveMissionSourceSignal', () => {
  it('low burnout + due_words reason -> "due backlog"', () => {
    const sig = deriveMissionSourceSignal({
      reason: 'due_words',
      learnerMode: 'maintenance',
      burnoutRisk: 0.2,
    });
    expect(sig.signal).toBe('due backlog');
    expect(sig.label.zh).toBe('到期积压');
  });

  it('medium burnout + weakness_drill reason -> "weak topic"', () => {
    const sig = deriveMissionSourceSignal({
      reason: 'weakness_drill',
      learnerMode: 'steady',
      burnoutRisk: 0.45,
    });
    expect(sig.signal).toBe('weak topic');
  });

  it('high burnout (>= threshold) flips to "streak recovery" regardless of reason', () => {
    const sig = deriveMissionSourceSignal({
      reason: 'exam_boost',
      learnerMode: 'sprint',
      burnoutRisk: 0.8,
      examType: 'IELTS',
    });
    expect(sig.signal).toBe('streak recovery');
    expect(sig.label.en).toBe('Streak recovery');
  });

  it('recovery learnerMode forces "streak recovery"', () => {
    const sig = deriveMissionSourceSignal({
      reason: 'due_words',
      learnerMode: 'recovery',
      burnoutRisk: 0.3,
    });
    expect(sig.signal).toBe('streak recovery');
  });

  it('exam_boost reason without recovery -> "exam target"', () => {
    const sig = deriveMissionSourceSignal({
      reason: 'exam_boost',
      learnerMode: 'sprint',
      burnoutRisk: 0.1,
      examType: 'IELTS',
    });
    expect(sig.signal).toBe('exam target');
  });

  it('falls back to exam target when an exam path is active', () => {
    const sig = deriveMissionSourceSignal({
      reason: 'today_words',
      learnerMode: 'steady',
      burnoutRisk: 0.2,
      examType: 'IELTS',
    });
    expect(sig.signal).toBe('exam target');
  });

  it('default fallback is weak topic (never returns generic)', () => {
    const sig = deriveMissionSourceSignal({
      reason: 'today_words',
      learnerMode: 'steady',
      burnoutRisk: 0.2,
    });
    expect(sig.signal).toBe('weak topic');
  });
});
