import { CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router";
import useAuthContext from "../hooks/useAuthContext";
import { activateLocalFeatureFromPending, consumePendingPaymentFeature } from "../services/paymentService";

const PaymentSuccess = () => {
  const { search } = useLocation();
  const { fetchMyProfile } = useAuthContext();
  const [syncing, setSyncing] = useState(true);
  const [localActivated, setLocalActivated] = useState(false);
  const params = new URLSearchParams(search);
  const transactionId = params.get("tran_id") || params.get("transaction_id") || "N/A";
  const amount = params.get("amount") || params.get("total_amount") || null;
  const featureType = String(params.get("feature_type") || params.get("type") || "").toLowerCase();
  const isBlueBadge = featureType.includes("badge") || featureType.includes("verify");
  const inferredIsBlueBadge = isBlueBadge || localActivated;

  useEffect(() => {
    let active = true;
    const sync = async () => {
      try {
        const pending = consumePendingPaymentFeature();
        if (pending) {
          try {
            const rawUser = localStorage.getItem("phi_user");
            const storedUser = rawUser ? JSON.parse(rawUser) : null;
            if (storedUser) {
              const activated = activateLocalFeatureFromPending(storedUser, pending);
              if (activated && active) setLocalActivated(true);
            }
          } catch {
            // ignore
          }
        }
        await fetchMyProfile?.();
      } catch {
        // ignore
      } finally {
        if (active) setSyncing(false);
      }
    };
    sync();
    return () => {
      active = false;
    };
  }, [fetchMyProfile]);

  return (
    <section className="bg-white/95 border border-emerald-200 rounded-2xl shadow-[0_10px_30px_rgba(15,23,42,0.08)] p-4 sm:p-6">
      <div className="flex items-start gap-3">
        <CheckCircle2 className="text-emerald-600 mt-0.5 shrink-0" size={24} />
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900">Payment Successful</h1>
            <p className="text-sm text-slate-600 mt-1">
              {inferredIsBlueBadge
                ? syncing
                  ? "Your Blue Badge purchase is complete. Syncing verification..."
                  : localActivated
                    ? "Your Blue Badge purchase is complete. Verification is active on your account."
                    : "Your Blue Badge purchase is complete. If the badge does not appear yet, refresh your profile."
                : "Your checkout is complete. Your purchase will be activated shortly."}
            </p>
          </div>
        </div>

      <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 space-y-1">
        <p><span className="font-semibold">Transaction:</span> {transactionId}</p>
        {amount ? <p><span className="font-semibold">Amount:</span> BDT {amount}</p> : null}
      </div>

      <div className="mt-5 flex flex-col sm:flex-row gap-2">
        {isBlueBadge ? (
          <Link
            to="/blue-badge"
            className="w-full sm:w-auto text-center bg-slate-100 hover:bg-slate-200 text-slate-900 px-4 py-2 rounded-xl font-semibold transition"
          >
            Back to Blue Badge
          </Link>
        ) : null}
        <Link
          to="/"
          className="w-full sm:w-auto text-center bg-gradient-to-r from-sky-500 to-blue-700 text-white px-4 py-2 rounded-xl font-semibold hover:opacity-95 transition"
        >
          Back to Feed
        </Link>
      </div>
    </section>
  );
};

export default PaymentSuccess;
