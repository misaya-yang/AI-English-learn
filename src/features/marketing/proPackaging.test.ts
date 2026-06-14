import { describe, expect, it } from 'vitest';

import {
  FREE_PLAN_LIMITATIONS,
  PRO_PLAN_FEATURES,
  getProGateReason,
  pickLocalized,
} from './proPackaging';

describe('proPackaging', () => {
  it('defines the Pro launch package around learning outcomes, not generic SaaS perks', () => {
    const features = PRO_PLAN_FEATURES.map((feature) => feature.en).join(' | ');

    expect(features).toContain('IELTS Writing and Speaking scoring');
    expect(features).toContain('Advanced analytics');
    expect(features).toContain('Custom wordbook imports');
    expect(features).toContain('Weekly plan');
    expect(features).not.toContain('Priority support');
  });

  it('keeps Free limitations aligned with the Pro promise', () => {
    const limitations = FREE_PLAN_LIMITATIONS.map((feature) => feature.en);

    expect(limitations).toContain('IELTS writing and speaking scoring');
    expect(limitations).toContain('Advanced analytics and mistake patterns');
    expect(limitations).toContain('Custom wordbook imports');
  });

  it('returns localized gate reasons for quota features', () => {
    expect(getProGateReason('aiExamFeedback', 'zh-CN')).toContain('IELTS');
    expect(getProGateReason('aiChat', 'en')).toContain('weekly planning');
  });

  it('falls back to English when the language is not Chinese', () => {
    expect(pickLocalized({ en: 'Pro job', zh: 'Pro 任务' }, 'fr')).toBe('Pro job');
  });
});
