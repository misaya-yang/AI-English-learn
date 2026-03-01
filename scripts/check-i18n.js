import fs from 'node:fs';
import path from 'node:path';

const filePath = path.resolve(process.cwd(), 'src/i18n/index.ts');
const source = fs.readFileSync(filePath, 'utf8');

function extractObjectLiteral(text, marker) {
  const markerIndex = text.indexOf(marker);
  if (markerIndex < 0) {
    throw new Error(`Cannot find marker: ${marker}`);
  }

  const start = text.indexOf('{', markerIndex);
  if (start < 0) {
    throw new Error(`Cannot find object start for marker: ${marker}`);
  }

  let depth = 0;
  let end = -1;
  for (let i = start; i < text.length; i += 1) {
    const char = text[i];
    if (char === '{') depth += 1;
    if (char === '}') {
      depth -= 1;
      if (depth === 0) {
        end = i;
        break;
      }
    }
  }

  if (end < 0) {
    throw new Error(`Cannot find object end for marker: ${marker}`);
  }

  return text.slice(start, end + 1);
}

function parseObjectLiteral(literal, label) {
  try {
    return new Function(`return (${literal});`)();
  } catch (error) {
    throw new Error(`Failed to parse ${label}: ${error.message}`);
  }
}

function collectMissingKeys(base, target, prefix = '') {
  const missing = [];

  Object.keys(base).forEach((key) => {
    const nextPath = prefix ? `${prefix}.${key}` : key;

    if (!(key in target)) {
      missing.push(nextPath);
      return;
    }

    const baseValue = base[key];
    const targetValue = target[key];

    const bothObjects =
      baseValue &&
      targetValue &&
      typeof baseValue === 'object' &&
      typeof targetValue === 'object' &&
      !Array.isArray(baseValue) &&
      !Array.isArray(targetValue);

    if (bothObjects) {
      missing.push(...collectMissingKeys(baseValue, targetValue, nextPath));
    }
  });

  return missing;
}

const enLiteral = extractObjectLiteral(source, 'const en =');
const zhLiteral = extractObjectLiteral(source, 'const zh =');

const en = parseObjectLiteral(enLiteral, 'en');
const zh = parseObjectLiteral(zhLiteral, 'zh');

const zhMissing = collectMissingKeys(en, zh);
const enMissing = collectMissingKeys(zh, en);

if (zhMissing.length === 0 && enMissing.length === 0) {
  console.log('i18n key parity check passed.');
  process.exit(0);
}

if (zhMissing.length > 0) {
  console.error('\nMissing in zh:');
  zhMissing.forEach((key) => console.error(`- ${key}`));
}

if (enMissing.length > 0) {
  console.error('\nMissing in en:');
  enMissing.forEach((key) => console.error(`- ${key}`));
}

process.exit(1);
