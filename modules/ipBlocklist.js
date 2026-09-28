import fs from "fs";

const TRUE_VALUES = new Set(["1", "true", "yes", "on"]);
const IPV4_CIDR_SUFFIX = /\/\d{1,2}$/;

function toBool(value, fallback = false) {
  const normalized = String(value || "")
    .trim()
    .toLowerCase();
  if (!normalized) {
    return fallback;
  }
  return TRUE_VALUES.has(normalized);
}

function normalizeIp(ip) {
  const raw = String(ip || "").trim();
  if (!raw) {
    return "";
  }
  const first = raw.split(",")[0].trim();
  if (!first) {
    return "";
  }
  return first.startsWith("::ffff:") ? first.slice(7) : first;
}

function isValidIpv4(ip) {
  if (!ip) {
    return false;
  }
  const parts = String(ip).split(".");
  if (parts.length !== 4) {
    return false;
  }
  for (const part of parts) {
    if (!/^\d{1,3}$/.test(part)) {
      return false;
    }
    const value = Number(part);
    if (!Number.isInteger(value) || value < 0 || value > 255) {
      return false;
    }
  }
  return true;
}

function ipv4ToInt(ip) {
  const [a, b, c, d] = String(ip).split(".").map((x) => Number(x));
  return (((a << 24) >>> 0) | ((b << 16) >>> 0) | ((c << 8) >>> 0) | d) >>> 0;
}

function parseIpv4Cidr(value) {
  const raw = String(value || "").trim();
  if (!IPV4_CIDR_SUFFIX.test(raw)) {
    return null;
  }
  const [ip, prefixRaw] = raw.split("/");
  if (!isValidIpv4(ip)) {
    return null;
  }
  const prefix = Number(prefixRaw);
  if (!Number.isInteger(prefix) || prefix < 0 || prefix > 32) {
    return null;
  }
  const mask = prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0;
  const network = ipv4ToInt(ip) & mask;
  return {
    rule: `${ip}/${prefix}`,
    prefix,
    mask,
    network,
  };
}

function tokenizeCandidates(content) {
  const items = [];
  const lines = String(content || "").split(/\r?\n/);
  for (const rawLine of lines) {
    const trimmed = String(rawLine || "").trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }
    const lineNoComment = trimmed.replace(/\s+#.*$/, "").trim();
    if (!lineNoComment) {
      continue;
    }
    if (/^[A-Za-z0-9_-]+\s*:\s*$/.test(lineNoComment)) {
      continue;
    }
    let value = lineNoComment;
    if (value.startsWith("-")) {
      value = value.slice(1).trim();
    } else if (value.includes(":")) {
      const maybeValue = value.split(":").slice(1).join(":").trim();
      if (maybeValue) {
        value = maybeValue;
      }
    }
    if (value.startsWith("[") && value.endsWith("]")) {
      value = value.slice(1, -1);
    }
    value
      .split(",")
      .map((x) => x.trim().replace(/^["']|["']$/g, ""))
      .filter(Boolean)
      .forEach((token) => items.push(token));
  }
  return items;
}

const state = {
  loaded: false,
  path: "",
  lastCheckMs: 0,
  lastMtimeMs: -1,
  exactIps: new Set(),
  cidr4: [],
  lastError: "",
};

function getConfigPath() {
  return String(process.env.IP_BLOCKLIST_YAML_PATH || "").trim();
}

function isEnabled() {
  return toBool(process.env.IP_BLOCKLIST_ENABLED, true);
}

function getReloadMs() {
  const raw = Number(process.env.IP_BLOCKLIST_RELOAD_MS || 5000);
  if (!Number.isFinite(raw) || raw < 500) {
    return 5000;
  }
  return Math.floor(raw);
}

function clearRules() {
  state.exactIps = new Set();
  state.cidr4 = [];
}

function loadRulesFromDisk(configPath, mtimeMs) {
  const content = fs.readFileSync(configPath, "utf8");
  const tokens = tokenizeCandidates(content);
  const exactIps = new Set();
  const cidr4 = [];

  for (const tokenRaw of tokens) {
    const token = normalizeIp(tokenRaw);
    if (!token) {
      continue;
    }
    const cidr = parseIpv4Cidr(token);
    if (cidr) {
      cidr4.push(cidr);
      continue;
    }
    if (isValidIpv4(token)) {
      exactIps.add(token);
      continue;
    }
    // Keep non-IPv4 exact rules too (e.g. IPv6); exact match only.
    if (token.includes(":")) {
      exactIps.add(token);
    }
  }

  state.exactIps = exactIps;
  state.cidr4 = cidr4;
  state.path = configPath;
  state.lastMtimeMs = mtimeMs;
  state.loaded = true;
  state.lastError = "";
}

function ensureLoaded() {
  const now = Date.now();
  const configPath = getConfigPath();
  if (!isEnabled() || !configPath) {
    if (!state.loaded || state.path !== configPath) {
      clearRules();
      state.path = configPath;
      state.loaded = true;
      state.lastMtimeMs = -1;
      state.lastError = "";
    }
    return;
  }
  if (now - state.lastCheckMs < getReloadMs()) {
    return;
  }
  state.lastCheckMs = now;

  try {
    const stat = fs.statSync(configPath);
    const mtimeMs = Number(stat.mtimeMs || 0);
    if (state.path === configPath && state.lastMtimeMs === mtimeMs && state.loaded) {
      return;
    }
    loadRulesFromDisk(configPath, mtimeMs);
  } catch (error) {
    clearRules();
    state.path = configPath;
    state.loaded = true;
    state.lastMtimeMs = -1;
    state.lastError = String(error?.message || error || "failed to load ip blocklist");
  }
}

export function getIpBlocklistStatus() {
  ensureLoaded();
  return {
    enabled: isEnabled(),
    path: state.path,
    exactCount: state.exactIps.size,
    cidrCount: state.cidr4.length,
    lastError: state.lastError,
  };
}

export function checkIpBlocked(ip) {
  ensureLoaded();
  const candidate = normalizeIp(ip);
  if (!candidate) {
    return { blocked: false, ip: "", rule: "", source: state.path };
  }

  if (state.exactIps.has(candidate)) {
    return { blocked: true, ip: candidate, rule: candidate, source: state.path };
  }

  if (isValidIpv4(candidate)) {
    const ipInt = ipv4ToInt(candidate);
    for (const rule of state.cidr4) {
      if ((ipInt & rule.mask) === rule.network) {
        return { blocked: true, ip: candidate, rule: rule.rule, source: state.path };
      }
    }
  }

  return { blocked: false, ip: candidate, rule: "", source: state.path };
}
