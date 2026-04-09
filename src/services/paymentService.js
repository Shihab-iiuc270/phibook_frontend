import apiClient from "./api-client";
import { markUserLocallyVerified } from "./localVerification";

export const DEFAULT_MONETIZATION_PLANS = {
  post_promotion: [
    {
      id: "promo_day",
      name: "1 Day Boost",
      amount: 49,
      description: "Push your post to more users for 24 hours.",
    },
    {
      id: "promo_week",
      name: "7 Day Boost",
      amount: 199,
      description: "Sustained reach boost for one full week.",
    },
  ],
  premium_membership: [
    {
      id: "premium_month",
      name: "Monthly Premium",
      amount: 299,
      description: "Unlock premium features for 30 days.",
    },
    {
      id: "premium_year",
      name: "Yearly Premium",
      amount: 2999,
      description: "Best value premium access for 12 months.",
    },
  ],
  blue_badge: [
    {
      id: "badge_month",
      name: "Blue Badge (Monthly)",
      amount: 499,
      description: "Verified badge + member support for 30 days.",
    },
    {
      id: "badge_year",
      name: "Blue Badge (Yearly)",
      amount: 4999,
      description: "Verified badge + member support for 12 months.",
    },
  ],
};

const PENDING_FEATURE_KEY = "phi_pending_feature_v1";
const PENDING_FEATURE_MAX_AGE_MS = 6 * 60 * 60 * 1000; // 6 hours

const safeJsonParse = (value) => {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

const nowIso = () => new Date().toISOString();

const durationDaysForPlanId = (planId) => {
  const id = String(planId || "").toLowerCase();
  if (id.includes("year")) return 365;
  if (id.includes("month")) return 30;
  if (id.includes("week")) return 7;
  if (id.includes("day")) return 1;
  return null;
};

export const setPendingPaymentFeature = (feature) => {
  if (typeof window === "undefined") return false;
  try {
    const payload = {
      ...feature,
      createdAt: nowIso(),
    };
    localStorage.setItem(PENDING_FEATURE_KEY, JSON.stringify(payload));
    return true;
  } catch {
    return false;
  }
};

export const consumePendingPaymentFeature = () => {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(PENDING_FEATURE_KEY);
    localStorage.removeItem(PENDING_FEATURE_KEY);
    const parsed = safeJsonParse(raw);
    if (!parsed || typeof parsed !== "object") return null;

    const createdAt = parsed?.createdAt ? new Date(parsed.createdAt).getTime() : NaN;
    if (!Number.isFinite(createdAt)) return null;
    if (Date.now() - createdAt > PENDING_FEATURE_MAX_AGE_MS) return null;

    const planId = parsed?.planId || parsed?.feature_plan || parsed?.plan || null;
    const durationDays = parsed?.durationDays ?? durationDaysForPlanId(planId);

    return {
      type: parsed?.type || parsed?.feature_type || null,
      planId,
      durationDays: Number.isFinite(Number(durationDays)) ? Number(durationDays) : null,
    };
  } catch {
    return null;
  }
};

export const activateLocalFeatureFromPending = (user, pending) => {
  const type = String(pending?.type || "").toLowerCase();
  if (!type) return false;

  const isBlueBadge = type.includes("badge") || type.includes("verify");
  if (!isBlueBadge) return false;

  const days = pending?.durationDays || 30;
  return markUserLocallyVerified(user, { durationDays: days });
};

const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : NaN;
};

const dedupeStrings = (items) => [...new Set(items.filter((item) => typeof item === "string" && item.trim()))];

const normalizePlanItem = (plan = {}, fallbackType = "post_promotion", fallbackIndex = 0) => {
  const id = String(plan?.id || plan?.slug || `${fallbackType}_${fallbackIndex + 1}`);
  const amount = toNumber(plan?.amount ?? plan?.price ?? plan?.fee ?? 0);

  return {
    id,
    name: String(plan?.name || plan?.title || id),
    amount: Number.isFinite(amount) && amount > 0 ? Number(amount.toFixed(2)) : 0,
    description: String(plan?.description || plan?.details || ""),
  };
};

