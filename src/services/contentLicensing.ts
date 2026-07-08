import {
  getBuiltInWordBooks,
  type WordBook,
} from '@/data/wordBooks';

export type ContentLicenseId =
  | 'project_dataset'
  | 'mit'
  | 'original_content'
  | 'mixed_mit_original_project'
  | 'unknown';

export type ContentProvenance =
  | 'built_in'
  | 'user_import'
  | 'commercial_pack'
  | 'generated';

export interface ContentLicense {
  id: ContentLicenseId;
  name: string;
  commercialUseAllowed: boolean;
  redistributionAllowed: boolean;
  derivativeAllowed: boolean;
  requiresAttribution: boolean;
}

export interface ContentManifestEntry {
  contentId: string;
  contentType: 'word_book' | 'reading_passage' | 'listening_task' | 'grammar_lesson' | 'writing_prompt' | 'speaking_prompt' | 'exam_item';
  name: string;
  sourceName: string;
  sourceUrl?: string;
  licenseId: ContentLicenseId;
  licenseName: string;
  version: string;
  commercialUseAllowed: boolean;
  redistributionAllowed: boolean;
  derivativeAllowed: boolean;
  provenance: ContentProvenance;
  warnings: string[];
}

export interface ContentManifestValidationResult {
  valid: boolean;
  blockingIssues: string[];
  warnings: string[];
}

export const CONTENT_LICENSES: Record<ContentLicenseId, ContentLicense> = {
  project_dataset: {
    id: 'project_dataset',
    name: 'Project dataset in this repository',
    commercialUseAllowed: true,
    redistributionAllowed: true,
    derivativeAllowed: true,
    requiresAttribution: false,
  },
  mit: {
    id: 'mit',
    name: 'MIT',
    commercialUseAllowed: true,
    redistributionAllowed: true,
    derivativeAllowed: true,
    requiresAttribution: true,
  },
  original_content: {
    id: 'original_content',
    name: 'Original educational content in this repository',
    commercialUseAllowed: true,
    redistributionAllowed: true,
    derivativeAllowed: true,
    requiresAttribution: false,
  },
  mixed_mit_original_project: {
    id: 'mixed_mit_original_project',
    name: 'Mixed MIT, original educational content, and project dataset',
    commercialUseAllowed: true,
    redistributionAllowed: true,
    derivativeAllowed: true,
    requiresAttribution: true,
  },
  unknown: {
    id: 'unknown',
    name: 'Unknown',
    commercialUseAllowed: false,
    redistributionAllowed: false,
    derivativeAllowed: false,
    requiresAttribution: false,
  },
};

const normalize = (value: string): string => value.toLowerCase();

const licenseIdForBook = (book: WordBook): ContentLicenseId => {
  const text = normalize(`${book.source} ${book.license}`);

  if (text.includes('mit') && text.includes('original') && text.includes('project dataset')) {
    return 'mixed_mit_original_project';
  }
  if (text.includes('mit')) return 'mit';
  if (text.includes('original educational content')) return 'original_content';
  if (text.includes('project dataset') || text.includes('open-source repository')) return 'project_dataset';
  return 'unknown';
};

const sourceUrlForBook = (book: WordBook): string | undefined => {
  const text = normalize(book.source);
  if (text.includes('hefengxian/ielts-vocabulary')) {
    return 'https://github.com/hefengxian/ielts-vocabulary';
  }
  return undefined;
};

const warningsForBook = (book: WordBook, licenseId: ContentLicenseId): string[] => {
  const warnings: string[] = [];

  if (licenseId === 'unknown') {
    warnings.push('License is unknown; block commercial organization assignment.');
  }
  if (book.wordIds.length === 0) {
    warnings.push('Book has no word ids.');
  }

  return warnings;
};

export function getBuiltInWordBookContentManifest(
  books: WordBook[] = getBuiltInWordBooks(),
): ContentManifestEntry[] {
  return books.map((book) => {
    const licenseId = licenseIdForBook(book);
    const license = CONTENT_LICENSES[licenseId];

    return {
      contentId: book.id,
      contentType: 'word_book',
      name: book.name,
      sourceName: book.source,
      sourceUrl: sourceUrlForBook(book),
      licenseId,
      licenseName: license.name,
      version: book.version,
      commercialUseAllowed: license.commercialUseAllowed,
      redistributionAllowed: license.redistributionAllowed,
      derivativeAllowed: license.derivativeAllowed,
      provenance: 'built_in',
      warnings: warningsForBook(book, licenseId),
    };
  });
}

export function canUseContentCommercially(entry: ContentManifestEntry): boolean {
  if (entry.licenseId === 'unknown') return false;
  return entry.commercialUseAllowed && entry.redistributionAllowed;
}

export function validateContentManifest(
  entries: ContentManifestEntry[],
): ContentManifestValidationResult {
  const blockingIssues: string[] = [];
  const warnings: string[] = [];

  for (const entry of entries) {
    if (!entry.contentId.trim()) {
      blockingIssues.push('Content manifest entry is missing contentId.');
    }
    if (!entry.name.trim()) {
      blockingIssues.push(`${entry.contentId || 'unknown'} is missing name.`);
    }
    if (!CONTENT_LICENSES[entry.licenseId]) {
      blockingIssues.push(`${entry.contentId} has an unrecognized license id.`);
    }
    if (!canUseContentCommercially(entry)) {
      blockingIssues.push(`${entry.contentId} is not approved for commercial organization assignment.`);
    }
    warnings.push(...entry.warnings.map((warning) => `${entry.contentId}: ${warning}`));
  }

  return {
    valid: blockingIssues.length === 0,
    blockingIssues,
    warnings,
  };
}
