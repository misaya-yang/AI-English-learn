# VLE-06 Release Evidence Index

Date: 2026-06-16

## Release Result

- Vercel production deployment: `dpl_14ifbn7oSx6jG5zFE4rFrrWN3wDU`
- Production alias: `https://www.uuedu.online`
- Frontend status: deployed and public routes smoke-tested.
- Known blocker: Supabase project domain TLS connection closes from current network.

## Local Release Gates

- Lint: passed.
- i18n: passed.
- Build: passed.
- Full Vitest suite: 103 files, 810 tests passed.
- `git diff --check`: passed.
- UI regression: `release/ui-regression/summary.json`, 54 route checks and 10 scenarios passed.
- Learning-flow regression: `release/learning-flow/summary.json`, 114 checks passed.

## Production Smoke

- Pre-deploy smoke: `release/prod-smoke.txt`
- Post-deploy smoke: `release/prod-smoke-post-deploy.txt`
- Post-deploy browser public smoke: `release/e2e-prod-smoke-post-deploy.json`
- Bad-token smoke: `release/bad-token-smoke-post-deploy.json`

## Browser Artifacts

- UI regression desktop contact sheet: `release/ui-regression/contact-sheet-desktop.html`
- UI regression mobile contact sheet: `release/ui-regression/contact-sheet-mobile.html`
- UI regression screenshots: `release/ui-regression/screenshots/`
- Learning-flow screenshots: `release/learning-flow/screenshots/`

## Blocker Evidence

Supabase reachability checks failed at TLS connection setup:

```text
LibreSSL SSL_connect: SSL_ERROR_SYSCALL in connection to zjkbktdmwencnouwfrij.supabase.co:443
```

Production frontend routes continued to return 200, so this is classified as provider/network reachability rather than a frontend route failure.
