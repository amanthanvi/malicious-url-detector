# Security Policy

Scrutinix analyzes untrusted URLs and integrates with external reputation and
enrichment providers. Security issues should be reported privately first.

## Supported Scope

Report vulnerabilities that affect:

- URL validation, normalization, or request-boundary enforcement
- Server-side request handling, rate limiting, or cache isolation
- Data disclosure through logs, share links, or client-side history behavior
- Dependency or deployment issues that create a realistic security impact

## Reporting

- Do not open a public GitHub issue for an unpatched vulnerability.
- Prefer GitHub's private vulnerability reporting flow for this repository.
- If private reporting is unavailable, contact the maintainer directly through
  the repository owner's GitHub profile before public disclosure.

Include:

- affected version or branch
- impact summary
- reproduction steps or proof of concept
- any suggested mitigation if you have one

## Response Expectations

- Initial triage target: within 5 business days
- Remediation target: depends on severity and exploitability
- Coordinated disclosure is preferred once a fix or mitigation is available

## Safe Harbor

Good-faith research intended to improve Scrutinix's security will be treated as
responsible disclosure. Do not access data that is not yours, degrade service
availability, or publish exploit details before the maintainer has had a
reasonable chance to respond.
