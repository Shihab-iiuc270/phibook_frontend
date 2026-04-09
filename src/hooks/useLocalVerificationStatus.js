import { useEffect, useMemo, useState } from "react";
import {
  getUserServerVerificationInfo,
  getUserLocalVerification,
  getUserVerificationExpiry,
  isUserLocallyVerified,
} from "../services/localVerification";

const clampNonNegative = (value) => (Number.isFinite(value) && value > 0 ? value : 0);

const getRemainingMs = (expiresAt) => {
  if (!expiresAt) return null;
  const ms = expiresAt.getTime() - Date.now();
  return clampNonNegative(ms);
};

const toCountdownParts = (remainingMs) => {
  if (remainingMs === null) return null;
  const seconds = Math.floor(remainingMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  return { days, hours: hours % 24, minutes: minutes % 60 };
};

const toShortLabel = (parts) => {
  if (!parts) return null;
  if (parts.days > 0) return `${parts.days}d`;
  if (parts.hours > 0) return `${parts.hours}h`;
  return `${parts.minutes}m`;
};

const toLongLabel = (parts) => {
  if (!parts) return null;
  if (parts.days > 0) return `${parts.days} day${parts.days === 1 ? "" : "s"}`;
  if (parts.hours > 0) return `${parts.hours} hour${parts.hours === 1 ? "" : "s"}`;
  return `${parts.minutes} min`;
};

const snapshot = (user) => {
  const server = getUserServerVerificationInfo(user);
  const localVerified = isUserLocallyVerified(user);
  const localExpiresAt = getUserVerificationExpiry(user);

  const verified = Boolean(server?.verified) || localVerified;
  const expiresAt = server?.expiresAt || localExpiresAt;
  const entry = getUserLocalVerification(user);
  return {
    verified,
    expiresAt,
    activatedAt: entry?.at ? new Date(entry.at) : null,
  };
};

const useLocalVerificationStatus = (user, { tickMs = 60_000 } = {}) => {
  const [state, setState] = useState(() => snapshot(user));

  useEffect(() => {
    setState(snapshot(user));

    const onStorage = (event) => {
      if (!event) return;
      // If localStorage changes (including in another tab), refresh.
      setState(snapshot(user));
    };

    window?.addEventListener?.("storage", onStorage);
    return () => window?.removeEventListener?.("storage", onStorage);
  }, [user?.id, user?.email]);

  useEffect(() => {
    if (!state?.verified) return;
    if (!state?.expiresAt) return;
    const interval = setInterval(() => setState(snapshot(user)), tickMs);
    return () => clearInterval(interval);
  }, [state?.verified, state?.expiresAt?.getTime?.(), tickMs, user?.id, user?.email]);

  const remainingMs = useMemo(() => getRemainingMs(state?.expiresAt || null), [state?.expiresAt]);
  const parts = useMemo(() => toCountdownParts(remainingMs), [remainingMs]);

  return {
    verified: Boolean(state?.verified),
    expiresAt: state?.expiresAt || null,
    activatedAt: state?.activatedAt || null,
    remainingMs,
    remainingParts: parts,
    remainingLabelShort: toShortLabel(parts),
    remainingLabelLong: toLongLabel(parts),
  };
};

export default useLocalVerificationStatus;
