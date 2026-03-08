import type { AgentMeta, ContextMeta, MemoryUsedTrace, MemoryWriteTrace } from '@/types/chatAgent';

interface ChatAgentSignalsProps {
  language: string;
  agentMeta: AgentMeta | null;
  contextMeta: ContextMeta | null;
  memoryUsed: MemoryUsedTrace[];
  memoryWrites: MemoryWriteTrace[];
  memoryTraceId?: string | null;
}

export function ChatAgentSignals({
  language,
  agentMeta,
  contextMeta,
  memoryUsed,
  memoryWrites,
  memoryTraceId,
}: ChatAgentSignalsProps) {
  if (!agentMeta?.triggerReason && !contextMeta && memoryUsed.length === 0 && memoryWrites.length === 0) {
    return null;
  }

  return (
    <div className="space-y-1 rounded-xl border border-border/70 bg-background/80 px-3 py-2 text-[11px] text-muted-foreground">
      {agentMeta?.triggerReason && (
        <p>{language.startsWith('zh') ? '触发原因' : 'Trigger'}: {agentMeta.triggerReason}</p>
      )}

      {contextMeta && (
        <p>
          {language.startsWith('zh') ? '上下文' : 'Context'}: {contextMeta.inputTokensEst}t ·
          {contextMeta.compacted
            ? language.startsWith('zh')
              ? ' 已压缩'
              : ' compacted'
            : language.startsWith('zh')
              ? ' 未压缩'
              : ' raw'}
          {contextMeta.searchTriggered
            ? language.startsWith('zh')
              ? ' · 已搜索'
              : ' · searched'
            : ''}
        </p>
      )}

      {(memoryUsed.length > 0 || memoryWrites.length > 0) && (
        <div className="space-y-1 border-t border-border/60 pt-1">
          {memoryUsed.length > 0 && (
            <p>
              {language.startsWith('zh') ? '命中记忆' : 'Memory used'}: {memoryUsed.length}
              {' · '}
              {memoryUsed
                .slice(0, 2)
                .map((item) => `${item.kind}(${Math.round(item.score * 100)}%)`)
                .join(', ')}
            </p>
          )}
          {memoryWrites.length > 0 && (
            <p>
              {language.startsWith('zh') ? '新增记忆' : 'Memory writes'}: {memoryWrites.length}
              {' · '}
              {memoryWrites
                .slice(0, 2)
                .map((item) => `${item.kind}/${item.reason}`)
                .join(', ')}
            </p>
          )}
          {memoryTraceId && (
            <p className="text-[10px] opacity-75">trace: {memoryTraceId}</p>
          )}
        </div>
      )}
    </div>
  );
}
