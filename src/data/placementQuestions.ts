/**
 * Extended placement test questions for smart onboarding.
 * Used by PlacementTest component to assess CEFR level.
 * 10 adaptive questions spanning A1–C2.
 */

export interface PlacementQuestion {
  id: number;
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  sentence: string;
  options: string[];
  correctIndex: number;
}

export const placementQuestions: PlacementQuestion[] = [
  { id: 1, level: 'A1', sentence: 'She ___ a teacher.', options: ['is', 'are', 'am', 'be'], correctIndex: 0 },
  { id: 2, level: 'A1', sentence: 'I ___ coffee every morning.', options: ['drinks', 'drink', 'drinking', 'drank'], correctIndex: 1 },
  { id: 3, level: 'A2', sentence: 'He has ___ to Paris twice.', options: ['go', 'went', 'been', 'going'], correctIndex: 2 },
  { id: 4, level: 'A2', sentence: 'If it rains, I ___ stay home.', options: ['will', 'would', 'am', 'do'], correctIndex: 0 },
  { id: 5, level: 'B1', sentence: 'By the time we arrived, they ___ already left.', options: ['have', 'had', 'has', 'having'], correctIndex: 1 },
  { id: 6, level: 'B1', sentence: 'She suggested ___ a different approach.', options: ['to take', 'taking', 'take', 'taken'], correctIndex: 1 },
  { id: 7, level: 'B2', sentence: 'Had I known about the delay, I ___ earlier.', options: ['would leave', 'will leave', 'would have left', 'had left'], correctIndex: 2 },
  { id: 8, level: 'B2', sentence: 'The project was completed ___ schedule.', options: ['ahead of', 'in front of', 'before to', 'prior at'], correctIndex: 0 },
  { id: 9, level: 'C1', sentence: 'Not until the evidence was presented ___ the jury reach a verdict.', options: ['did', 'had', 'was', 'would'], correctIndex: 0 },
  { id: 10, level: 'C2', sentence: 'The nuances of his argument ___ even the most seasoned critics.', options: ['eluded', 'alluded', 'deluded', 'precluded'], correctIndex: 0 },
];

/**
 * Compute CEFR level from placement test answers.
 * Returns the highest level where the user answered correctly.
 */
export function computeCefrFromAnswers(answers: Record<number, number>): 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' {
  const levelOrder: ('A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2')[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  let highestCorrectLevel: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' = 'A1';

  for (const q of placementQuestions) {
    const userAnswer = answers[q.id];
    if (userAnswer === q.correctIndex) {
      const qLevelIdx = levelOrder.indexOf(q.level);
      const currentIdx = levelOrder.indexOf(highestCorrectLevel);
      if (qLevelIdx > currentIdx) {
        highestCorrectLevel = q.level;
      }
    }
  }

  return highestCorrectLevel;
}