const normalizeArrayByType = (rows = []) => {
  const grouped = {
    post_promotion: [],
    premium_membership: [],
    blue_badge: [],
  };

  rows.forEach((row, index) => {
    const rawType = String(row?.type || row?.feature_type || row?.category || "").toLowerCase();
    const type = rawType.includes("badge") || rawType.includes("verify")
      ? "blue_badge"
      : rawType.includes("premium")
        ? "premium_membership"
        : rawType.includes("promot")
          ? "post_promotion"
          : "post_promotion";
    const normalized = normalizePlanItem(row, type, index);
    if (normalized.amount > 0) {
      grouped[type].push(normalized);
    }
  });

  return grouped;
};

const normalizePlansResponse = (payload) => {
  if (!payload) return null;

  if (Array.isArray(payload)) {
    const grouped = normalizeArrayByType(payload);
    if (grouped.post_promotion.length || grouped.premium_membership.length) {
      return grouped;
    }
    return null;
  }

  const candidateList =
    (Array.isArray(payload?.results) && payload.results) ||
    (Array.isArray(payload?.items) && payload.items) ||
    (Array.isArray(payload?.plans) && payload.plans) ||
    null;

  if (candidateList) {
    const grouped = normalizeArrayByType(candidateList);
    if (grouped.post_promotion.length || grouped.premium_membership.length) {
      return grouped;
    }
  }

  const structured = {
    post_promotion: Array.isArray(payload?.post_promotion)
      ? payload.post_promotion.map((item, index) => normalizePlanItem(item, "post_promotion", index))
      : [],
    premium_membership: Array.isArray(payload?.premium_membership)
      ? payload.premium_membership.map((item, index) => normalizePlanItem(item, "premium_membership", index))
      : [],
    blue_badge: Array.isArray(payload?.blue_badge)
      ? payload.blue_badge.map((item, index) => normalizePlanItem(item, "blue_badge", index))
      : [],
  };

  if (structured.post_promotion.length || structured.premium_membership.length || structured.blue_badge.length) {
    return structured;
  }

  return null;
};

const withFallback = (incoming) => {
  if (!incoming) return DEFAULT_MONETIZATION_PLANS;

  return {
    post_promotion:
      incoming.post_promotion?.filter((plan) => plan.amount > 0) ||
      DEFAULT_MONETIZATION_PLANS.post_promotion,
    premium_membership:
      incoming.premium_membership?.filter((plan) => plan.amount > 0) ||
      DEFAULT_MONETIZATION_PLANS.premium_membership,
    blue_badge:
      incoming.blue_badge?.filter((plan) => plan.amount > 0) || DEFAULT_MONETIZATION_PLANS.blue_badge,
  };
};

export const getMonetizationPlans = async () => {
  const candidates = dedupeStrings([
    import.meta.env.VITE_PAYMENT_PLANS_ENDPOINT,
    "/payment/plans/",
    "/payment/options/",
  ]);

  for (const endpoint of candidates) {
    try {
      const response = await apiClient.get(endpoint);
      const normalized = normalizePlansResponse(response?.data);
      if (normalized) {
        return withFallback(normalized);
      }
    } catch {
      // continue to next candidate
    }
  }

  return DEFAULT_MONETIZATION_PLANS;
};

export const initiatePayment = async ({ amount, ...metadata }) => {
  const normalizedAmount = toNumber(amount);

  if (!normalizedAmount || normalizedAmount <= 0) {
    throw new Error("A valid payment amount is required.");
  }

  const payload = {
    amount: Number(normalizedAmount.toFixed(2)),
    ...metadata,
  };

  const response = await apiClient.post("/payment/initiate/", payload);
  const paymentUrl =
    response?.data?.payment_url ||
    response?.data?.GatewayPageURL ||
    response?.data?.gateway_url ||
    null;

  if (!paymentUrl) {
    throw new Error("Payment gateway URL is missing in initiate response.");
  }

  return {
    paymentUrl,
    raw: response?.data,
  };
};
