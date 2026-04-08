import { XCircle } from "lucide-react";
import { Link, useLocation } from "react-router";

const PaymentFail = () => {
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const transactionId = params.get("tran_id") || params.get("transaction_id") || "N/A";
  const featureType = String(params.get("feature_type") || params.get("type") || "").toLowerCase();
  const isBlueBadge = featureType.includes("badge") || featureType.includes("verify");

  return (
    <section className="bg-white/95 border border-red-200 rounded-2xl shadow-[0_10px_30px_rgba(15,23,42,0.08)] p-4 sm:p-6">
      <div className="flex items-start gap-3">
        <XCircle className="text-red-600 mt-0.5 shrink-0" size={24} />
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-slate-900">Payment Failed</h1>
          <p className="text-sm text-slate-600 mt-1">
            The transaction could not be completed. Please try again.
          </p>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
        <p><span className="font-semibold">Transaction:</span> {transactionId}</p>
      </div>

      <div className="mt-5 flex flex-col sm:flex-row gap-2">
        {isBlueBadge ? (
          <Link
            to="/blue-badge"
            className="w-full sm:w-auto text-center bg-gradient-to-r from-sky-500 to-blue-700 text-white px-4 py-2 rounded-xl font-semibold hover:opacity-95 transition"
          >
            Retry Blue Badge
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

export default PaymentFail;
