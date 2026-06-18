import type { WordData } from '@/data/words';

export interface WordShareCardOptions {
  language: string;
  dateLabel: string;
  origin?: string;
}

const escapeXml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

export function buildWordShareText(word: WordData, options: WordShareCardOptions): string {
  const isZh = options.language.startsWith('zh');
  const definition = isZh ? word.definitionZh || word.definition : word.definition || word.definitionZh;
  const source = options.origin || 'VocabDaily';
  return `${isZh ? '每日单词' : 'Word of the Day'}: ${word.word}\n${definition}\n${source}`;
}

export function buildWordShareCardSvg(word: WordData, options: WordShareCardOptions): string {
  const isZh = options.language.startsWith('zh');
  const definition = isZh ? word.definitionZh || word.definition : word.definition || word.definitionZh;
  const example = word.examples[0];
  const exampleText = example ? (isZh ? example.zh || example.en : example.en || example.zh) : definition;
  const collocation = word.collocations[0] || word.topic || 'daily English';
  const subtitle = isZh ? '今天值得带走的一个词' : 'One word worth keeping today';

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630" role="img" aria-label="${escapeXml(word.word)} share card">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#10201b"/>
      <stop offset="52%" stop-color="#183d34"/>
      <stop offset="100%" stop-color="#f4f0e6"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect x="60" y="54" width="1080" height="522" rx="28" fill="#fffaf0" opacity="0.94"/>
  <text x="96" y="112" fill="#136f63" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Arial, sans-serif" font-size="28" font-weight="700">VocabDaily</text>
  <text x="96" y="154" fill="#5f6f69" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Arial, sans-serif" font-size="24">${escapeXml(subtitle)} / ${escapeXml(options.dateLabel)}</text>
  <text x="96" y="284" fill="#10201b" font-family="Georgia, serif" font-size="96" font-weight="700">${escapeXml(word.word)}</text>
  <text x="100" y="330" fill="#55716a" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Arial, sans-serif" font-size="28">${escapeXml(word.partOfSpeech)} / ${escapeXml(word.phonetic)} / ${escapeXml(word.level)}</text>
  <foreignObject x="96" y="360" width="780" height="96">
    <div xmlns="http://www.w3.org/1999/xhtml" style="font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Arial, sans-serif; font-size: 30px; line-height: 1.35; color: #26332f;">${escapeXml(definition)}</div>
  </foreignObject>
  <foreignObject x="96" y="466" width="820" height="62">
    <div xmlns="http://www.w3.org/1999/xhtml" style="font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Arial, sans-serif; font-size: 22px; line-height: 1.35; color: #53615d;">${escapeXml(exampleText)}</div>
  </foreignObject>
  <rect x="930" y="350" width="150" height="42" rx="10" fill="#136f63" opacity="0.12"/>
  <text x="954" y="378" fill="#136f63" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Arial, sans-serif" font-size="20" font-weight="700">${escapeXml(word.topic || 'general')}</text>
  <rect x="930" y="414" width="190" height="42" rx="10" fill="#d48b25" opacity="0.14"/>
  <text x="954" y="442" fill="#8b5a13" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Arial, sans-serif" font-size="20" font-weight="700">${escapeXml(collocation)}</text>
  <text x="96" y="548" fill="#136f63" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Arial, sans-serif" font-size="22">${isZh ? '公开分享卡，不包含个人学习历史' : 'Public share card. No private study history included.'}</text>
</svg>`;
}

export function buildWordShareFileName(word: WordData): string {
  const safe = word.word.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'word';
  return `vocabdaily-${safe}.svg`;
}
