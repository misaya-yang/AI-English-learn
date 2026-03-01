import { invokeEdgeFunction } from './aiGateway';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export async function sendMessageToDeepSeekStream(
  messages: ChatMessage[],
  onChunk: (chunk: string) => void,
  onComplete: () => void,
  onError: (error: Error) => void,
): Promise<void> {
  try {
    const result = await invokeEdgeFunction<{ content: string }>('ai-chat', {
      messages,
    });
    const content = result.content;

    const chunks = content.match(/[\s\S]{1,24}/g) || [content];
    for (const chunk of chunks) {
      onChunk(chunk);
      await new Promise((resolve) => setTimeout(resolve, 10));
    }

    onComplete();
  } catch (error) {
    onError(error instanceof Error ? error : new Error(String(error)));
  }
}

export async function sendMessageToDeepSeek(messages: ChatMessage[]): Promise<string> {
  const result = await invokeEdgeFunction<{ content: string }>('ai-chat', {
    messages,
  });

  if (!result?.content) {
    throw new Error('AI returned empty content');
  }

  return result.content;
}
