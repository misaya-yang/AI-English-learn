import { describe, expect, it } from 'vitest';

import {
  buildLoadingLabel,
  buildLoadingStages,
} from '@/features/chat/utils/loadingLabel';

const ZH_STAGES = ['正在回复', '正在组织回答', '正在输出中'];
const EN_STAGES = ['Thinking', 'Composing response', 'Streaming'];

describe('buildLoadingStages', () => {
  it('returns Chinese stages for zh* locales', () => {
    expect(buildLoadingStages('zh-CN')).toEqual(ZH_STAGES);
    expect(buildLoadingStages('zh-TW')).toEqual(ZH_STAGES);
  });

  it('returns English stages for non-zh locales', () => {
    expect(buildLoadingStages('en-US')).toEqual(EN_STAGES);
    expect(buildLoadingStages('fr-FR')).toEqual(EN_STAGES);
  });
});

describe('buildLoadingLabel', () => {
  const callWith = (renderStage: 'planning' | 'searching' | 'composing' | 'streaming' | undefined, language = 'en-US') =>
    buildLoadingLabel({
      language,
      renderState: renderStage ? { stage: renderStage } : null,
      isLoading: true,
      hasStreamingContent: false,
      fallbackStages: language.startsWith('zh') ? ZH_STAGES : EN_STAGES,
      fallbackIndex: 0,
    });

  it('produces an English label for each render stage', () => {
    expect(callWith('planning', 'en-US')).toBe('Understanding request');
    expect(callWith('searching', 'en-US')).toBe('Searching evidence');
    expect(callWith('composing', 'en-US')).toBe('Composing response');
    expect(callWith('streaming', 'en-US')).toBe('Rendering response');
  });

  it('produces a Chinese label for each render stage when locale is zh', () => {
    expect(callWith('planning', 'zh-CN')).toBe('正在理解问题');
    expect(callWith('searching', 'zh-CN')).toBe('正在检索学习资料');
    expect(callWith('composing', 'zh-CN')).toBe('正在组织教学答案');
    expect(callWith('streaming', 'zh-CN')).toBe('正在渲染回答');
  });

  it('uses the streaming label when a partial reply is in flight without an explicit stage', () => {
    expect(
      buildLoadingLabel({
        language: 'en-US',
        renderState: null,
        isLoading: true,
        hasStreamingContent: true,
        fallbackStages: EN_STAGES,
        fallbackIndex: 0,
      }),
    ).toBe('Rendering response');
  });

  it('falls back to the rotating stage label when nothing else applies', () => {
    expect(
      buildLoadingLabel({
        language: 'en-US',
        renderState: null,
        isLoading: false,
        hasStreamingContent: false,
        fallbackStages: EN_STAGES,
        fallbackIndex: 1,
      }),
    ).toBe('Composing response');
  });

  it('returns the first fallback stage when fallbackIndex exceeds the list', () => {
    expect(
      buildLoadingLabel({
        language: 'en-US',
        renderState: null,
        isLoading: false,
        hasStreamingContent: false,
        fallbackStages: EN_STAGES,
        fallbackIndex: 99,
      }),
    ).toBe('Thinking');
  });
});
