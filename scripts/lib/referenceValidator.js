"use strict";
/**
 * Reference URL validator module.
 * Validates external links before including them in articles.
 *
 * Features:
 * - HEAD/GET requests with timeout
 * - 404/410 detection
 * - Empty/placeholder content detection
 * - Redirect following
 * - Domain deduplication
 * - Batch validation with concurrency control
 */

const DEFAULT_TIMEOUT_MS = parseInt(
  process.env.LINK_CHECK_TIMEOUT_MS || "10000",
  10,
);
const DEFAULT_MIN_BYTES = parseInt(
  process.env.LINK_CHECK_MIN_BYTES || "600",
  10,
);
const DEFAULT_USER_AGENT =
  process.env.LINK_CHECK_USER_AGENT ||
  // Some sites return misleading 404/empty content for custom/bot-like UAs.
  // Use a mainstream UA by default to reduce false negatives. Some domains
  // (notably ch.ch) appear to return 404 when a UA is explicitly set; we
  // handle that with a retry that omits default headers.
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";
const MAX_REDIRECTS = 5;

// Patterns that indicate empty/placeholder content
const EMPTY_CONTENT_PATTERNS = [
  /page\s*not\s*found/i,
  /404\s*error/i,
  /content\s*unavailable/i,
  /this\s*page\s*doesn't\s*exist/i,
  /cette\s*page\s*n'existe\s*pas/i,
  /seite\s*nicht\s*gefunden/i,
  /pagina\s*no\s*encontrada/i,
  /página\s*não\s*encontrada/i,
  /under\s*construction/i,
  /coming\s*soon/i,
  /placeholder\s*(content|page)/i,
  /lorem\s*ipsum/i,
];

// Trusted source domains (less strict validation)
const TRUSTED_DOMAINS = [
  // ─────────────────────────────
  // Switzerland – federal & official
  // ─────────────────────────────
  "admin.ch",
  "fedlex.admin.ch",
  "edoeb.admin.ch", // Swiss DPA (FADP)
  "ch.ch",
  "seco.admin.ch",
  "bfs.admin.ch",
  "parlament.ch",
  "swissinfo.ch",

  // ─────────────────────────────
  // European Union – institutions & regulators
  // ─────────────────────────────
  "europa.eu",
  "ec.europa.eu",
  "edpb.europa.eu", // European Data Protection Board
  "edps.europa.eu", // EU Data Protection Supervisor
  "eur-lex.europa.eu", // EU law texts (AI Act, GDPR, etc.)
  "consilium.europa.eu",

  // ─────────────────────────────
  // AI, data protection & cybersecurity authorities
  // ─────────────────────────────
  "nist.gov", // widely accepted even in EU context
  "enisa.europa.eu", // EU cybersecurity agency
  "cisa.gov",
  "owasp.org",
  "cisecurity.org",

  // ─────────────────────────────
  // Standards & normative references
  // ─────────────────────────────
  "iso.org",
  "iec.ch",
  "ieee.org",
  "w3.org",
  "ietf.org",

  // ─────────────────────────────
  // Cloud & AI platform documentation (official only)
  // ─────────────────────────────
  "learn.microsoft.com",
  "azure.microsoft.com",
  "cloud.google.com",
  "aws.amazon.com",
  "openai.com",

  // ─────────────────────────────
  // Open source & engineering foundations
  // ─────────────────────────────
  "github.com",
  "gitlab.com",
  "linuxfoundation.org",
  "apache.org",
  "python.org",

  // ─────────────────────────────
  // Academic & research (non-opinionated)
  // ─────────────────────────────
  "arxiv.org",
  "acm.org",
  "nature.com",
  "science.org",

  // ─────────────────────────────
  // Neutral reference (secondary only)
  // ─────────────────────────────
  "wikipedia.org",
  "britannica.com",
];

