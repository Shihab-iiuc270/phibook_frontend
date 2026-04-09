import { X } from "lucide-react";
import { useNavigate } from "react-router";

const GuestAuthPromptModal = ({ open, onClose }) => {
  const navigate = useNavigate();

  if (!open) return null;

  const goTo = (path) => {
    onClose?.();
    navigate(path);
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <button
        aria-label="Close"
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        type="button"
      />

      <div className="relative w-full max-w-[420px] rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Log in to keep scrolling</h2>
            <p className="text-sm text-slate-600 mt-1">
              Join to like, comment, and create posts.
            </p>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="text-slate-500 hover:bg-slate-100 rounded-full p-2"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 space-y-3">
          <button
            type="button"
            onClick={() => goTo("/login")}
            className="w-full bg-[#1877f2] hover:bg-[#166fe5] text-white font-semibold py-2.5 rounded-xl transition"
          >
            Log In
          </button>
          <button
            type="button"
            onClick={() => goTo("/register")}
            className="w-full bg-[#00a400] hover:bg-[#008a00] text-white font-semibold py-2.5 rounded-xl transition"
          >
            Create New Account
          </button>
 
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 transition"
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  );
};

export default GuestAuthPromptModal;

