# Malicious URL Detector v2

Malicious URL Detector v2 is a rebuilt malicious-link triage app on Next.js 16 App Router. It streams eight signals over NDJSON, supports batch scans, keeps local IndexedDB history, exports CSV/JSON, offers client-only share links, and hardens the app with proxy-based rate limiting plus production security headers.

## Features

- Streamed single-URL analysis with `scan_started`, `signal_result`, `scan_complete`, and `scan_error` NDJSON events.
- Batch analysis for up to 10 URLs with a concurrency cap of 3 and per-URL completion streaming.
- Eight normalized signals on every result: `virusTotal`, `mlEnsemble`, `googleSafeBrowsing`, `threatFeeds`, `ssl`, `whois`, `dns`, and `redirectChain`.
- Client-only history in IndexedDB with search, verdict filters, export, and re-scan support.
- Summary and Full Report modes, per-signal retry affordances, theme toggle, OG/robots/sitemap metadata routes, and shareable client-state links.
- Upstash-backed production rate limiting with a process-local fallback when Redis is not configured.

## Stack

- Next.js `16.1.6`
- React `19.2.0`
- TypeScript `5.9`
- Tailwind CSS `4`
- Vitest + MSW
- Playwright + axe-core
- Lighthouse CI

## Prerequisites

- Node.js `22.x`
- npm

Optional provider environment variables:

```env
VIRUSTOTAL_API_KEY=
GOOGLE_SAFE_BROWSING_API_KEY=
HUGGINGFACE_API_KEY=
URLHAUS_AUTH_KEY=
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
KV_REST_API_URL=
KV_REST_API_TOKEN=
OPENPHISH_FEED_URL=https://openphish.com/feed.txt
NEXT_PUBLIC_APP_URL=http://127.0.0.1:3000
```

The app still functions in a degraded mode without third-party keys; local enrichment signals continue to run and provider failures are surfaced explicitly instead of being mislabeled as malicious findings.
Rate limiting accepts either `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` or the Vercel KV aliases `KV_REST_API_URL` / `KV_REST_API_TOKEN`.
Threat-feed coverage uses the OpenPhish community TXT feed plus URLhaus. The OpenPhish integration is feed-backed and cached, not a paid database/API lookup.

## Development

Install dependencies:

```bash
npm install
```

Start the app:

```bash
npm run dev
```

For browser automation or local audits, the proven host-bound form is:

```bash
npm run dev -- --hostname 127.0.0.1 --port 3000
```

## Scripts

```bash
npm run lint
npm run format -- --check .
npm run typecheck
npm run test:unit -- --run
npm run test:integration -- --run
npm run test:e2e -- --grep @smoke
npm run build
npm audit
npm run lighthouse
```

## Architecture

- `app/api/analyze/route.ts`: single-scan NDJSON API.
- `app/api/analyze/batch/route.ts`: batch NDJSON API.
- `proxy.ts`: request gating and rate limiting for `/api/analyze`.
- `lib/server/`: orchestration, provider adapters, local signal collectors, cache, logging, rate limiting, and stream helpers.
- `components/scan/`: main analyzer UI, signal cards, history, and batch presentation.
- `hooks/`: NDJSON client readers and IndexedDB-backed history hooks.
- `tests/`: unit, integration, E2E smoke, accessibility, and keyboard checks.

## Verification Snapshot

The current rebuilt state has been verified locally with:

```bash
npm run lint
npm run format -- --check .
npm run typecheck
npm run test:unit -- --run
npm run test:integration -- --run
npm run test:e2e -- --grep @smoke
npm run build
npm audit
npm run lighthouse
```

Latest Lighthouse scores from `.lighthouseci/lhr-*.json`:

- Performance: `0.99`
- Accessibility: `1.00`
- Best Practices: `0.96`
- SEO: `1.00`

Deployment verification completed on Vercel:

- Preview: `https://malicious-url-detector-aibfl56qi-aman-thanvis-projects.vercel.app`
- Production: `https://malicious-url-detector-phi.vercel.app`
- Public production smoke: `POST /api/analyze` returned streamed NDJSON `200`
- Current live provider state: Google Safe Browsing succeeds, URLhaus succeeds with the documented `Auth-Key` header, and OpenPhish is sourced from the free community feed.
- Redirect tracing is resilient to invalid upstream certificate chains and no longer causes a false partial failure for `https://example.com/`.
- Full `npm audit` is clean after replacing the legacy Lighthouse CLI dependency chain with a script-backed `lighthouse` + `chrome-launcher` setup.

## Deployment

The app is configured for Vercel with:

- `npm install`
- `npm run build`
- `npm run dev`

Local production behavior has been verified with `npm run build` and `npm run start -- --hostname 127.0.0.1 --port 3000`, and the current build has also been deployed on Vercel preview and production. Preview requests are protection-gated in this project, so `vercel inspect` is the reliable readiness check when anonymous HTTP requests return `401`.
