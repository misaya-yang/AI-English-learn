import { describe, it, expect } from 'vitest';
import {
  readingArticles,
  getArticleById,
  getArticlesByLevel,
  getArticlesByCategory,
} from './readingContent';

describe('readingContent', () => {
  it('has at least 10 articles', () => {
    expect(readingArticles.length).toBeGreaterThanOrEqual(10);
  });

  it('all articles have exactly 5 comprehension questions', () => {
    for (const article of readingArticles) {
      expect(article.comprehensionQuestions.length).toBe(5);
    }
  });

  it('all comprehension questions have a valid correctIndex', () => {
    for (const article of readingArticles) {
      for (const q of article.comprehensionQuestions) {
        expect(q.correctIndex).toBeGreaterThanOrEqual(0);
        expect(q.correctIndex).toBeLessThan(q.options.length);
      }
    }
  });

  it('all articles have at least one key vocabulary item', () => {
    for (const article of readingArticles) {
      expect(article.keyVocabulary.length).toBeGreaterThan(0);
    }
  });

  it('articles span at least 4 CEFR levels', () => {
    const levels = new Set(readingArticles.map((a) => a.level));
    expect(levels.size).toBeGreaterThanOrEqual(4);
  });

  describe('getArticleById', () => {
    it('returns the correct article for a known id', () => {
      const article = getArticleById('ra-001');
      expect(article).toBeDefined();
      expect(article?.title).toBe('My Family');
    });

    it('returns undefined for an unknown id', () => {
      expect(getArticleById('ra-999')).toBeUndefined();
    });
  });

  describe('getArticlesByLevel', () => {
    it('returns only articles of the given CEFR level', () => {
      const b1Articles = getArticlesByLevel('B1');
      for (const a of b1Articles) {
        expect(a.level).toBe('B1');
      }
    });

    it('returns at least one article for A1', () => {
      expect(getArticlesByLevel('A1').length).toBeGreaterThan(0);
    });
  });

  describe('getArticlesByCategory', () => {
    it('returns only articles of the given category', () => {
      const dailyLife = getArticlesByCategory('Daily Life');
      for (const a of dailyLife) {
        expect(a.category).toBe('Daily Life');
      }
    });

    it('returns empty array for unknown category', () => {
      expect(getArticlesByCategory('Unknown Category')).toHaveLength(0);
    });
  });
});
