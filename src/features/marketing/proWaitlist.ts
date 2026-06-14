export const PRO_WAITLIST_STORAGE_KEY = 'vocabdaily_pro_waitlist_intents';

export type ProBillingCycle = 'monthly' | 'yearly';

export interface ProWaitlistIntent {
  id: string;
  planId: 'pro';
  billingCycle: ProBillingCycle;
  source: 'pricing';
  goal?: string;
  userId?: string;
  language?: string;
  createdAt: string;
}

export type ProWaitlistResult =
  | { status: 'created'; intent: ProWaitlistIntent; intents: ProWaitlistIntent[] }
  | { status: 'duplicate'; intent: ProWaitlistIntent; intents: ProWaitlistIntent[] }
  | { status: 'failed'; reason: 'storage_unavailable' | 'write_failed'; intents: ProWaitlistIntent[] };

interface SaveProWaitlistInput {
  billingCycle: ProBillingCycle;
  goal?: string;
  userId?: string;
  language?: string;
}

const MAX_LOCAL_INTENTS = 50;

const getStorage = (): Storage | null => {
  if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') {
    return null;
  }
  return window.localStorage;
};

const isProWaitlistIntent = (value: unknown): value is ProWaitlistIntent => {
  if (!value || typeof value !== 'object') return false;

  const candidate = value as Partial<ProWaitlistIntent>;
  return (
    typeof candidate.id === 'string' &&
    candidate.planId === 'pro' &&
    (candidate.billingCycle === 'monthly' || candidate.billingCycle === 'yearly') &&
    candidate.source === 'pricing' &&
    typeof candidate.createdAt === 'string'
  );
};

export function loadProWaitlistIntents(storage: Storage | null = getStorage()): ProWaitlistIntent[] {
  if (!storage) return [];

  try {
    const raw = storage.getItem(PRO_WAITLIST_STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter(isProWaitlistIntent);
  } catch {
    return [];
  }
}

export function hasProWaitlistIntent(
  billingCycle: ProBillingCycle,
  storage: Storage | null = getStorage(),
): boolean {
  return loadProWaitlistIntents(storage).some(
    (intent) => intent.planId === 'pro' && intent.billingCycle === billingCycle,
  );
}

export function saveProWaitlistIntent(
  input: SaveProWaitlistInput,
  storage: Storage | null = getStorage(),
): ProWaitlistResult {
  const existingIntents = loadProWaitlistIntents(storage);
  const duplicate = existingIntents.find(
    (intent) => intent.planId === 'pro' && intent.billingCycle === input.billingCycle,
  );

  if (duplicate) {
    return { status: 'duplicate', intent: duplicate, intents: existingIntents };
  }

  if (!storage) {
    return { status: 'failed', reason: 'storage_unavailable', intents: existingIntents };
  }

  const intent: ProWaitlistIntent = {
    id: `pro-${input.billingCycle}-${Date.now()}`,
    planId: 'pro',
    billingCycle: input.billingCycle,
    source: 'pricing',
    goal: input.goal,
    userId: input.userId,
    language: input.language,
    createdAt: new Date().toISOString(),
  };

  const intents = [intent, ...existingIntents].slice(0, MAX_LOCAL_INTENTS);

  try {
    storage.setItem(PRO_WAITLIST_STORAGE_KEY, JSON.stringify(intents));
    return { status: 'created', intent, intents };
  } catch {
    return { status: 'failed', reason: 'write_failed', intents: existingIntents };
  }
}
