import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

import {
  COACHING_POLICY_VERSION,
  buildCoachSystemPrompt,
  normalizeLearningContext,
  parseCoachingActions,
  toReviewQueueItems,
  type CoachingAction,
  type LearnerContext,
} from './coachingPolicy';

describe('normalizeLearningContext', () => {
  it('accepts canonical weaknessTags', () => {
    const ctx = normalizeLearningContext({
      weaknessTags: ['past-perfect', 'collocations'],
    });
    expect(ctx.weaknessTags).toEqual(['past-perfect', 'collocations']);
  });

  it('promotes legacy weakTags to canonical weaknessTags', () => {
    const ctx = normalizeLearningContext({ weakTags: ['phrasal-verbs'] });
    expect(ctx.weaknessTags).toEqual(['phrasal-verbs']);
  });

  it('merges weakTags and weaknessTags while deduping', () => {
    const ctx = normalizeLearningContext({
      weakTags: ['collocations', 'articles'],
      weaknessTags: ['collocations', 'past-perfect'],
    });
    expect(ctx.weaknessTags).toEqual(
      expect.arrayContaining(['collocations', 'articles', 'past-perfect']),
    );
    expect(ctx.weaknessTags).toHaveLength(3);
  });

  it('drops non-strings and empty values', () => {
    const ctx = normalizeLearningContext({
      weaknessTags: ['a', 42, null, '  ', 'b'],
    });
    expect(ctx.weaknessTags).toEqual(['a', 'b']);
  });

  it('clamps weaknessTags to eight entries', () => {
    const many = Array.from({ length: 20 }, (_, i) => `tag-${i}`);
    const ctx = normalizeLearningContext({ weaknessTags: many });
    expect(ctx.weaknessTags).toHaveLength(8);
  });

  it('preserves learner-model fields with safe fallbacks', () => {
    const ctx = normalizeLearningContext({
      level: 'B1',
      target: 'IELTS 7',
      examType: 'IELTS',
      dailyMinutes: 20,
      dueCount: 35,
      learnerMode: 'recovery',
      burnoutRisk: 'high',
      stubbornTopics: ['articles'],
      recommendedDailyReview: 12,
      predictedRetention30d: 0.62,
    });
    expect(ctx).toMatchObject({
      level: 'B1',
      target: 'IELTS 7',
      examType: 'IELTS',
      dailyMinutes: 20,
      dueCount: 35,
      learnerMode: 'recovery',
      burnoutRisk: 'high',
      predictedRetention30d: 0.62,
    });
  });

  it('rejects unknown learnerMode and burnoutRisk values', () => {
    const ctx = normalizeLearningContext({
      learnerMode: 'eject',
      burnoutRisk: 'nuclear',
    });
    expect(ctx.learnerMode).toBeUndefined();
    expect(ctx.burnoutRisk).toBeUndefined();
  });

  it('returns {} for null / primitive / undefined input', () => {
    expect(normalizeLearningContext(null)).toEqual({});
    expect(normalizeLearningContext(undefined)).toEqual({});
    expect(normalizeLearningContext(7)).toEqual({});
    expect(normalizeLearningContext('nope')).toEqual({});
  });

  it('keeps recentErrors only when well-formed', () => {
    const ctx = normalizeLearningContext({
      recentErrors: [
        { word: 'affect', skill: 'vocab', errorType: 'vocab', note: 'confused with effect' },
        { word: 'hasnt', skill: 'grammar' },
        { skill: 'grammar', errorType: 'not-a-real-type' },
        null,
        'junk',
      ],
    });
    expect(ctx.recentErrors).toHaveLength(2);
    expect(ctx.recentErrors?.[0].word).toBe('affect');
    expect(ctx.recentErrors?.[1].errorType).toBeUndefined();
  });
});

