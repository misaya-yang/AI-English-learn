import { corsHeaders, jsonResponse } from '../_shared/cors.ts';
import { callDeepSeek, type DeepSeekMessage } from '../_shared/deepseek.ts';
import { requireAuthenticatedUser } from '../_shared/auth.ts';

const DEFAULT_SYSTEM_PROMPT = `You are an expert English tutor for Chinese-speaking learners.
Return practical, concise guidance with bilingual clarity when helpful.
Focus on vocabulary usage, grammar correction, collocations, and example-driven coaching.`;

interface AiChatContext {
  learningContext?: Record<string, unknown>;
  dialogueContext?: Array<{ role?: string; content?: string }>;
  toolContext?: Record<string, unknown>;
}

const buildContextPrompt = (context: AiChatContext): string => {
  const sections: string[] = [];

  if (context.learningContext && Object.keys(context.learningContext).length > 0) {
    sections.push(`learning_context: ${JSON.stringify(context.learningContext)}`);
  }

  if (Array.isArray(context.dialogueContext) && context.dialogueContext.length > 0) {
    const compactTurns = context.dialogueContext
      .filter((turn) => (turn.role === 'user' || turn.role === 'assistant') && typeof turn.content === 'string')
      .slice(-8)
      .map((turn) => ({ role: turn.role, content: turn.content }));
    if (compactTurns.length > 0) {
      sections.push(`dialogue_context: ${JSON.stringify(compactTurns)}`);
    }
  }

  if (context.toolContext && Object.keys(context.toolContext).length > 0) {
    sections.push(`tool_context: ${JSON.stringify(context.toolContext)}`);
  }

  if (sections.length === 0) {
    return '';
  }

  return `Additional structured context (JSON, trusted):\n${sections.join('\n')}`;
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const auth = await requireAuthenticatedUser(req);
  if (!auth.ok) {
    return auth.response;
  }

  try {
    const body = await req.json().catch(() => ({}));
    const incoming = Array.isArray(body.messages) ? body.messages : [];
    const systemPrompt = typeof body.systemPrompt === 'string' && body.systemPrompt.trim().length > 0
      ? body.systemPrompt
      : DEFAULT_SYSTEM_PROMPT;
    const contextPrompt = buildContextPrompt({
      learningContext: body.learningContext,
      dialogueContext: body.dialogueContext,
      toolContext: body.toolContext,
    });

    const safeMessages: DeepSeekMessage[] = [
      { role: 'system', content: systemPrompt },
      ...(contextPrompt ? [{ role: 'system', content: contextPrompt } as DeepSeekMessage] : []),
      ...incoming.filter((message: unknown) => {
        if (!message || typeof message !== 'object') return false;
        const role = (message as { role?: string }).role;
        const content = (message as { content?: string }).content;
        return (
          (role === 'user' || role === 'assistant' || role === 'system') &&
          typeof content === 'string' &&
          content.trim().length > 0
        );
      }) as DeepSeekMessage[],
    ];

    const content = await callDeepSeek({
      messages: safeMessages,
      temperature: Number(body.temperature) || 0.6,
      maxTokens: Number(body.maxTokens) || 2000,
    });

    return jsonResponse({ content, provider: 'edge' });
  } catch (error) {
    console.error('[ai-chat] error', error);
    return jsonResponse({
      error: 'ai_chat_failed',
      message: error instanceof Error ? error.message : String(error),
    }, 500);
  }
});
