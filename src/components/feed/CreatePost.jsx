import { useEffect, useRef, useState } from "react";
import { BadgeDollarSign, Crown, ImagePlus, Rocket, X } from "lucide-react";
import {
  DEFAULT_MONETIZATION_PLANS,
  getMonetizationPlans,
  initiatePayment,
} from "../../services/paymentService";

const getFirstPlanId = (plans = [], fallback = "") => plans?.[0]?.id || fallback;

const CreatePost = ({ onSubmit, loading = false }) => {
  const [caption, setCaption] = useState("");
  const [images, setImages] = useState([]);
  const [error, setError] = useState("");
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [plansLoading, setPlansLoading] = useState(true);
  const [monetizationType, setMonetizationType] = useState("none");
  const [availablePlans, setAvailablePlans] = useState(DEFAULT_MONETIZATION_PLANS);
  const [selectedPlans, setSelectedPlans] = useState({
    post_promotion: getFirstPlanId(DEFAULT_MONETIZATION_PLANS.post_promotion, "promo_day"),
    premium_membership: getFirstPlanId(DEFAULT_MONETIZATION_PLANS.premium_membership, "premium_month"),
  });
  const fileInputRef = useRef(null);

  useEffect(() => {
    let active = true;

    const loadPlans = async () => {
      try {
        setPlansLoading(true);
        const plans = await getMonetizationPlans();

        if (!active) return;

        setAvailablePlans(plans);
        setSelectedPlans((prev) => ({
          post_promotion:
            plans.post_promotion.some((plan) => plan.id === prev.post_promotion)
              ? prev.post_promotion
              : getFirstPlanId(plans.post_promotion, "promo_day"),
          premium_membership:
            plans.premium_membership.some((plan) => plan.id === prev.premium_membership)
              ? prev.premium_membership
              : getFirstPlanId(plans.premium_membership, "premium_month"),
        }));
      } finally {
        if (active) {
          setPlansLoading(false);
        }
      }
    };

    loadPlans();

    return () => {
      active = false;
    };
  }, []);

  const activePlans = monetizationType === "none" ? [] : availablePlans[monetizationType] || [];
  const activePlanId = monetizationType === "none" ? null : selectedPlans[monetizationType];
  const activePlan = activePlans.find((plan) => plan.id === activePlanId) || null;

  const getPaymentError = (err) => {
    const payload = err?.response?.data;
    if (typeof payload?.error === "string") return payload.error;
    if (typeof payload?.detail === "string") return payload.detail;
    if (typeof payload?.message === "string") return payload.message;
    return "Payment initiation failed. Your post was published, but checkout could not start.";
  };

  const startCheckout = async ({ featureType, plan, postId, postedCaption }) => {
    const { paymentUrl } = await initiatePayment({
      amount: plan.amount,
      feature_type: featureType,
      feature_plan: plan.id,
      feature_name: plan.name,
      post_id: postId || null,
      caption: postedCaption,
    });

    window.location.assign(paymentUrl);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const value = caption.trim();

    if (!value) {
      setError("Post caption is required");
      return;
    }

    if (monetizationType !== "none" && !activePlan) {
      setError("Please select a valid monetization plan.");
      return;
    }

    setError("");

    try {
      const created = await onSubmit({ caption: value, images });

      if (monetizationType !== "none" && activePlan) {
        setPaymentLoading(true);

        try {
          await startCheckout({
            featureType: monetizationType,
            plan: activePlan,
            postId: created?.id,
            postedCaption: value,
          });
          return;
        } catch (paymentErr) {
          setError(getPaymentError(paymentErr));
        } finally {
          setPaymentLoading(false);
        }
      }

      setCaption("");
      setImages([]);
    } catch {
      // parent handles post errors
    }
  };

  const busy = loading || paymentLoading;

  return (
    <div className="bg-white/90 backdrop-blur rounded-2xl shadow-[0_10px_30px_rgba(15,23,42,0.08)] border border-slate-200 mb-4 p-4 sm:p-5">
      <h3 className="text-base font-semibold mb-3 text-slate-800">Create Post</h3>
      <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
        {error ? (
          <div className="bg-red-50 text-red-600 p-2 rounded-xl border border-red-200 text-sm">
            {error}
          </div>
        ) : null}

        <textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="What's on your mind?"
          className="w-full border border-slate-300 rounded-xl p-3 min-h-[100px] resize-y focus:outline-none focus:border-sky-400 bg-slate-50/40"
        />

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 block">Add Images</label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => setImages(Array.from(e.target.files || []))}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full border border-dashed border-sky-300 bg-sky-50 hover:bg-sky-100 rounded-xl p-4 text-sky-700 flex items-center justify-center gap-2 transition-colors"
          >
            <ImagePlus size={18} />
            <span className="font-medium">{images.length > 0 ? "Change images" : "Choose images"}</span>
          </button>

          {images.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {images.map((file, idx) => (
                <span
                  key={`${file.name}-${idx}`}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-slate-100 text-slate-700 border border-slate-200 max-w-full"
                >
                  <span className="truncate max-w-[170px] sm:max-w-[260px]">{file.name}</span>
                  <button
                    type="button"
                    onClick={() => setImages((prev) => prev.filter((_, i) => i !== idx))}
                    className="text-slate-500 hover:text-red-500 shrink-0"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500">No images selected.</p>
          )}
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 sm:p-4 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <h4 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
              <BadgeDollarSign size={16} className="text-emerald-600" />
              Monetization (Optional)
            </h4>
            <p className="text-[11px] sm:text-xs text-slate-500">
              {plansLoading ? "Syncing plans..." : "Works with SSLCOMMERZ checkout"}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setMonetizationType("none")}
              className={`rounded-lg border px-3 py-2 text-left text-xs sm:text-sm transition ${
                monetizationType === "none"
                  ? "border-sky-400 bg-sky-50 text-sky-700"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
              }`}
            >
              Post Normally
            </button>
            <button
              type="button"
              onClick={() => setMonetizationType("post_promotion")}
              className={`rounded-lg border px-3 py-2 text-left text-xs sm:text-sm transition ${
                monetizationType === "post_promotion"
                  ? "border-sky-400 bg-sky-50 text-sky-700"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
              }`}
            >
              <span className="inline-flex items-center gap-1">
                <Rocket size={14} /> Promote Post
              </span>
            </button>
            <button
              type="button"
              onClick={() => setMonetizationType("premium_membership")}
              className={`rounded-lg border px-3 py-2 text-left text-xs sm:text-sm transition ${
                monetizationType === "premium_membership"
                  ? "border-sky-400 bg-sky-50 text-sky-700"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
              }`}
            >
              <span className="inline-flex items-center gap-1">
                <Crown size={14} /> Premium
              </span>
            </button>
          </div>

          {monetizationType !== "none" ? (
            activePlans.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {activePlans.map((plan) => {
                  const active = activePlanId === plan.id;

                  return (
                    <button
                      key={plan.id}
                      type="button"
                      onClick={() =>
                        setSelectedPlans((prev) => ({
                          ...prev,
                          [monetizationType]: plan.id,
                        }))
                      }
                      className={`rounded-lg border p-3 text-left transition ${
                        active
                          ? "border-emerald-400 bg-emerald-50"
                          : "border-slate-200 bg-white hover:border-slate-300"
                      }`}
                    >
                      <p className="text-sm font-semibold text-slate-800">{plan.name}</p>
                      <p className="text-xs text-slate-500 mt-1">{plan.description || "No description provided."}</p>
                      <p className="text-sm font-bold text-emerald-700 mt-2">BDT {plan.amount}</p>
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                No plans available for this option right now.
              </p>
            )
          ) : null}
        </div>

        <button
          type="submit"
          disabled={busy || (monetizationType !== "none" && !activePlan)}
          className="w-full sm:w-auto bg-gradient-to-r from-sky-500 to-blue-700 text-white px-4 py-2 rounded-xl font-semibold hover:opacity-95 transition disabled:opacity-60"
        >
          {loading
            ? "Posting..."
            : paymentLoading
              ? "Redirecting to Payment..."
              : monetizationType === "none"
                ? "Post"
                : `Post + Pay ${activePlan ? `(BDT ${activePlan.amount})` : ""}`}
        </button>
      </form>
    </div>
  );
};

export default CreatePost;
