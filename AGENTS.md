# AGENTS.md

Project-local operating notes for agents working in this repository. Keep this file aligned with the live codebase and defer to the global `~/.codex/AGENTS.md` for broader working style and safety rules.

## Purpose

- Build and ship Malicious URL Detector v2, a web-first malicious URL analysis tool with streamed multi-signal results, batch analysis, local history, and portfolio-grade UX.
- Treat `SPEC.md` as the product and architecture source of truth.
- Treat `PLAN.md` as the execution source of truth. Update it whenever scope, order, or status changes.

## Current Architecture

- Framework: Next.js App Router on the Node.js runtime.
- UI: React client/server components with Tailwind CSS v4, selective shadcn/ui primitives, and `next-themes`.
- Request boundary: Next.js `proxy.ts` handles rate limiting for `/api/analyze` routes. Do not reintroduce deprecated `middleware.ts`.
- API surface:
  - `POST /api/analyze` streams NDJSON events for a single scan.
  - `POST /api/analyze/batch` streams NDJSON events for batch scans.
- Domain model:
  - Eight signals are always present in results: `virusTotal`, `mlEnsemble`, `googleSafeBrowsing`, `threatFeeds`, `ssl`, `whois`, `dns`, `redirectChain`.
  - History is client-side only and stored in IndexedDB.
  - Rate limiting is enforced in `proxy.ts` with Upstash when configured and a process-local in-memory fallback otherwise; accept either `UPSTASH_REDIS_REST_*` or Vercel KV `KV_REST_API_*` env names.
  - The hosted classifier uses the Hugging Face router endpoint with the default model `DunnBC22/codebert-base-Malicious_URLs`.
  - Threat feeds use URLhaus with the documented `Auth-Key` header plus cached OpenPhish community feed data; do not reintroduce the removed PhishTank adapter.
  - The branded UI lives under `components/scrutinix/*`; shared shadcn/ui primitives live under `components/ui/*`.
  - Production responses ship security headers from `next.config.ts`, including CSP and related browser hardening headers.

## Proven Commands

- Install deps: `npm install`
- Dev server: `npm run dev`
- Lint: `npm run lint`
- Format check: `npm run format -- --check .`
- Typecheck: `npm run typecheck`
- Unit tests: `npm run test:unit -- --run`
- Integration tests: `npm run test:integration -- --run`
- E2E smoke: `npm run test:e2e -- --grep @smoke`
- Build: `npm run build`
- Lighthouse: `npm run lighthouse`
- Security audit: `npm audit`

## Conventions

- Prefer small, reviewable diffs even during the rebuild. Replace subsystems cleanly rather than layering temporary compatibility code unless `PLAN.md` says otherwise.
- Keep server-side logic in reusable modules under `lib/` so route handlers stay thin and testable.
- Keep external provider adapters behind stable interfaces. No provider-specific response shapes should leak into UI components.
- Sanitize and normalize URLs once, centrally. Never duplicate validation logic in route handlers and UI.
- Never log raw URLs server-side. Log hashes, scan IDs, timings, and result classes only.
- Default to deterministic test fixtures and mocked provider responses. Do not depend on live third-party services in automated tests.

## Patterns To Follow

- Streaming responses use `application/x-ndjson` over `fetch`, not SSE.
- Route handlers should return structured non-stream errors for request validation and rate limiting, then stream scan events for accepted work.
- Keep cache and rate-limit policy explicit in code comments and docs when behavior changes.
- Use metadata routes or checked-in assets for favicon, OG image, robots, and sitemap. Do not reference missing files.
- Keep browser automation stable by binding local debug and audit servers to `127.0.0.1` when a tool depends on a fixed host.
- Vercel preview deployments are protected in this project; use `vercel inspect` for deploy verification when anonymous HTTP requests return `401`.
- Keep `app/globals.css` as the semantic theme-token source and `app/scrutinix.css` as the bespoke visual-effects layer; do not collapse them back together.

## Anti-Patterns To Avoid

- No new broad state-management layer unless a concrete need appears in `PLAN.md`.
- No silent fallback from provider outage to a malicious verdict.
- No stale documentation drift: if a command, env var, endpoint, or signal contract changes, update `PLAN.md`, `SPEC.md`, and user-facing docs in the same workstream.
- No `next lint`; use ESLint directly.
- No broad shadcnization of branded components; preserve Scrutinix-specific hero, signal, and motion components unless there is a concrete accessibility or maintainability reason to replace them.

## Coordination

- If you spawn subagents, point them to this file plus `PLAN.md` and `SPEC.md` first.
- Before marking work done, run the narrowest relevant verification step and update `PLAN.md` status.

## Self-Correction Log

- 2026-03-06: `vercel env add <name> preview` needs an explicit empty branch argument (`preview ''`) for non-interactive all-preview updates.
- 2026-03-06: Hugging Face retired `api-inference.huggingface.co`; use `router.huggingface.co/hf-inference/models/...` with a currently hosted model.
- 2026-03-06: Vercel KV exposes Upstash-compatible REST credentials as `KV_REST_API_URL` / `KV_REST_API_TOKEN`; the rate-limit config needs to honor those aliases.
- 2026-03-06: URLhaus rejects `AuthKey`; use the documented `Auth-Key` header.
- 2026-03-06: OpenPhish community feed is the supported free phishing-feed source here; the PhishTank path was removed after repeated Cloudflare challenge failures.
- 2026-03-06: Redirect tracing should use a header-only Node HTTP(S) request with relaxed certificate validation, because SSL trust errors belong to the SSL signal and not to `redirectChain`.
- 2026-03-06: `@lhci/cli` drags in vulnerable `lodash`/`tmp` transitive dependencies; use the direct `lighthouse` + `chrome-launcher` script path instead.
- 2026-03-09: The current UI is intentionally hybrid: branded `components/scrutinix/*` screens backed by selective shadcn/ui primitives, not a full rewrite onto generic shadcn layouts.
- 2026-03-09: Next.js App Router no longer accepts `themeColor` in `metadata`; move it to the `viewport` export to avoid build warnings.
