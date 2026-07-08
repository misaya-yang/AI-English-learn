import { describe, expect, it } from 'vitest';

import { BUILT_IN_WORD_BOOK_IDS, getBuiltInWordBooks } from '@/data/wordBooks';
import {
  canUseContentCommercially,
  getBuiltInWordBookContentManifest,
  validateContentManifest,
} from './contentLicensing';

describe('content licensing manifest', () => {
  it('creates one manifest entry for each built-in word book', () => {
    const books = getBuiltInWordBooks();
    const manifest = getBuiltInWordBookContentManifest();

    expect(manifest.map((entry) => entry.contentId).sort()).toEqual(
      books.map((book) => book.id).sort(),
    );
  });

  it('marks built-in IELTS academic and Anki packs commercial-safe', () => {
    const manifest = getBuiltInWordBookContentManifest();
    const ielts = manifest.find((entry) => entry.contentId === BUILT_IN_WORD_BOOK_IDS.IELTS_ACADEMIC_CORE);
    const anki = manifest.find((entry) => entry.contentId === BUILT_IN_WORD_BOOK_IDS.IELTS_ANKI_FOUNDATION);

    expect(ielts).toBeDefined();
    expect(anki).toBeDefined();
    expect(ielts && canUseContentCommercially(ielts)).toBe(true);
    expect(anki && canUseContentCommercially(anki)).toBe(true);
  });

  it('fails closed for unknown licenses', () => {
    const validation = validateContentManifest([
      {
        contentId: 'custom-pack',
        contentType: 'word_book',
        name: 'Custom Pack',
        sourceName: 'Unknown upload',
        licenseId: 'unknown',
        licenseName: 'Unknown',
        version: '1.0.0',
        commercialUseAllowed: false,
        redistributionAllowed: false,
        derivativeAllowed: false,
        provenance: 'user_import',
        warnings: [],
      },
    ]);

    expect(validation.valid).toBe(false);
    expect(validation.blockingIssues[0]).toContain('custom-pack');
  });
});
