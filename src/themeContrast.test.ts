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

const lightness = (tokens: Map<string, Hsl>, name: string) => token(tokens, name)[2];

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
      ['popover text on popover', 'popover-foreground', 'popover', 4.5],
      ['primary text on background', 'primary', 'background', 4.5],
      ['primary foreground on primary', 'primary-foreground', 'primary', 4.5],
      ['secondary foreground on secondary', 'secondary-foreground', 'secondary', 4.5],
      ['accent foreground on accent', 'accent-foreground', 'accent', 4.5],
      ['destructive foreground on destructive', 'destructive-foreground', 'destructive', 4.5],
      ['success foreground on success', 'success-foreground', 'success', 4.5],
      ['warning foreground on warning', 'warning-foreground', 'warning', 4.5],
      ['danger foreground on danger', 'danger-foreground', 'danger', 4.5],
      ['info foreground on info', 'info-foreground', 'info', 4.5],
      ['success text on paper', 'success', 'paper', 4.5],
      ['warning text on paper', 'warning', 'paper', 4.5],
      ['danger text on paper', 'danger', 'paper', 4.5],
      ['info text on paper', 'info', 'paper', 4.5],
      ['paper text on paper', 'foreground', 'paper', 4.5],
      ['muted text on paper', 'muted-foreground', 'paper', 4.5],
      ['sidebar text on sidebar', 'sidebar-foreground', 'sidebar-background', 4.5],
      ['sidebar active text on active', 'sidebar-accent-foreground', 'sidebar-accent', 4.5],
      ['input boundary on background', 'input', 'background', 3],
      ['paper line on paper', 'paper-line', 'paper', 3],
      ['strong border on background', 'border-strong', 'background', 3],
    ];

    for (const [label, foreground, background, minimum] of pairs) {
      const ratio = contrastRatio(token(tokens, foreground), token(tokens, background));
      expect(ratio, label).toBeGreaterThanOrEqual(minimum);
    }
  });

  it('keeps light surfaces paper-like instead of pure white', () => {
    const tokens = parseTokens(':root');
    const mainSurfaces = ['background', 'card', 'surface-raised', 'paper', 'popover'];

    for (const name of mainSurfaces) {
      expect(lightness(tokens, name), `--${name} should avoid bright white`).toBeLessThanOrEqual(94);
      expect(lightness(tokens, name), `--${name} should still read as a light surface`).toBeGreaterThanOrEqual(88);
    }
  });

  it('keeps dark surfaces charcoal instead of pure black', () => {
    const tokens = parseTokens('.dark');
    const mainSurfaces = ['background', 'card', 'surface-raised', 'paper', 'popover'];

    for (const name of mainSurfaces) {
      expect(lightness(tokens, name), `--${name} should avoid pure black`).toBeGreaterThanOrEqual(24);
      expect(lightness(tokens, name), `--${name} should stay in the dark range`).toBeLessThanOrEqual(34);
    }
  });
});
