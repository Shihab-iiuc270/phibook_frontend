import { useEffect, useMemo, useState } from "react";
import { BadgeCheck, Sparkles } from "lucide-react";
import useAuthContext from "../hooks/useAuthContext";
import {
  DEFAULT_MONETIZATION_PLANS,
  getMonetizationPlans,
  initiatePayment,
} from "../services/paymentService";

const getFirstPlanId = (plans = [], fallback = "") => plans?.[0]?.id || fallback;

const BlueBadge = () => {
  const { user, fetchMyProfile } = useAuthContext();
  const [plansLoading, setPlansLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [error, setError] = useState("");
  const [plans, setPlans] = useState(DEFAULT_MONETIZATION_PLANS.blue_badge || []);
  const [selectedPlanId, setSelectedPlanId] = useState(
    getFirstPlanId(DEFAULT_MONETIZATION_PLANS.blue_badge, "badge_month")
  );

  useEffect(() => {
    fetchMyProfile?.().catch(() => {});
  }, []);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        setPlansLoading(true);
        const grouped = await getMonetizationPlans();
        const badgePlans =
          grouped?.blue_badge?.length ? grouped.blue_badge : DEFAULT_MONETIZATION_PLANS.blue_badge;
        if (!active) return;
        setPlans(badgePlans);
        setSelectedPlanId((prev) =>
          badgePlans.some((p) => p.id === prev)
            ? prev
            : getFirstPlanId(badgePlans, "badge_month")
        );
      } catch {
        if (active) setPlans(DEFAULT_MONETIZATION_PLANS.blue_badge);
      } finally {
        if (active) setPlansLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, []);

  const selectedPlan = useMemo(
    () => plans.find((p) => p.id === selectedPlanId) || plans[0] || null,
    [plans, selectedPlanId]
  );

  const startCheckout = async () => {
    if (!selectedPlan) {
      setError("Please select a plan.");
      return;
    }

    setError("");
    setPaymentLoading(true);
    try {
      const { paymentUrl } = await initiatePayment({
        amount: selectedPlan.amount,
        feature_type: "blue_badge",
        feature_plan: selectedPlan.id,
        feature_name: selectedPlan.name,
      });
      window.location.assign(paymentUrl);
    } catch (err) {
      const payload = err?.response?.data || {};
      setError(
        payload?.error ||
          payload?.detail ||
          payload?.message ||
          "Payment initiation failed. Please try again."
      );
    } finally {
      setPaymentLoading(false);
    }
  };

  return (
    <section className="max-w-[680px] mx-auto px-1 sm:px-0 space-y-3">
      <div className="bg-gradient-to-r from-sky-600 via-blue-700 to-indigo-700 text-white rounded-2xl px-4 py-5 shadow-[0_10px_30px_rgba(30,64,175,0.35)]">
        <div className="flex items-start gap-3">
          <div className="bg-white/15 rounded-2xl p-2">
            <BadgeCheck size={22} />
          </div>
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-widest text-sky-100">Phibook</p>
            <h1 className="text-xl font-bold leading-tight">Blue Badge</h1>
            <p className="text-sm text-sky-100 mt-1">
              Get a verified badge on your profile, like Facebook.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white/95 rounded-2xl border border-slate-200 shadow-[0_10px_30px_rgba(15,23,42,0.08)] p-4 sm:p-6 space-y-4">
        {error ? (
          <div className="bg-red-50 text-red-600 p-2 rounded-xl border border-red-200 text-sm">
            {error}
          </div>
        ) : null}

        <div className="flex items-start gap-3">
          <div className="bg-sky-50 border border-sky-200 text-sky-700 rounded-2xl p-2">
            <Sparkles size={18} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-900">
              Verified for {user?.name || user?.email || "your account"}
            </p>
            <p className="text-xs text-slate-600 mt-1">
              After successful payment, the badge will be activated by the server.
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-slate-800">Choose a plan</p>
            <p className="text-xs text-slate-500">{plansLoading ? "Loading plans..." : "BDT"}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {(plans || []).map((plan) => {
              const active = plan.id === selectedPlanId;
              return (
                <button
                  key={plan.id}
                  type="button"
                  onClick={() => setSelectedPlanId(plan.id)}
                  className={`rounded-xl border p-3 text-left transition ${
                    active
                      ? "border-emerald-400 bg-emerald-50"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <p className="text-sm font-semibold text-slate-800">{plan.name}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {plan.description || "Verified badge plan"}
                  </p>
                  <p className="text-sm font-bold text-emerald-700 mt-2">BDT {plan.amount}</p>
                </button>
              );
            })}
          </div>
        </div>

        <button
          type="button"
          disabled={plansLoading || paymentLoading || !selectedPlan}
          onClick={startCheckout}
          className="w-full sm:w-auto bg-gradient-to-r from-sky-500 to-blue-700 text-white px-4 py-2 rounded-xl font-semibold hover:opacity-95 transition disabled:opacity-60"
        >
          {paymentLoading ? "Redirecting to Payment..." : "Get Blue Badge"}
        </button>
      </div>
    </section>
  );
};

export default BlueBadge;

