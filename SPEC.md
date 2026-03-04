# SPEC.md — Malicious URL Detector v2

## 0) Metadata
- **Title:** Malicious URL Detector v2
- **Owner (DRI):** Aman Thanvi (@amanthanvi)
- **Stakeholders:** Aman Thanvi
- **Status:** Draft
- **Last updated:** 2026-03-04
- **Target ship date:** TBD (big bang — ship when complete)
- **Links:** [GitHub](https://github.com/amanthanvi/malicious-url-detector)

## 1) Executive Summary

### 1.1 What we're building
A modern web-based URL threat analyzer that evaluates URLs against multiple security signals — VirusTotal engines, ML model ensemble, threat intelligence feeds, SSL/WHOIS/DNS enrichment, redirect chain analysis, and Google Safe Browsing — and presents results in a polished, progressive-detail interface.

### 1.2 Problem statement / why now
The original project was built with older LLMs and libraries, has unused dependencies, SSR bugs, sequential batch processing, no rate limiting, and a dated UI. It needs a complete rebuild to serve as a credible portfolio piece and useful open-source tool.

### 1.3 Success metrics (measurable)
- **Primary KPIs:**
  - Portfolio impact: project appears polished enough to demonstrate in interviews/portfolio
  - GitHub stars > 50 within 6 months of launch
  - Clean Lighthouse score (Performance > 90, Accessibility > 95)
- **Guardrails:**
  - API quota usage stays within free-tier limits under normal usage
  - Zero known security vulnerabilities in dependencies at ship time
  - Full test pyramid passing in CI
- **"Done means":**
  - A user can paste any URL, see a streaming multi-signal threat report within 10 seconds (first data), toggle between summary and full report views, run batch scans concurrently, and export history — all with a distinctive, modern UI

### 1.4 Non-goals / out of scope
- **No accounts/auth** — anonymous, stateless on the server
- **No real-time monitoring** — point-in-time analysis only, no alerting or continuous scanning
- **No browser extension** — web app only
- **No CLI tool** — no standalone CLI or third-party API access
- **No mobile app** — responsive web, not native
- **No paid tiers** — fully free, open-source

## 2) Users & UX

### 2.1 Personas / segments
| Persona | Description | Needs |
|---------|-------------|-------|
| **Casual user** | Non-technical person who received a suspicious link via email/text | Quick, clear verdict: "Is this safe?" with plain-language explanation |
| **Power user** | Developer, security enthusiast, or IT professional | Full signal breakdown, raw engine results, batch scanning, exportable data |

Both personas use the same tool. A **view mode toggle** (Summary / Full Report) adapts information density without requiring separate interfaces or authentication.

### 2.2 Primary flows

**Flow 1: Single URL Scan**
1. User lands on home page with prominent URL input field
2. Pastes URL, client-side validation, submits
3. Streaming results appear: verdict first, then enrichment signals populate as they resolve
4. Default: Summary view (verdict + top 3 signals). Toggle to Full Report for all data
5. Option to share result or scan another URL

**Flow 2: Batch Scan**
1. User switches to Batch tab with textarea for multiple URLs (newline-separated, max 10)
2. Submits: all URLs process concurrently (with concurrency limit)
3. Results stream in as each URL completes with summary grid showing status per URL
4. Click any URL to expand its full result
5. Export all results as CSV

**Flow 3: History & Export**
1. Previous scans stored in IndexedDB (client-side)
2. History panel shows recent scans with status badges
3. Click to view cached result, re-scan button for fresh analysis
4. Export history as CSV or JSON

### 2.3 UX states checklist
- **Loading/streaming:** Skeleton cards per enrichment source. Each card populates independently as its API resolves. Progress indicator shows which sources are still pending
- **Empty:** Clean landing state with URL input, brief description of what the tool does, example URLs to try
- **Error (partial):** Failed sources show "unavailable" state with reason + per-source retry button. Verdict computed from available data. Clear indication of which signals are missing
- **Error (total):** All sources failed — show error message with "Retry All" button and suggestion to check network
- **Offline/degraded:** N/A (server-side tool, requires network). Client-side history remains accessible offline via IndexedDB
- **Accessibility:** WCAG 2.1 AA compliance. Semantic HTML, ARIA labels on interactive elements, keyboard navigable, sufficient color contrast, screen reader friendly status announcements

### 2.4 View modes
| Mode | Content | Target |
|------|---------|--------|
| **Summary** | Overall verdict (Safe/Suspicious/Malicious/Critical) with confidence indicator, top 3 most relevant signals as compact cards, one-line recommendation | Casual users, quick checks |
| **Full Report** | All enrichment signals in structured sections, raw engine results, confidence breakdowns per model, WHOIS/SSL/DNS details, redirect chain visualization, threat feed matches | Power users, investigation |

## 3) Functional Requirements

### Core Analysis
- **FR-1** MUST accept a single URL input, validate it, and return a multi-signal threat analysis
- **FR-2** MUST query VirusTotal API and return engine-level detection results
- **FR-3** MUST run URL through multiple ML classification models and aggregate predictions
- **FR-4** MUST check URL against threat intelligence feeds (URLhaus, PhishTank, OpenPhish)
- **FR-5** MUST check URL against Google Safe Browsing API
- **FR-6** MUST perform SSL certificate analysis (issuer, validity, expiry, chain trust)
- **FR-7** MUST perform WHOIS lookup (domain age, registrar, registration date)
- **FR-8** MUST perform DNS analysis (record types, anomalies, MX/A/CNAME)
- **FR-9** MUST trace HTTP redirect chain (hops, final destination, status codes)
- **FR-10** MUST compute an overall threat verdict from all available signals

### UX & Presentation
- **FR-11** MUST display results in a streaming fashion — each signal populates as it resolves
- **FR-12** MUST provide Summary / Full Report view toggle
- **FR-13** MUST show partial results when some sources fail, with per-source retry
- **FR-14** MUST support batch URL analysis (up to 10 URLs, concurrent processing)
- **FR-15** MUST show batch results as a grid with per-URL drill-down

### History & Export
- **FR-16** SHOULD persist scan history in IndexedDB with search/filter
- **FR-17** SHOULD support CSV/JSON export for individual and batch results
- **FR-18** SHOULD support history export

### Polish
- **FR-19** MUST support dark and light themes
- **FR-20** MUST be responsive (mobile-friendly)
- **FR-21** SHOULD include educational content about URL threats
- **FR-22** MAY include shareable result links (URL-encoded state, no server persistence)

## 4) System Design

### 4.1 Architecture (components + boundaries)

```
┌─────────────────────────────────────────────────┐
│                  Vercel Edge                     │
│  ┌──────────────────────────────────────────┐    │
│  │     Rate Limit Middleware (IP-based)     │    │
│  └──────────────────────────────────────────┘    │
│                      │                           │
│  ┌──────────────────────────────────────────┐    │
│  │         Next.js App Router               │    │
│  │  ┌────────┐  ┌─────────┐  ┌──────────┐  │    │
│  │  │ Pages  │  │  API    │  │  Server  │  │    │
│  │  │ (RSC)  │  │ Routes  │  │ Actions  │  │    │
│  │  └────────┘  └─────────┘  └──────────┘  │    │
│  └──────────────────────────────────────────┘    │
│                      │                           │
│  ┌──────────────────────────────────────────┐    │
│  │        Enrichment Pipeline               │    │
│  │  ┌────┐ ┌──┐ ┌───┐ ┌─────┐ ┌───┐ ┌───┐ │    │
│  │  │ VT │ │ML│ │SSL│ │WHOIS│ │DNS│ │GSB│ │    │
│  │  └────┘ └──┘ └───┘ └─────┘ └───┘ └───┘ │    │
│  │  ┌────────┐ ┌──────────┐ ┌───────────┐  │    │
│  │  │Redirect│ │URLhaus/  │ │  Threat   │  │    │
│  │  │ Chain  │ │PhishTank │ │ Verdict   │  │    │
│  │  └────────┘ └──────────┘ └───────────┘  │    │
│  └──────────────────────────────────────────┘    │
│                      │                           │
│  ┌──────────────────────────────────────────┐    │
│  │         Server-Side Cache (LRU)          │    │
│  └──────────────────────────────────────────┘    │
└─────────────────────────────────────────────────┘

Client Side:
┌──────────────────────────────────────────────┐
│  React Client Components                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────────┐ │
│  │URL Input │ │Results   │ │ Batch Panel  │ │
│  │+ Validate│ │+ Toggle  │ │ + Progress   │ │
│  └──────────┘ └──────────┘ └──────────────┘ │
│  ┌──────────┐ ┌──────────┐ ┌──────────────┐ │
│  │ History  │ │ Theme    │ │ Educational  │ │
│  │(IndexedDB)│ │ Toggle   │ │ Content     │ │
│  └──────────┘ └──────────┘ └──────────────┘ │
└──────────────────────────────────────────────┘
```

### 4.2 Data model (schemas + invariants)

**AnalysisResult** (core response object):
```typescript
interface AnalysisResult {
  id: string                    // unique scan ID (nanoid)
  url: string                   // normalized input URL
  timestamp: string             // ISO 8601
  verdict: Verdict              // computed overall verdict
  signals: SignalResults        // per-source results
  threatInfo: ThreatInfo | null // only populated when verdict != 'safe'
  metadata: ScanMetadata        // timing, cache hit, etc.
}

type Verdict = 'safe' | 'suspicious' | 'malicious' | 'critical' | 'error'

interface SignalResults {
  virusTotal: SignalResult<VirusTotalData>
  mlEnsemble: SignalResult<MLEnsembleData>
  googleSafeBrowsing: SignalResult<GSBData>
  threatFeeds: SignalResult<ThreatFeedData>
  ssl: SignalResult<SSLData>
  whois: SignalResult<WHOISData>
  dns: SignalResult<DNSData>
  redirectChain: SignalResult<RedirectData>
}

type SignalStatus = 'pending' | 'success' | 'error' | 'skipped'

interface SignalResult<T> {
  status: SignalStatus
  data: T | null
  error: string | null
  durationMs: number
}
```

**Invariants:**
- `id` is unique per scan (not per URL — rescanning generates new ID)
- `verdict` is always computed from available signals, never null
- `signals` always contains all 8 keys, even if `status: 'error'`
- `timestamp` is server-generated, never client-provided

### 4.3 Interfaces / API contracts

**POST /api/analyze**
```
Request:  { url: string }
Response: ReadableStream<SignalUpdate | FinalResult>

SignalUpdate: { type: 'signal', name: string, result: SignalResult<T> }
FinalResult: { type: 'complete', result: AnalysisResult }
```

**POST /api/analyze/batch**
```
Request:  { urls: string[] }  // max 10
Response: ReadableStream<BatchUpdate>

BatchUpdate: { type: 'url_complete', url: string, result: AnalysisResult }
           | { type: 'batch_complete', results: AnalysisResult[] }
```

- **Error model:** `{ error: { code: string, message: string, retryable: boolean } }`
- **Idempotency:** Cache-keyed by normalized URL. Same URL within TTL returns cached result (but new scan ID)
- **Rate limits:** 10 req/min per IP, 50 req/day per IP (enforced at Edge middleware)

### 4.4 State, caching, concurrency

- **Source of truth:** Each scan is ephemeral server-side (computed, cached briefly, not persisted). Client-side IndexedDB is the only persistence layer
- **Server cache:** LRU cache (200 items, 15-min TTL) keyed by normalized URL. Cache hit returns immediately, cache miss triggers full pipeline
- **Concurrency:** Enrichment pipeline runs all 8 sources via `Promise.allSettled()`. Batch mode uses a concurrency limiter (max 3 URLs in-flight simultaneously to stay within API quotas)
- **Hazards:** VT rate limit (4 req/min on free tier) — queue VT calls with backoff. HuggingFace inference can be slow on cold start — set 30s timeout

### 4.5 Performance targets
- **First signal:** < 3 seconds (SSL, DNS, redirect chain are fast self-computed signals)
- **Full result:** < 30 seconds (VT polling is the bottleneck; other signals stream in earlier)
- **Cached result:** < 500ms
- **Batch (10 URLs):** < 2 minutes total (concurrent with rate limit awareness)
- **Payload limits:** Max URL length 2048 chars. Max batch size 10 URLs. Response streamed, no payload size concern

### 4.6 Dependencies / integrations

| Dependency | Type | Free Tier | Failure Behavior |
|-----------|------|-----------|-----------------|
| VirusTotal API v3 | External | 4 req/min, 500 req/day | Signal marked error, verdict computed without it |
| HuggingFace Inference API | External | Rate limited, cold starts | Signal marked error, retry once |
| Google Safe Browsing API v4 | External | 10k req/day | Signal marked error, non-critical |
| URLhaus API | External | Unlimited | Signal marked error, non-critical |
| PhishTank API | External | Varies | Signal marked error, non-critical |
| OpenPhish feed | External | Public feed | Signal marked error, non-critical |
| DNS resolution | Self-computed | N/A | Signal marked error |
| SSL cert inspection | Self-computed | N/A | Signal marked error (may fail for non-HTTPS) |
| WHOIS lookup | Self-computed/API | Varies | Signal marked error |
| Redirect chain | Self-computed | N/A | Signal marked error |

## 5) Security, Privacy, Compliance

- **Authn/authz:** None. Anonymous usage. No user accounts
- **PII:** No PII collected or stored server-side. URLs submitted are cached temporarily (15 min) then discarded. Client-side history is user-controlled
- **Abuse cases + mitigations:**

| Abuse case | Mitigation |
|-----------|------------|
| API quota exhaustion via flood | IP-based rate limiting (10/min, 50/day) |
| Scanning internal/private URLs | URL validation rejects private IP ranges (10.x, 192.168.x, localhost) |
| Using tool to enumerate which URLs are malicious | Rate limiting + no bulk API access |
| XSS via crafted URL display | Sanitize all URL rendering, never inject raw HTML |

- **Audit/logging policy:** Log scan requests (URL hash only, not full URL) + response status + timing. Never log full URLs server-side (could contain PII in query params)

## 6) Reliability & Failure Modes

### 6.1 Failure modes table

| Failure | Detection | User Impact | System Behavior | Recovery | Blast Radius |
|---------|-----------|-------------|-----------------|----------|--------------|
| VT API down/timeout | HTTP error / 30s timeout | Missing VT signal | Signal card shows "unavailable" + retry button | Retry once auto, then manual | Single signal |
| VT rate limit exceeded | 429 response | Delayed/missing VT signal | Queue with exponential backoff | Auto-retry after cooldown | VT signal only |
| HF model cold start | > 30s response | Delayed ML signal | 30s timeout, retry once | Auto-retry | ML signal only |
| HF model unavailable | HTTP error | Missing ML signal | Fallback to threat feeds for classification | Manual retry | ML signal |
| Google Safe Browsing down | HTTP error | Missing GSB signal | Signal card shows "unavailable" | Manual retry | Single signal |
| DNS resolution failure | Lookup error | Missing DNS signal | Show error, may indicate suspicious domain | None needed | DNS signal |
| SSL handshake failure | Connection error | Missing SSL signal | Could indicate self-signed cert (useful signal!) | Report as finding | SSL signal |
| WHOIS lookup failure | API error / timeout | Missing WHOIS signal | Signal shows "unavailable" | Manual retry | WHOIS signal |
| All sources fail | All signals error | No useful analysis | Show error state with "Retry All" button | Full retry | Complete |
| Vercel function timeout | 10s edge / 60s serverless | Partial results | Stream whatever completed before timeout | Retry | Depends on timing |

### 6.2 Retries/timeouts/circuit breakers
- **Per-source timeout:** 30s for external APIs, 10s for self-computed signals
- **Auto-retry:** One automatic retry with 2s backoff for external API failures
- **Manual retry:** Per-source retry button in UI for any failed signal
- **No circuit breaker needed** — external APIs are independent, no cascading failure risk

### 6.3 Data integrity + rollback
- No persistent server data — nothing to corrupt or roll back
- Client-side IndexedDB: if corrupt, clear and rebuild (history is not critical data)

## 7) Observability & Ops

- **Logging:** Vercel function logs. Log: scan request count, per-source latency, error rates, rate limit hits. Do NOT log: full URLs, IP addresses, user agents
- **Metrics:** Vercel Analytics for web vitals + page views. Custom: scans/day, cache hit rate, per-source success rate, average scan latency
- **Alerts:** Vercel deployment notifications. Monitor VT quota usage via API dashboard
- **Debugging:** Structured JSON logs with scan ID for request tracing. Each signal includes `durationMs` for latency debugging

## 8) Rollout, Migration, Compatibility

- **Strategy:** Big bang. Build complete v2, deploy when ready. Old site is already defunct
- **Feature flags:** None needed (single deploy, no gradual rollout)
- **Rollback plan:** Git revert + Vercel instant rollback to previous deployment
- **Migration:** No data migration needed (server is stateless, client IndexedDB starts fresh). Old localStorage history will be lost (acceptable — old data format is incompatible)
- **Backwards compatibility:** N/A (complete rewrite, no API consumers)
- **Domain/DNS:** Same Vercel project, same domain. Zero-downtime deploy via Vercel

## 9) Testing & Acceptance Criteria

### 9.1 Acceptance criteria (Given/When/Then)

**AC-1: Single URL scan**
Given a user on the home page
When they paste a valid URL and submit
Then they see streaming results with each signal populating independently, and a final verdict within 30 seconds

**AC-2: View mode toggle**
Given a completed scan result
When the user toggles between Summary and Full Report
Then Summary shows verdict + top 3 signals, Full Report shows all 8 signal sections with detailed data

**AC-3: Partial failure handling**
Given a scan where VirusTotal times out but other sources succeed
When results are displayed
Then VT card shows "unavailable" with retry button, and verdict is computed from remaining signals

**AC-4: Batch scan**
Given the user switches to Batch tab and enters 5 URLs
When they submit
Then all 5 process concurrently, results stream in as each completes, and a summary grid shows final statuses

**AC-5: Rate limiting**
Given a client makes 11 requests within 1 minute
When the 11th request arrives
Then it receives a 429 response with retry-after header

**AC-6: History persistence**
Given a user has completed 3 scans
When they refresh the page
Then all 3 scans appear in the history panel (sourced from IndexedDB)

**AC-7: Export**
Given completed batch results
When the user clicks Export CSV
Then a CSV file downloads with URL, verdict, timestamp, and signal summary for each URL

**AC-8: Theme support**
Given the app is loaded
When the user toggles dark/light mode
Then the entire UI switches themes with persisted preference

**AC-9: Responsive design**
Given the app is accessed on a 375px-wide viewport
When viewing scan results
Then all content is readable and interactive without horizontal scrolling

### 9.2 Test plan

- **Unit tests** (Vitest):
  - URL validation + normalization
  - Threat verdict computation logic (given signal inputs, expected verdict)
  - Each enrichment signal parser (given raw API response, expected structured data)
  - Rate limit logic
  - Cache behavior (hit/miss/expiry)

- **Integration tests** (Vitest + MSW for API mocking):
  - Full analyze endpoint with mocked external APIs
  - Streaming response parsing
  - Partial failure scenarios (1-N sources fail)
  - Batch endpoint with concurrent URL processing
  - Rate limit middleware enforcement

- **E2E tests** (Playwright):
  - Single URL scan happy path
  - Batch scan with multiple URLs
  - View mode toggle
  - History persistence across page reload
  - CSV export
  - Dark/light theme toggle
  - Mobile viewport responsiveness
  - Error states (all sources mocked to fail)

- **Performance:**
  - Lighthouse CI (Performance > 90, Accessibility > 95)
  - Bundle size monitoring (< 200kb JS initial load)

- **Security:**
  - No XSS via URL display (test with crafted URLs containing script tags)
  - Private IP rejection (10.x, 192.168.x, 127.x, ::1)
  - Rate limit bypass attempts
  - Dependency audit (npm audit)

- **Accessibility:**
  - axe-core automated checks in E2E tests
  - Keyboard navigation for all interactive elements
  - Screen reader announcements for scan status changes

## 10) Decision Log

| Date | Decision | Alternatives | Rationale | Consequences |
|------|----------|-------------|-----------|--------------|
| 2026-03-04 | Complete greenfield rebuild | Incremental upgrade | Old codebase has too many issues — cheaper to restart | Lose git history of old code |
| 2026-03-04 | Next.js + Vercel (web-first) | SPA + separate API; Astro; Remix | Web-first product, Vercel free tier fits budget, familiar ecosystem | API not independently consumable |
| 2026-03-04 | Multi-model ML ensemble + threat feeds | Single model; drop ML; train own | Multiple signals = higher confidence. Feeds catch known-bad URLs | Higher aggregation complexity |
| 2026-03-04 | Free APIs + self-computed enrichment | Premium threat intel APIs | Budget constraint, portfolio project | Less reliable data sources |
| 2026-03-04 | IP-based rate limiting | Token bucket + fingerprint; auth-based | Simple, effective, no auth needed | Shared IP could hit limits unfairly |
| 2026-03-04 | IndexedDB for history | localStorage; server-side DB | Richer than localStorage, no server cost, privacy-friendly | More complex, but idb library helps |
| 2026-03-04 | Streaming results | Wait for all; polling | Best UX — data within seconds vs 30s+ wait | More complex client/server impl |
| 2026-03-04 | Big bang deploy | Phased; MVP + fast follow | Portfolio — first impression matters | Longer time to first deploy |
| 2026-03-04 | Modern bold aesthetic | Dark hacker; clinical; brutalist | Stands out, avoids AI-slop, signals quality | Need custom design investment |
| 2026-03-04 | Full test pyramid | E2E only; unit + integration; minimal | Security tool demands confidence | More upfront test writing |

## 11) Assumptions, Open Questions, Risks

### Assumptions
- VirusTotal free tier (4 req/min, 500 req/day) is sufficient for portfolio-level traffic
- HuggingFace Inference API will remain free for the models we select
- Google Safe Browsing API free tier (10k req/day) is more than adequate
- URLhaus/PhishTank/OpenPhish public feeds remain accessible
- Vercel Hobby plan ($0) or Pro plan ($20/mo) covers compute needs
- Self-computed signals (DNS, SSL, redirect) can execute within Vercel serverless function limits (60s timeout)

### Open Questions
- **OQ-1:** Which specific HuggingFace models should compose the ML ensemble? Need to research current SOTA URL classification models
- **OQ-2:** Best library for WHOIS lookups in Node.js serverless? Some WHOIS servers block cloud IPs — may need a free WHOIS API as fallback
- **OQ-3:** Vercel serverless 60s timeout vs VT polling (up to 150s) — may need async submit + separate client-side poll
- **OQ-4:** Specific font and color palette for "modern bold" aesthetic — to be decided during implementation
- **OQ-5:** Should educational content be kept, refreshed, or dropped?

### Risks
| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| VT free tier quota exhausted | Medium | High | Rate limiting + caching. Monitor quota |
| HF models deprecated/removed | Low | High | Pin versions. Maintain fallback list. Threat feeds as backup |
| WHOIS blocked from Vercel IPs | Medium | Medium | Free WHOIS API as primary, self-computed fallback |
| Vercel function timeout for VT | High | Medium | Restructure VT as async: submit + separate poll endpoint |
| Bundle size bloat | Low | Low | Monitor with size-limit in CI |
| Streaming implementation complexity | Medium | Medium | Start non-streaming, add streaming as enhancement |