describe('buildCoachSystemPrompt', () => {
  it('encodes Socratic teaching, not answer-dumping', () => {
    const prompt = buildCoachSystemPrompt({}, { surface: 'chat', mode: 'chat' });
    // Core Socratic directives the policy must carry to the model.
    expect(prompt).toMatch(/do not .*give.*answer|resist answering|ask before you tell/i);
    expect(prompt).toMatch(/retry|try again|have the learner attempt/i);
    expect(prompt).toMatch(/small task|micro[- ]task|30 seconds|tiny challenge/i);
  });

  it('forbids unconditional praise templates', () => {
    const prompt = buildCoachSystemPrompt({}, { surface: 'chat', mode: 'chat' });
    expect(prompt).not.toMatch(/\bGreat job!\b/);
    expect(prompt).not.toMatch(/\bExcellent!\b\s*$/m);
    // Positive reinforcement must be tied to specific behaviour.
    expect(prompt).toMatch(/specific|concrete|what they just did/i);
  });

  it('enumerates the canonical error types the coach must tag', () => {
    const prompt = buildCoachSystemPrompt({}, {});
    for (const errorType of ['grammar', 'vocab', 'pragmatic', 'logic', 'pronunciation', 'listening']) {
      expect(prompt).toContain(errorType);
    }
  });

  it('declares the coaching_actions contract the model must emit', () => {
    const prompt = buildCoachSystemPrompt({}, {});
    expect(prompt).toMatch(/coaching_actions/);
    // The action types the parser expects.
    expect(prompt).toMatch(/ask_socratic_question/);
    expect(prompt).toMatch(/retry_with_hint/);
    expect(prompt).toMatch(/micro_task/);
    expect(prompt).toMatch(/schedule_review/);
    expect(prompt).toMatch(/reflection_prompt/);
  });

  it('cites the learner model when level/target/weakness are known', () => {
    const prompt = buildCoachSystemPrompt(
      {
        level: 'B1',
        target: 'IELTS 7',
        weaknessTags: ['past-perfect', 'articles'],
        dueCount: 22,
      },
      { surface: 'today' },
    );
    expect(prompt).toContain('B1');
    expect(prompt).toContain('IELTS 7');
    expect(prompt).toContain('past-perfect');
    expect(prompt).toContain('articles');
    expect(prompt).toMatch(/22 .*due|due.* 22/);
  });

  it('switches to recovery framing when burnoutRisk is high', () => {
    const prompt = buildCoachSystemPrompt(
      { burnoutRisk: 'high', dueCount: 120, learnerMode: 'recovery' },
      { surface: 'today' },
    );
    expect(prompt).toMatch(/recovery|low[- ]pressure|lighten|do not push/i);
    expect(prompt).toMatch(/do not .*add new words|skip new words|focus on review/i);
  });

  it('adapts to exam surface', () => {
    const prompt = buildCoachSystemPrompt(
      { examType: 'IELTS' },
      { surface: 'exam' },
    );
    expect(prompt).toMatch(/exam/i);
    expect(prompt).toContain('IELTS');
  });

  it('renders a usable prompt when learner context is empty', () => {
    const prompt = buildCoachSystemPrompt({}, {});
    expect(typeof prompt).toBe('string');
    expect(prompt.length).toBeGreaterThan(200);
    // No dangling template variables or "undefined" tokens.
    expect(prompt).not.toMatch(/\bundefined\b/);
    expect(prompt).not.toMatch(/\{\{|\}\}/);
  });

  it('includes the policy version for traceability', () => {
    const prompt = buildCoachSystemPrompt({}, {});
    expect(prompt).toContain(COACHING_POLICY_VERSION);
  });

  it('injects a retry hook when recent errors are supplied', () => {
    const prompt = buildCoachSystemPrompt(
      {
        recentErrors: [
          { word: 'affect', skill: 'vocab', errorType: 'vocab', note: 'confused with effect' },
        ],
      },
      { surface: 'practice' },
    );
    expect(prompt).toContain('affect');
    expect(prompt).toMatch(/revisit|retry|come back|follow up/i);
  });
});