function parseDomainList(raw) {
  if (!raw || typeof raw !== "string") return [];
  return raw
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

function isAllowedByList(url, allowedDomains) {
  if (!allowedDomains || allowedDomains.length === 0) return true;
  try {
    const host = new URL(url).hostname.toLowerCase();
    return allowedDomains.some((d) => host === d || host.endsWith(`.${d}`));
  } catch {
    return false;
  }
}

/**
 * Check if a domain is in the trusted list
 * @param {string} url - URL to check
 * @returns {boolean}
 */
function isTrustedDomain(url) {
  try {
    const { hostname } = new URL(url);
    return TRUSTED_DOMAINS.some(
      (domain) => hostname === domain || hostname.endsWith(`.${domain}`),
    );
  } catch {
    return false;
  }
}

/**
 * Extract domain from URL for deduplication
 * @param {string} url - URL to extract domain from
 * @returns {string|null} Domain or null if invalid
 */
function extractDomain(url) {
  try {
    const u = new URL(url);
    const { hostname } = u;
    const lower = hostname.toLowerCase();

    // Microsoft Learn hosts many independent doc areas under one hostname.
    // Use the first path segment (after locale) as part of the key so we can
    // keep multiple official docs without collapsing to a single ref.
    if (lower === "learn.microsoft.com") {
      const parts = (u.pathname || "").split("/").filter(Boolean);
      const maybeLocale = parts[0] || "";
      const localeLike = /^[a-z]{2}-[a-z]{2}$/i.test(maybeLocale);
      const area = parts[localeLike ? 1 : 0] || "";
      return `learn.microsoft.com/${area || "_"}`;
    }

    // For Swiss institutional sites, different subdomains often represent
    // different authorities (e.g., bsv.admin.ch vs estv.admin.ch). Treat
    // the full hostname as the deduplication key.
    const multiTenantRoots = [
      "admin.ch",
      "ge.ch",
      "vd.ch",
      "zh.ch",
      "be.ch",
      "ti.ch",
      // Keep distinct Microsoft subdomains (azure.microsoft.com vs others).
      "microsoft.com",
    ];
    if (
      multiTenantRoots.some(
        (root) => lower === root || lower.endsWith(`.${root}`),
      )
    ) {
      return lower;
    }

    // Default: base domain (e.g., "example.com" from "www.example.com")
    const parts = lower.split(".");
    if (parts.length >= 2) return parts.slice(-2).join(".");
    return lower;
  } catch {
    return null;
  }
}

/**
 * Fetch with timeout and redirect handling
 * @param {string} url - URL to fetch
 * @param {Object} options - Fetch options
 * @returns {Promise<Response>}
 */
async function fetchWithTimeout(url, options = {}) {
  const {
    timeout = DEFAULT_TIMEOUT_MS,
    omitDefaultHeaders = false,
    ...fetchOptions
  } = options;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const defaultHeaders = omitDefaultHeaders
      ? {}
      : {
          "User-Agent": DEFAULT_USER_AGENT,
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        };
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
      redirect: "follow",
      headers: {
        ...defaultHeaders,
        ...fetchOptions.headers,
      },
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Validate a single URL
 * @param {string} url - URL to validate
 * @param {Object} options - Validation options
 * @returns {Promise<Object>} Validation result
 */
async function validateUrl(url, options = {}) {
  const {
    timeout = DEFAULT_TIMEOUT_MS,
    minBytes = DEFAULT_MIN_BYTES,
    checkContent = true,
  } = options;

  const result = {
    url,
    valid: false,
    status: null,
    statusText: null,
    bodySize: 0,
    contentType: null,
    finalUrl: url,
    error: null,
    reason: null,
  };

  // Basic URL validation
  if (!url || typeof url !== "string") {
    result.error = "Invalid URL format";
    result.reason = "invalid-url";
    return result;
  }

  if (!/^https?:\/\//.test(url)) {
    result.error = "URL must start with http:// or https://";
    result.reason = "invalid-protocol";
    return result;
  }

  try {
    const tryGetWithoutDefaultHeaders = async () => {
      // Some sites return false 404s when we set a UA/Accept header, or when
      // receiving HEAD requests. Retry with a GET and without our defaults.
      const retry = await fetchWithTimeout(url, {
        method: "GET",
        timeout,
        omitDefaultHeaders: true,
      });
      return retry;
    };

    // First try HEAD request to quickly detect hard failures and get metadata.
    // Note: HEAD responses have no body, so if we want to validate content we
    // must follow up with a GET for textual content.
    let usedHead = true;
    let response = await fetchWithTimeout(url, { method: "HEAD", timeout });
    result.status = response.status;
    result.statusText = response.statusText;
    result.finalUrl = response.url;

    // Some servers incorrectly respond 404/410 to HEAD (or to our default headers).
    // Retry with a GET without default headers before marking as not-found.
    if (response.status === 404 || response.status === 410) {
      const retry = await tryGetWithoutDefaultHeaders();
      if (!(retry.status === 404 || retry.status === 410)) {
        response = retry;
        usedHead = false;
        result.status = response.status;
        result.statusText = response.statusText;
        result.finalUrl = response.url;
      } else {
        result.reason = "not-found";
        result.error = `HTTP ${response.status}: ${response.statusText}`;
        return result;
      }
    }

    if (response.status >= 500) {
      result.reason = "server-error";
      result.error = `HTTP ${response.status}: ${response.statusText}`;
      return result;
    }

    // If HEAD fails with 405/403, try GET
    if (!response.ok || response.status === 405 || response.status === 403) {
      response = await fetchWithTimeout(url, { method: "GET", timeout });
      usedHead = false;
      result.status = response.status;
      result.statusText = response.statusText;
      result.finalUrl = response.url;
    }

    // Final status check after potential GET retry. Retry once more without
    // default headers for domains that block/lie to "bot-like" requests.
    if (response.status === 404 || response.status === 410) {
      const retry = await tryGetWithoutDefaultHeaders();
      if (retry.ok) {
        response = retry;
        usedHead = false;
        result.status = response.status;
        result.statusText = response.statusText;
        result.finalUrl = response.url;
      } else {
        result.reason = "not-found";
        result.error = `HTTP ${response.status}: ${response.statusText}`;
        return result;
      }
    }

    if (!response.ok) {
      result.reason = "http-error";
      result.error = `HTTP ${response.status}: ${response.statusText}`;
      return result;
    }

    // Get content info
    const contentType = response.headers.get("content-type") || "";
    result.contentType = contentType;

    // If we need to validate textual content, ensure we have a GET response body.
    // A successful HEAD would otherwise appear as an empty page (0 bytes).
    const looksTextual = /text|html|json|xml/i.test(contentType);
    if (checkContent && looksTextual && usedHead) {
      response = await fetchWithTimeout(url, { method: "GET", timeout });
      usedHead = false;
      result.status = response.status;
      result.statusText = response.statusText;
      result.finalUrl = response.url;
      result.contentType = response.headers.get("content-type") || contentType;
    }

    // Check content size
    const isTextual = /text|html|json|xml/i.test(result.contentType || "");

    if (checkContent && isTextual) {
      const body = await response.text();
      result.bodySize = Buffer.byteLength(body, "utf8");

      // Check for minimum content size
      if (result.bodySize < minBytes) {
        // Be more lenient with trusted domains
        if (!isTrustedDomain(url)) {
          result.reason = "content-too-small";
          result.error = `Body too small: ${result.bodySize} bytes (min: ${minBytes})`;
          return result;
        }
      }

      // Check for empty/placeholder patterns
      const hasEmptyPattern = EMPTY_CONTENT_PATTERNS.some((pattern) =>
        pattern.test(body),
      );
      if (hasEmptyPattern && !isTrustedDomain(url)) {
        result.reason = "empty-content";
        result.error = "Page appears to be empty or placeholder content";
        return result;
      }
    } else {
      // For binary content, use content-length or read body
      const contentLength = response.headers.get("content-length");
      if (contentLength) {
        result.bodySize = parseInt(contentLength, 10);
      } else {
        const buffer = await response.arrayBuffer();
        result.bodySize = buffer.byteLength;
      }

      if (result.bodySize < minBytes && !isTrustedDomain(url)) {
        result.reason = "content-too-small";
        result.error = `Content too small: ${result.bodySize} bytes`;
        return result;
      }
    }

    // All checks passed
    result.valid = true;
    return result;
  } catch (err) {
    if (err.name === "AbortError") {
      result.reason = "timeout";
      result.error = `Request timeout after ${timeout}ms`;
    } else {
      result.reason = "network-error";
      result.error = err.message;
    }
    return result;
  }
}

/**
 * Validate multiple references with concurrency control
 * @param {Array<Object>} references - Array of {url, labelKey, ...} objects
 * @param {Object} options - Validation options
 * @returns {Promise<Object>} Validation results
 */
async function validateReferences(references, options = {}) {
  const { concurrency = 4, ...validateOptions } = options;
  const requireTrusted = process.env.REFERENCE_REQUIRE_TRUSTED_DOMAINS === "1";
  const allowedDomains = parseDomainList(process.env.REFERENCE_ALLOWED_DOMAINS);

  if (!Array.isArray(references) || references.length === 0) {
    return {
      valid: [],
      invalid: [],
      stats: { checked: 0, valid: 0, invalid: 0 },
    };
  }

  const results = [];
  const queue = [...references];

  // Process with limited concurrency
  const workers = Array.from(
    { length: Math.min(concurrency, queue.length) },
    async () => {
      while (queue.length > 0) {
        const ref = queue.shift();
        if (!ref || !ref.url) {
          results.push({
            ref,
            result: {
              valid: false,
              reason: "missing-url",
              error: "Reference missing URL",
            },
          });
          continue;
        }
        if (!isAllowedByList(ref.url, allowedDomains)) {
          results.push({
            ref,
            result: {
              valid: false,
              reason: "domain-not-allowed",
              error: "Domain not in allowlist",
            },
          });
          continue;
        }
        if (requireTrusted && !isTrustedDomain(ref.url)) {
          results.push({
            ref,
            result: {
              valid: false,
              reason: "untrusted-domain",
              error: "Domain not in trusted list",
            },
          });
          continue;
        }
        const result = await validateUrl(ref.url, validateOptions);
        results.push({ ref, result });
      }
    },
  );

  await Promise.all(workers);

  // Separate valid and invalid
  const valid = [];
  const invalid = [];

  for (const { ref, result } of results) {
    if (result.valid) {
      valid.push({ ...ref, _validation: result });
    } else {
      invalid.push({ ...ref, _validation: result });
    }
  }

  return {
    valid,
    invalid,
    stats: {
      checked: results.length,
      valid: valid.length,
      invalid: invalid.length,
    },
  };
}

/**
 * Deduplicate references by domain (keep only one per domain)
 * @param {Array<Object>} references - Array of reference objects
 * @returns {Array<Object>} Deduplicated references
 */
function deduplicateByDomain(references) {
  const seenDomains = new Set();
  const unique = [];

  for (const ref of references) {
    const domain = extractDomain(ref.url);
    if (!domain || seenDomains.has(domain)) {
      continue;
    }
    seenDomains.add(domain);
    unique.push(ref);
  }

  return unique;
}

/**
 * Verified Swiss/official fallback references for different topics
 */
const VERIFIED_FALLBACK_REFS = {
  "private-ai": [
    {
      labelKey: "Loi fédérale sur la protection des données (LPD) - Fedlex",
      url: "https://www.fedlex.admin.ch/eli/cc/2022/491/fr",
    },
    {
      labelKey: "Préposé fédéral à la protection des données (PFPDT) - EDOEB",
      url: "https://www.edoeb.admin.ch/edoeb/fr/home.html",
    },
  ],
  "microsoft-365": [
    {
      labelKey: "Outlook Add-ins - Documentation Microsoft Learn",
      url: "https://learn.microsoft.com/en-us/office/dev/add-ins/outlook/",
    },
    {
      labelKey: "Office.js (Add-ins) - Repository officiel",
      url: "https://github.com/OfficeDev/office-js",
    },
  ],
  productivity: [
    {
      labelKey: "Power Automate - Documentation Microsoft Learn",
      url: "https://learn.microsoft.com/en-us/power-automate/",
    },
    {
      labelKey: "Microsoft Graph - Overview - Microsoft Learn",
      url: "https://learn.microsoft.com/en-us/graph/overview",
    },
  ],
  technology: [
    {
      labelKey: "Azure OpenAI - Documentation Microsoft Learn",
      url: "https://learn.microsoft.com/en-us/azure/ai-services/openai/",
    },
    {
      labelKey: "Azure OpenAI - Use your data (RAG) - Microsoft Learn",
      url: "https://learn.microsoft.com/en-us/azure/ai-services/openai/concepts/use-your-data",
    },
  ],
  enterprise: [
    {
      labelKey: "AI Risk Management Framework (AI RMF) - NIST",
      url: "https://www.nist.gov/itl/ai-risk-management-framework",
    },
    {
      labelKey: "Cloud Adoption Framework - Microsoft Learn",
      url: "https://learn.microsoft.com/en-us/azure/cloud-adoption-framework/",
    },
  ],
  governance: [
    {
      labelKey: "AI Act - Cadre réglementaire de l'UE sur l'IA - Commission européenne",
      url: "https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai",
    },
    {
      labelKey: "AI Risk Management Framework (AI RMF) - NIST",
      url: "https://www.nist.gov/itl/ai-risk-management-framework",
    },
    {
      labelKey: "Loi fédérale sur la protection des données (LPD) - Fedlex",
      url: "https://www.fedlex.admin.ch/eli/cc/2022/491/fr",
    },
  ],
  general: [
    {
      labelKey: "Azure OpenAI Service - Azure Product Page",
      url: "https://azure.microsoft.com/en-us/products/ai-services/openai-service",
    },
    {
      labelKey: "Microsoft Learn - Terms of Use",
      url: "https://learn.microsoft.com/en-us/legal/termsofuse",
    },
    // Authoritative, non-Microsoft anchors so any category that falls back to
    // "general" still retains at least one trusted reference after dedup by domain
    // (the Microsoft entries above often duplicate an article's existing refs).
    {
      labelKey: "AI Risk Management Framework (AI RMF) - NIST",
      url: "https://www.nist.gov/itl/ai-risk-management-framework",
    },
    {
      labelKey: "AI Act - Cadre réglementaire de l'UE sur l'IA - Commission européenne",
      url: "https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai",
    },
  ],
};

/**
 * Get verified fallback references for a topic category
 * @param {string} category - Topic category
 * @returns {Array<Object>} Verified references
 */
function getFallbackReferences(category = "general") {
  return VERIFIED_FALLBACK_REFS[category] || VERIFIED_FALLBACK_REFS.general;
}

module.exports = {
  validateUrl,
  validateReferences,
  deduplicateByDomain,
  extractDomain,
  isTrustedDomain,
  getFallbackReferences,
  VERIFIED_FALLBACK_REFS,
  DEFAULT_TIMEOUT_MS,
  DEFAULT_MIN_BYTES,
};
