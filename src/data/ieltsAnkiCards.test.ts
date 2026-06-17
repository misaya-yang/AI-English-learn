import { describe, expect, it } from 'vitest';

import { getIeltsAnkiCardByWordId, getIeltsAnkiDeck, ieltsAnkiWordData } from './ieltsAnkiCards';
import { BUILT_IN_WORD_BOOK_IDS, getBuiltInWordBooks } from './wordBooks';
import { wordsDatabase } from './words';

describe('IELTS Anki card foundation', () => {
  it('ships an inspectable deck with useful card fields', () => {
    const deck = getIeltsAnkiDeck();

    expect(deck.id).toBe(BUILT_IN_WORD_BOOK_IDS.IELTS_ANKI_FOUNDATION);
    expect(deck.cards.length).toBeGreaterThanOrEqual(10);
    expect(deck.source).toMatch(/VocabDaily original/i);
    expect(deck.license).toMatch(/Original educational content/i);

    const ids = new Set<string>();
    for (const card of deck.cards) {
      expect(ids.has(card.id)).toBe(false);
      ids.add(card.id);
      expect(card.word.trim()).not.toBe('');
      expect(card.meaning.trim()).not.toBe('');
      expect(card.partOfSpeech.trim()).not.toBe('');
      expect(card.collocations.length).toBeGreaterThan(0);
      expect(card.phrasePatterns.length).toBeGreaterThan(0);
      expect(card.example).toContain(card.word);
      expect(card.chineseHint.trim()).not.toBe('');
      expect(card.ieltsTag.trim()).not.toBe('');
      expect(card.reviewTags.length).toBeGreaterThan(0);
      expect(card.skillFocus.length).toBeGreaterThan(0);
    }
  });

  it('maps every IELTS card into WordData and the built-in word book', () => {
    const deck = getIeltsAnkiDeck();
    const wordIds = new Set(ieltsAnkiWordData.map((word) => word.id));
    const builtInBook = getBuiltInWordBooks(wordsDatabase).find(
      (book) => book.id === BUILT_IN_WORD_BOOK_IDS.IELTS_ANKI_FOUNDATION,
    );

    expect(wordIds.size).toBe(deck.cards.length);
    expect(builtInBook).toBeDefined();
    expect(builtInBook?.wordIds).toEqual(deck.cards.map((card) => card.id));

    for (const card of deck.cards) {
      const word = ieltsAnkiWordData.find((item) => item.id === card.id);
      expect(word).toMatchObject({
        id: card.id,
        word: card.word,
        definition: card.meaning,
        definitionZh: card.meaningZh,
        memoryTip: card.chineseHint,
        topic: 'ielts',
      });
      expect(word?.collocations).toEqual(expect.arrayContaining(card.phrasePatterns));
      expect(getIeltsAnkiCardByWordId(card.id)?.word).toBe(card.word);
    }
  });
});
