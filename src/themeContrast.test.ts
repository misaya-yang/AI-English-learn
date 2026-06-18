import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

type Hsl = [number, number, number];

const css = readFileSync(join(process.cwd(), 'src/index.css'), 'utf8');

const parseBlock = (selector: ':root' | '.dark') => {
  const start = css.indexOf(`${selector} {`);
  if (start === -1) throw new Error(`Missing ${selector} token block`);

  let depth = 0;
  let end = start;
  for (; end < css.length; end += 1) {
    if (css[end] === '{') depth += 1;
    if (css[end] === '}') {
      depth -= 1;
      if (depth === 0) {
        end += 1;
        break;
      }
    }
  }

  return css.slice(start, end);
};

const parseTokens = (selector: ':root' | '.dark') => {
  const block = parseBlock(selector);
  const tokens = new Map<string, Hsl>();
  const tokenPattern = /--([a-z-]+):\s*([\d.]+)\s+([\d.]+)%\s+([\d.]+)%/g;

  for (const match of block.matchAll(tokenPattern)) {
    tokens.set(match[1], [Number(match[2]), Number(match[3]), Number(match[4])]);
  }

  return tokens;
};

const hslToRgb = ([h, s, l]: Hsl) => {
  const saturation = s / 100;
  const lightness = l / 100;
  const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
  const x = chroma * (1 - Math.abs((h / 60) % 2 - 1));
  const m = lightness - chroma / 2;
  let r = 0;
  let g = 0;
  let b = 0;

  if (h < 60) {
    r = chroma;
    g = x;
  } else if (h < 120) {
    r = x;
    g = chroma;
  } else if (h < 180) {
    g = chroma;
    b = x;
  } else if (h < 240) {
    g = x;
    b = chroma;
  } else if (h < 300) {
    r = x;
    b = chroma;
  } else {
    r = chroma;
    b = x;
  }

  return [r + m, g + m, b + m].map((channel) => Math.round(channel * 255));
};

const relativeLuminance = (rgb: number[]) =>
  rgb
    .map((channel) => {
      const value = channel / 255;
      return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
    })
    .reduce((sum, value, index) => sum + value * [0.2126, 0.7152, 0.0722][index], 0);

const contrastRatio = (foreground: Hsl, background: Hsl) => {
  const fg = relativeLuminance(hslToRgb(foreground));
  const bg = relativeLuminance(hslToRgb(background));
  return (Math.max(fg, bg) + 0.05) / (Math.min(fg, bg) + 0.05);
};

const token = (tokens: Map<string, Hsl>, name: string) => {
  const value = tokens.get(name);
  if (!value) throw new Error(`Missing token --${name}`);
  return value;
};

describe('theme contrast tokens', () => {
  it.each([
    ['light', parseTokens(':root')],
    ['dark', parseTokens('.dark')],
  ])('%s theme keeps text and controls readable', (_name, tokens) => {
    const pairs: Array<[string, string, string, number]> = [
      ['foreground on background', 'foreground', 'background', 4.5],
      ['foreground on card', 'foreground', 'card', 4.5],
      ['muted text on background', 'muted-foreground', 'background', 4.5],
      ['muted text on card', 'muted-foreground', 'card', 4.5],
      ['card text on card', 'card-foreground', 'card', 4.5],
      ['primary text on background', 'primary', 'background', 4.5],
      ['primary foreground on primary', 'primary-foreground', 'primary', 4.5],
      ['input boundary on background', 'input', 'background', 3],
    ];

    for (const [label, foreground, background, minimum] of pairs) {
      const ratio = contrastRatio(token(tokens, foreground), token(tokens, background));
      expect(ratio, label).toBeGreaterThanOrEqual(minimum);
    }
  });
});