describe('parseCoachingActions', () => {
  it('extracts a root-level coaching_actions array', () => {
    const actions = parseCoachingActions({
      coaching_actions: [
        {
          type: 'ask_socratic_question',
          prompt: 'What clue in the sentence hints at past?',
          estimatedSeconds: 30,
        },
      ],
    });
    expect(actions).toHaveLength(1);
    expect(actions[0].type).toBe('ask_socratic_question');
  });

  it('extracts from an artifacts entry when present', () => {
    const actions = parseCoachingActions({
      artifacts: [
        {
          type: 'coaching_actions',
          payload: {
            actions: [
              {
                type: 'retry_with_hint',
                prompt: 'Try rewriting the clause using "had + past participle".',
                targetSkill: 'grammar',
                errorTypeIfRelevant: 'grammar',
              },
            ],
          },
        },
      ],
    });
    expect(actions).toHaveLength(1);
    expect(actions[0].type).toBe('retry_with_hint');
    expect(actions[0].targetSkill).toBe('grammar');
  });

  it('drops invalid action entries and enforces the enum', () => {
    const actions = parseCoachingActions({
      coaching_actions: [
        { type: 'not_a_real_action', prompt: 'x' },
        { type: 'micro_task' }, // missing prompt
        { type: 'micro_task', prompt: '   ' }, // empty prompt
        { type: 'schedule_review', prompt: 'Review "ephemeral" tomorrow', reviewAfterHours: 24 },
      ],
    });
    expect(actions).toHaveLength(1);
    expect(actions[0].type).toBe('schedule_review');
    expect(actions[0].reviewAfterHours).toBe(24);
  });

  it('clamps to max 6 actions', () => {
    const raw = {
      coaching_actions: Array.from({ length: 12 }, (_, i) => ({
        type: 'micro_task',
        prompt: `task ${i}`,
      })),
    };
    expect(parseCoachingActions(raw)).toHaveLength(6);
  });

  it('returns [] for malformed input', () => {
    expect(parseCoachingActions(undefined)).toEqual([]);
    expect(parseCoachingActions(null)).toEqual([]);
    expect(parseCoachingActions(42)).toEqual([]);
    expect(parseCoachingActions({ coaching_actions: 'not-an-array' })).toEqual([]);
  });
});

describe('toReviewQueueItems', () => {
  const now = new Date('2026-04-24T12:00:00.000Z');

  it('converts schedule_review actions into queue items', () => {
    const actions: CoachingAction[] = [
      {
        type: 'schedule_review',
        prompt: 'Revisit "ephemeral" in 24h',
        targetWord: 'ephemeral',
        targetSkill: 'vocab',
        reviewAfterHours: 24,
      },
    ];
    const items = toReviewQueueItems(actions, { now, userInputRef: 'msg-7' });
    expect(items).toHaveLength(1);
    expect(items[0].targetWord).toBe('ephemeral');
    expect(items[0].skill).toBe('vocab');
    expect(items[0].dueAt).toBe('2026-04-25T12:00:00.000Z');
    expect(items[0].userInputRef).toBe('msg-7');
  });

  it('defaults reviewAfterHours to 24 when omitted for schedule_review', () => {
    const items = toReviewQueueItems(
      [{ type: 'schedule_review', prompt: 'revisit this', targetSkill: 'grammar' }],
      { now },
    );
    expect(items[0].dueAt).toBe('2026-04-25T12:00:00.000Z');
  });

  it('skips actions that cannot be scheduled', () => {
    const items = toReviewQueueItems(
      [
        { type: 'celebrate_effort', prompt: 'Nice specific reasoning on tense cues' },
        { type: 'ask_socratic_question', prompt: 'What time marker would you use?' },
      ],
      { now },
    );
    expect(items).toEqual([]);
  });

  it('schedules retry_with_hint at a short interval when no hours provided', () => {
    const items = toReviewQueueItems(
      [
        {
          type: 'retry_with_hint',
          prompt: 'Rewrite using past perfect',
          targetSkill: 'grammar',
        },
      ],
      { now },
    );
    expect(items).toHaveLength(1);
    // Retry hint should surface within the session/day, not push out a day+
    expect(new Date(items[0].dueAt).getTime() - now.getTime()).toBeLessThanOrEqual(
      2 * 60 * 60 * 1000,
    );
    expect(items[0].skill).toBe('grammar');
  });

  it('generates stable ids derived from input', () => {
    const action: CoachingAction = {
      type: 'schedule_review',
      prompt: 'revisit this word',
      targetWord: 'ephemeral',
      targetSkill: 'vocab',
      reviewAfterHours: 24,
    };
    const a = toReviewQueueItems([action], { now, userInputRef: 'msg-1' });
    const b = toReviewQueueItems([action], { now, userInputRef: 'msg-1' });
    expect(a[0].id).toBe(b[0].id);
  });
});

