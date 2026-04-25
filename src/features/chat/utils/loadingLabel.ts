import type { ChatRenderState } from '@/types/chatAgent';

interface LoadingLabelArgs {
  language: string;
  renderState?: ChatRenderState | null;
  isLoading: boolean;
  hasStreamingContent: boolean;
  fallbackStages: string[];
  fallbackIndex: number;
}

/**
 * Decide the human-readable label shown next to the spinner while the assistant is replying.
 *
 * Centralises the multi-branch fallback so the inline `loadingLabel` IIFE in `ChatPage.tsx`
 * disappears without changing user-visible behaviour.
 */
export const buildLoadingLabel = ({
  language,
  renderState,
  isLoading,
  hasStreamingContent,
  fallbackStages,
  fallbackIndex,
}: LoadingLabelArgs): string => {
  const isZh = language.startsWith('zh');

  if (renderState?.stage === 'planning') {
    return isZh ? '正在理解问题' : 'Understanding request';
  }
  if (renderState?.stage === 'searching') {
    return isZh ? '正在检索学习资料' : 'Searching evidence';
  }
  if (renderState?.stage === 'composing') {
    return isZh ? '正在组织教学答案' : 'Composing response';
  }
  if (renderState?.stage === 'streaming' || (isLoading && hasStreamingContent)) {
    return isZh ? '正在渲染回答' : 'Rendering response';
  }
  return fallbackStages[fallbackIndex] || fallbackStages[0] || '';
};

export const buildLoadingStages = (language: string): string[] =>
  language.startsWith('zh')
    ? ['正在回复', '正在组织回答', '正在输出中']
    : ['Thinking', 'Composing response', 'Streaming'];
