/**
 * AI-powered content recommendation engine.
 * Computes personalized recommendations based on FSRS state, learning history,
 * weak topics, and user goals.
 */

export type RecommendationType = 'review' | 'new_words' | 'practice' | 'reading' | 'listening' | 'grammar' | 'writing' | 'pronunciation';

export interface Recommendation {
  id: string;
  type: RecommendationType;
  title: string;
  titleZh: string;
  reason: string;
  reasonZh: string;
  priority: number; // 0 = highest
  icon: string;
  action: string; // route path
  estimatedMinutes: number;
}

export interface RecommendationInput {
  dueWordCount: number;
  weakTopics: string[];
  strongTopics: string[];
  dailyGoal: number;
  wordsLearnedToday: number;
  streakDays: number;
  cefrLevel: string;
  recentPracticeTypes: RecommendationType[];
}

/**
 * Generate up to 3 personalized recommendations based on learning state.
 * Pure function — no side effects, runs in <1ms.
 */
export function generateRecommendations(input: RecommendationInput): Recommendation[] {
  const recs: Recommendation[] = [];
  let id = 0;

  // 1. Due reviews always come first
  if (input.dueWordCount > 0) {
    recs.push({
      id: `rec-${id++}`,
      type: 'review',
      title: `${input.dueWordCount} words due for review`,
      titleZh: `${input.dueWordCount} 个单词待复习`,
      reason: 'Reviewing now prevents forgetting and strengthens long-term memory.',
      reasonZh: '及时复习防止遗忘，巩固长期记忆。',
      priority: 0,
      icon: '🧠',
      action: '/dashboard/review',
      estimatedMinutes: Math.max(5, Math.round(input.dueWordCount * 0.5)),
    });
  }

  // 2. Learn new words if daily goal not met
  if (input.wordsLearnedToday < input.dailyGoal) {
    const remaining = input.dailyGoal - input.wordsLearnedToday;
    recs.push({
      id: `rec-${id++}`,
      type: 'new_words',
      title: `Learn ${remaining} more words today`,
      titleZh: `今天还需学习 ${remaining} 个新词`,
      reason: 'Stay on track with your daily learning goal.',
      reasonZh: '保持每日学习目标的进度。',
      priority: 1,
      icon: '📚',
      action: '/dashboard/today',
      estimatedMinutes: remaining * 2,
    });
  }

  // 3. Weak topic practice
  if (input.weakTopics.length > 0) {
    const topic = input.weakTopics[0];
    recs.push({
      id: `rec-${id++}`,
      type: 'practice',
      title: `Practice: ${topic}`,
      titleZh: `练习薄弱项: ${topic}`,
      reason: `Your ${topic} skills could use more practice based on recent performance.`,
      reasonZh: `根据近期表现，你的 ${topic} 技能需要更多练习。`,
      priority: 2,
      icon: '🎯',
      action: '/dashboard/practice',
      estimatedMinutes: 10,
    });
  }

  // 4. Skill variety — suggest a type not recently practiced
  const allTypes: RecommendationType[] = ['reading', 'listening', 'writing', 'pronunciation', 'grammar'];
  const recentSet = new Set(input.recentPracticeTypes);
  const missing = allTypes.filter((t) => !recentSet.has(t));
  if (missing.length > 0 && recs.length < 3) {
    const suggested = missing[0];
    const labels: Record<string, { title: string; titleZh: string; icon: string; action: string }> = {
      reading: { title: 'Try a reading exercise', titleZh: '尝试阅读练习', icon: '📖', action: '/dashboard/reading' },
      listening: { title: 'Practice listening skills', titleZh: '练习听力技能', icon: '🎧', action: '/dashboard/listening' },
      writing: { title: 'Write a short essay', titleZh: '写一篇短文', icon: '✍️', action: '/dashboard/writing' },
      pronunciation: { title: 'Practice pronunciation', titleZh: '练习发音', icon: '🗣️', action: '/dashboard/pronunciation' },
      grammar: { title: 'Review grammar points', titleZh: '复习语法要点', icon: '📝', action: '/dashboard/grammar' },
    };
    const info = labels[suggested];
    if (info) {
      recs.push({
        id: `rec-${id++}`,
        type: suggested,
        ...info,
        reason: 'Diversifying your practice improves overall language skills.',
        reasonZh: '多样化练习有助于全面提升语言能力。',
        priority: 3,
        estimatedMinutes: 10,
      });
    }
  }

  // 5. Streak maintenance
  if (input.streakDays > 0 && input.wordsLearnedToday === 0 && recs.length < 3) {
    recs.push({
      id: `rec-${id++}`,
      type: 'review',
      title: `Keep your ${input.streakDays}-day streak!`,
      titleZh: `保持 ${input.streakDays} 天连续学习！`,
      reason: 'Complete at least one activity today to maintain your streak.',
      reasonZh: '今天至少完成一个活动来保持连续学习。',
      priority: 4,
      icon: '🔥',
      action: '/dashboard/today',
      estimatedMinutes: 5,
    });
  }

  return recs.slice(0, 3).sort((a, b) => a.priority - b.priority);
}