describe('integration: policy + learner context + Socratic response', () => {
  it('produces a prompt that references the learner and commits to action output', () => {
    const learner: LearnerContext = normalizeLearningContext({
      level: 'B1',
      target: 'IELTS 7',
      weakTags: ['past-perfect'],
      dueCount: 18,
      learnerMode: 'steady',
      recentErrors: [
        { word: 'affect', skill: 'vocab', errorType: 'vocab' },
      ],
    });
    const prompt = buildCoachSystemPrompt(learner, { surface: 'today', mode: 'chat' });
    expect(prompt).toContain('B1');
    expect(prompt).toContain('IELTS 7');
    expect(prompt).toContain('past-perfect');
    expect(prompt).toContain('affect');
    expect(prompt).toContain('coaching_actions');
  });
});

describe('shared policy source sync', () => {
  // The file under src/ and the file under supabase/functions/_shared/ are
  // used by the client and the Deno Edge Function respectively. Both must
  // carry the same rules; if they drift, the AI coach will act differently
  // depending on who called it.
  const repoRoot = resolve(__dirname, '..', '..', '..');
  const CLIENT_PATH = 'src/features/coach/coachingPolicy.ts';
  const EDGE_PATH = 'supabase/functions/_shared/coaching-policy.ts';

  const loadBoth = () => ({
    client: readFileSync(resolve(repoRoot, CLIENT_PATH), 'utf8'),
    edge: readFileSync(resolve(repoRoot, EDGE_PATH), 'utf8'),
  });

  const findFirstDivergences = (a: string, b: string, max = 5): string[] => {
    const aLines = a.split('\n');
    const bLines = b.split('\n');
    const out: string[] = [];
    const limit = Math.max(aLines.length, bLines.length);
    for (let i = 0; i < limit && out.length < max; i += 1) {
      const left = aLines[i];
      const right = bLines[i];
      if (left !== right) {
        out.push(`L${i + 1}:\n  client: ${left ?? '<eof>'}\n  edge:   ${right ?? '<eof>'}`);
      }
    }
    return out;
  };

  it('keeps src/ and supabase/functions/_shared/ copies byte-identical', () => {
    const { client, edge } = loadBoth();
    if (client === edge) {
      expect(edge).toBe(client);
      return;
    }
    const diffs = findFirstDivergences(client, edge).join('\n---\n');
    throw new Error(
      `Coach policy drift detected.\n` +
        `  client: ${CLIENT_PATH}\n` +
        `  edge:   ${EDGE_PATH}\n` +
        `Both files must stay byte-identical (the policy module has no imports so it can compile in both Vite and Deno).\n` +
        `First divergent lines (max 5):\n${diffs}`,
    );
  });

  it('exports the same COACHING_POLICY_VERSION on both sides', () => {
    const { client, edge } = loadBoth();
    const versionRe = /COACHING_POLICY_VERSION\s*=\s*'([^']+)'/;
    const clientMatch = client.match(versionRe);
    const edgeMatch = edge.match(versionRe);
    expect(clientMatch?.[1], 'client must export COACHING_POLICY_VERSION as a string literal').toBeTruthy();
    expect(edgeMatch?.[1], 'edge must export COACHING_POLICY_VERSION as a string literal').toBeTruthy();
    expect(clientMatch?.[1]).toBe(edgeMatch?.[1]);
    // Sanity-check the runtime export matches the file literal so a future
    // refactor that swaps the constant for a function/derived value still
    // gets caught.
    expect(COACHING_POLICY_VERSION).toBe(clientMatch?.[1]);
  });

  it('declares the same CoachingActionType union in both copies', () => {
    const { client, edge } = loadBoth();
    const re = /export type CoachingActionType\s*=\s*([\s\S]*?);/;
    const clientUnion = client.match(re)?.[1]?.replace(/\s+/g, ' ').trim();
    const edgeUnion = edge.match(re)?.[1]?.replace(/\s+/g, ' ').trim();
    expect(clientUnion, 'client must declare CoachingActionType').toBeTruthy();
    expect(edgeUnion, 'edge must declare CoachingActionType').toBeTruthy();
    expect(edgeUnion).toBe(clientUnion);
  });

  it('declares the same CoachingErrorType union in both copies', () => {
    const { client, edge } = loadBoth();
    const re = /export type CoachingErrorType\s*=\s*([\s\S]*?);/;
    const clientUnion = client.match(re)?.[1]?.replace(/\s+/g, ' ').trim();
    const edgeUnion = edge.match(re)?.[1]?.replace(/\s+/g, ' ').trim();
    expect(edgeUnion).toBe(clientUnion);
  });
});
