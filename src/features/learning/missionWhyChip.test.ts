import { describe, expect, it } from 'vitest';

import { getMissionWhyChip } from './missionWhyChip';

describe('getMissionWhyChip', () => {
  it('maps each known reason to a stable variant + label', () => {
    expect(getMissionWhyChip({ reason: 'recovery_mode' })).toMatchObject({
      reasonId: 'recovery_mode',
      variant: 'recovery',
      label: { en: 'Recovery mode', zh: '回稳模式' },
    });
    expect(getMissionWhyChip({ reason: 'exam_boost' })).toMatchObject({
      reasonId: 'exam_boost',
      variant: 'sprint',
    });
    expect(getMissionWhyChip({ reason: 'due_words' })).toMatchObject({
      reasonId: 'due_words',
      variant: 'review',
    });
    expect(getMissionWhyChip({ reason: 'today_words' })).toMatchObject({
      reasonId: 'today_words',
      variant: 'today',
    });
    expect(getMissionWhyChip({ reason: 'weakness_drill' })).toMatchObject({
      reasonId: 'weakness_drill',
      variant: 'weakness',
    });
    expect(getMissionWhyChip({ reason: 'practice_gap' })).toMatchObject({
      reasonId: 'practice_gap',
      variant: 'practice',
    });
  });

  it('falls back to "default" for unknown / empty / nullish input', () => {
    expect(getMissionWhyChip({}).variant).toBe('default');
    expect(getMissionWhyChip({ reason: '' }).variant).toBe('default');
    expect(getMissionWhyChip({ reason: null }).variant).toBe('default');
    expect(getMissionWhyChip({ reason: 'totally_invented' }).variant).toBe('default');
  });

  it('forces recovery framing when learnerMode is recovery, regardless of reason', () => {
    const result = getMissionWhyChip({
      reason: 'today_words',
      learnerMode: 'recovery',
    });
    expect(result.variant).toBe('recovery');
    expect(result.label.zh).toBe('回稳模式');
  });

  it('forces recovery framing when burnoutRisk is critical, regardless of reason', () => {
    const result = getMissionWhyChip({
      reason: 'today_words',
      burnoutRisk: 0.9,
    });
    expect(result.variant).toBe('recovery');
  });

  it('promotes sprint mode to exam-boost framing when not in recovery', () => {
    const result = getMissionWhyChip({
      reason: 'today_words',
      learnerMode: 'sprint',
    });
    expect(result.variant).toBe('sprint');
    expect(result.label.en).toBe('Exam push');
  });

  it('keeps recovery framing even when sprint is also requested', () => {
    const result = getMissionWhyChip({
      reason: 'recovery_mode',
      learnerMode: 'sprint',
      burnoutRisk: 0.9,
    });
    expect(result.variant).toBe('recovery');
  });

  it('preserves the original reasonId when known, even after recovery override', () => {
    const result = getMissionWhyChip({
      reason: 'today_words',
      burnoutRisk: 0.95,
    });
    expect(result.reasonId).toBe('today_words');
  });
});
