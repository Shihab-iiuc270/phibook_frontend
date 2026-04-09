const STORAGE_KEY = "phi_local_verified_v1";
const DEFAULT_EXPIRY_DAYS = 30;

const safeParse = (value) => {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

const safeReadStore = () => {
  if (typeof window === "undefined") return {};

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = safeParse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
};

const safeWriteStore = (store) => {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store || {}));
  } catch {
    // ignore
  }

  try {
    window.dispatchEvent(new CustomEvent("phi:local-verification"));
  } catch {
    // ignore
  }
};

export const getVerificationKeyForUser = (user) => {
  if (!user) return null;

  const id = user?.id ?? user?.raw?.id ?? null;
  if (id !== null && id !== undefined && String(id).trim() !== "") {
    return `id:${id}`;
  }

  const email = user?.email ?? user?.raw?.email ?? null;
  if (email && String(email).trim() !== "") {
    return `email:${String(email).trim().toLowerCase()}`;
  }

  return null;
};

const asIsoOrNull = (value) => {
  if (!value) return null;

  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? date.toISOString() : null;
};

const msFromDays = (days) => {
  const parsed = Number(days);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return 0;
  }

  return Math.round(parsed * 24 * 60 * 60 * 1000);
};

const migrateEntryIfNeeded = (entry) => {
  if (!entry || typeof entry !== "object") return null;

  if (!entry.verified) return entry;
  if (entry.expiresAt) return entry;

  const base = entry.at ? new Date(entry.at).getTime() : Date.now();

  const expiresAt = new Date(
    base + msFromDays(DEFAULT_EXPIRY_DAYS)
  ).toISOString();

  return {
    ...entry,
    expiresAt,
  };
};

export const getUserLocalVerification = (user) => {
  const key = getVerificationKeyForUser(user);
  if (!key) return null;

  const store = safeReadStore();
  const migrated = migrateEntryIfNeeded(store?.[key]);

  if (migrated && migrated !== store?.[key]) {
    store[key] = migrated;
    safeWriteStore(store);
  }

  return migrated || null;
};

export const clearUserLocalVerification = (user) => {
  const key = getVerificationKeyForUser(user);
  if (!key) return false;

  const store = safeReadStore();

  if (!store?.[key]) {
    return true;
  }

  delete store[key];
  safeWriteStore(store);
  return true;
};

export const isUserLocallyVerified = (user) => {
  const key = getVerificationKeyForUser(user);
  if (!key) return false;

  const entry = getUserLocalVerification(user);

  if (!entry?.verified) {
    return false;
  }

  const expiresAt = entry?.expiresAt
    ? new Date(entry.expiresAt).getTime()
    : NaN;

  if (!Number.isFinite(expiresAt)) {
    return true;
  }

  if (Date.now() >= expiresAt) {
    clearUserLocalVerification(user);
    return false;
  }

  return true;
};

export const markUserLocallyVerified = (
  user,
  { expiresAt, durationDays } = {}
) => {
  const key = getVerificationKeyForUser(user);
  if (!key) return false;

  const store = safeReadStore();

  const nowIso = new Date().toISOString();

  const normalizedExpiresAt =
    asIsoOrNull(expiresAt) ||
    (durationDays
      ? new Date(Date.now() + msFromDays(durationDays)).toISOString()
      : null) ||
    new Date(Date.now() + msFromDays(DEFAULT_EXPIRY_DAYS)).toISOString();

  store[key] = {
    verified: true,
    at: nowIso,
    expiresAt: normalizedExpiresAt,
  };

  safeWriteStore(store);
  return true;
};

export const getUserVerificationExpiry = (user) => {
  const entry = getUserLocalVerification(user);

  if (!entry?.verified || !entry?.expiresAt) {
    return null;
  }

  const date = new Date(entry.expiresAt);
  return Number.isFinite(date.getTime()) ? date : null;
};

const coerceTruthyBoolean = (value) => {
  if (value === true) return true;
  if (value === false) return false;

  if (typeof value === "number") {
    return value === 1;
  }

  if (typeof value === "string") {
    return ["true", "1", "yes"].includes(value.trim().toLowerCase());
  }

  return false;
};

const asValidDateOrNull = (value) => {
  if (!value) return null;

  const date = value instanceof Date ? value : new Date(value);
  return Number.isFinite(date.getTime()) ? date : null;
};

export const getUserServerVerificationInfo = (user) => {
  const raw = user?.raw || null;

  const verifiedValue =
    user?.is_verified ??
    raw?.is_verified ??
    false;

  const verified = coerceTruthyBoolean(verifiedValue);

  const expiresAtValue =
    user?.verified_until ??
    user?.verifiedUntil ??
    raw?.verified_until ??
    raw?.verifiedUntil ??
    null;

  const expiresAt = asValidDateOrNull(expiresAtValue);

  if (expiresAt && Date.now() >= expiresAt.getTime()) {
    return {
      verified: false,
      expiresAt,
    };
  }

  return {
    verified,
    expiresAt,
  };
};

export const isUserVerified = (user) => {
  const serverInfo = getUserServerVerificationInfo(user);

  // server is main source
  if (serverInfo.verified) {
    markUserLocallyVerified(user, {
      expiresAt: serverInfo.expiresAt,
    });

    return true;
  }

  // fallback local cache
  return isUserLocallyVerified(user);
};

export const syncUserVerificationFromServer = (user) => {
  const serverInfo = getUserServerVerificationInfo(user);

  if (serverInfo.verified) {
    markUserLocallyVerified(user, {
      expiresAt: serverInfo.expiresAt,
    });
  } else {
    clearUserLocalVerification(user);
  }
};

export const ensureUserLocallyVerified = (
  user,
  { expiresAt, durationDays } = {}
) => {
  const entry = getUserLocalVerification(user);

  if (entry?.verified && isUserLocallyVerified(user)) {
    return true;
  }

  return markUserLocallyVerified(user, {
    expiresAt,
    durationDays,
  });
};