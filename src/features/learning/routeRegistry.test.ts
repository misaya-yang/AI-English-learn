import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

import {
  getAllDashboardRoutes,
  getDashboardRoute,
  getDashboardRouteByPath,
  getMobileNavRoutes,
  getRoutesByGroup,
  searchDashboardRoutes,
} from './routeRegistry';

const REPO_ROOT = resolve(__dirname, '..', '..', '..');

const APP_ROUTE_REGEX = /<Route path="([^"]+)"\s+element=\{withRouteFallback\(<\w+ \/>/g;

const extractDashboardSubpaths = (): string[] => {
  const source = readFileSync(resolve(REPO_ROOT, 'src/App.tsx'), 'utf8');
  const dashboardSection = source.split('<Route path="/dashboard"')[1] || '';
  const out: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = APP_ROUTE_REGEX.exec(dashboardSection)) !== null) {
    const sub = match[1];
    if (!sub || sub === '*' || sub === '/') continue;
    out.push(`/dashboard/${sub}`);
  }
  return out;
};

describe('routeRegistry', () => {
  it('exposes a non-empty list of routes', () => {
    expect(getAllDashboardRoutes().length).toBeGreaterThan(0);
  });

  it('every dashboard subroute in App.tsx has a registry entry', () => {
    const appRoutes = extractDashboardSubpaths();
    const registryPaths = new Set(getAllDashboardRoutes().map((route) => route.path));
    for (const path of appRoutes) {
      expect(registryPaths.has(path), `App route ${path} is missing from the registry`).toBe(true);
    }
    // Defensive: at least the canonical 4 are covered.
    expect(appRoutes).toContain('/dashboard/today');
    expect(appRoutes).toContain('/dashboard/review');
  });

  it('every registry entry has bilingual labels and a non-empty description', () => {
    for (const route of getAllDashboardRoutes()) {
      expect(route.label.en, `${route.id} label.en`).toBeTruthy();
      expect(route.label.zh, `${route.id} label.zh`).toBeTruthy();
      expect(route.description.en, `${route.id} description.en`).toBeTruthy();
      expect(route.description.zh, `${route.id} description.zh`).toBeTruthy();
      expect(route.pageTitle.en, `${route.id} pageTitle.en`).toBeTruthy();
      expect(route.pageTitle.zh, `${route.id} pageTitle.zh`).toBeTruthy();
    }
  });

  it('all paths are distinct', () => {
    const paths = getAllDashboardRoutes().map((route) => route.path);
    expect(new Set(paths).size).toBe(paths.length);
  });

  it('mobilePriority is unique across routes', () => {
    const priorities = getAllDashboardRoutes().map((route) => route.mobilePriority);
    expect(new Set(priorities).size).toBe(priorities.length);
  });

  it('mobile nav contract: top 4 priorities include today/review/practice/chat', () => {
    const ids = getMobileNavRoutes(4).map((route) => route.id);
    expect(ids).toContain('today');
    expect(ids).toContain('review');
    expect(ids).toContain('practice');
    expect(ids).toContain('chat');
  });

  it('getDashboardRouteByPath matches exact and nested paths', () => {
    expect(getDashboardRouteByPath('/dashboard/today')?.id).toBe('today');
    expect(getDashboardRouteByPath('/dashboard/today/anything-deeper')?.id).toBe('today');
    expect(getDashboardRouteByPath('/elsewhere')).toBeUndefined();
  });

  it('searchDashboardRoutes matches by label, path, and alias', () => {
    expect(searchDashboardRoutes('today').map((r) => r.id)).toContain('today');
    expect(searchDashboardRoutes('听力').map((r) => r.id)).toContain('listening');
    expect(searchDashboardRoutes('coach').map((r) => r.id)).toContain('chat');
    expect(searchDashboardRoutes('').length).toBe(0);
  });

  it('groups partition the registry without overlap', () => {
    const total = getAllDashboardRoutes().length;
    const learning = getRoutesByGroup('learning').length;
    const practice = getRoutesByGroup('practice').length;
    const tools = getRoutesByGroup('tools').length;
    const admin = getRoutesByGroup('admin').length;
    expect(learning + practice + tools + admin).toBe(total);
  });

  it('getDashboardRoute returns the registry entry by id', () => {
    expect(getDashboardRoute('today').path).toBe('/dashboard/today');
    expect(getDashboardRoute('chat').label.en).toBe('Coach');
  });
});
