export interface NormalizedUrl {
  input: string;
  normalizedUrl: string;
  hostname: string;
  protocol: "http:" | "https:";
}

export type UrlValidationResult =
  | {
      ok: true;
      value: NormalizedUrl;
    }
  | {
      ok: false;
      error: string;
    };

const MAX_URL_LENGTH = 2048;
const PRIVATE_HOSTS = new Set(["localhost", "0.0.0.0", "::1"]);

export function normalizeUrlInput(input: string): UrlValidationResult {
  const trimmed = input.trim();

  if (!trimmed) {
    return { ok: false, error: "Enter a URL to analyze." };
  }

  if (trimmed.length > MAX_URL_LENGTH) {
    return {
      ok: false,
      error: "URLs longer than 2048 characters are not supported.",
    };
  }

  const candidate = /^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;

  let url: URL;

  try {
    url = new URL(candidate);
  } catch {
    return { ok: false, error: "Enter a valid HTTP or HTTPS URL." };
  }

  if (!["http:", "https:"].includes(url.protocol)) {
    return { ok: false, error: "Only HTTP and HTTPS URLs are supported." };
  }

  const hostname = url.hostname.toLowerCase();

  if (!hostname) {
    return { ok: false, error: "A hostname is required." };
  }

  if (isPrivateHostname(hostname)) {
    return {
      ok: false,
      error: "Private, localhost, and internal network URLs are not allowed.",
    };
  }

  if (
    (url.protocol === "http:" && url.port === "80") ||
    (url.protocol === "https:" && url.port === "443")
  ) {
    url.port = "";
  }

  url.hash = "";

  return {
    ok: true,
    value: {
      input: trimmed,
      normalizedUrl: url.toString(),
      hostname,
      protocol: url.protocol as "http:" | "https:",
    },
  };
}

export function createCacheKey(normalizedUrl: string) {
  return normalizedUrl.toLowerCase();
}

export function formatDisplayUrl(url: string) {
  const parsed = normalizeUrlInput(url);
  if (!parsed.ok) {
    return url;
  }

  return parsed.value.normalizedUrl.replace(/^https?:\/\//, "");
}

export function simplifyUrlForMatching(url: string) {
  try {
    const parsed = new URL(url);
    parsed.hash = "";
    const withoutTrailingSlash = parsed.toString().replace(/\/$/, "");
    return withoutTrailingSlash;
  } catch {
    return url.replace(/\/$/, "");
  }
}

export function isPrivateHostname(hostname: string) {
  if (PRIVATE_HOSTS.has(hostname) || hostname.endsWith(".local")) {
    return true;
  }

  const ipVersion = getIpVersion(hostname);

  if (ipVersion === 4) {
    return isPrivateIpv4(hostname);
  }

  if (ipVersion === 6) {
    return isPrivateIpv6(hostname);
  }

  return false;
}

function isPrivateIpv4(hostname: string) {
  const octets = hostname.split(".").map((segment) => Number(segment));

  if (octets.length !== 4 || octets.some((value) => Number.isNaN(value))) {
    return false;
  }

  const [first, second] = octets;
  if (first === undefined || second === undefined) {
    return false;
  }

  return (
    first === 10 ||
    first === 127 ||
    (first === 169 && second === 254) ||
    (first === 172 && second >= 16 && second <= 31) ||
    (first === 192 && second === 168)
  );
}

function isPrivateIpv6(hostname: string) {
  const normalized = hostname.toLowerCase();
  return (
    normalized === "::1" ||
    normalized.startsWith("fc") ||
    normalized.startsWith("fd") ||
    normalized.startsWith("fe80:")
  );
}

function getIpVersion(hostname: string) {
  if (/^(\d{1,3}\.){3}\d{1,3}$/.test(hostname)) {
    return 4;
  }

  if (hostname.includes(":")) {
    return 6;
  }

  return 0;
}
