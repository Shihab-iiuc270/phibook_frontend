import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import apiClient from "../services/api-client";

const ResetPasswordConfirm = () => {
  const navigate = useNavigate();
  const { uid, token } = useParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await apiClient.post("/auth/users/reset_password_confirm/", {
        uid,
        token,
        new_password: password,
        re_new_password: confirmPassword,
      });
      setSuccess("Password reset successful. Redirecting to login...");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      const data = err?.response?.data || {};
      setError(
        data?.detail ||
          data?.token?.[0] ||
          data?.uid?.[0] ||
          data?.new_password?.[0] ||
          "Password reset failed."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#f0f2f5] min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-[420px] bg-white p-5 rounded-lg shadow-xl border border-gray-100">
        <h1 className="text-2xl font-bold text-[#1877f2] mb-2">Set New Password</h1>
        <p className="text-sm text-gray-600 mb-4">Enter your new password.</p>
        <form onSubmit={onSubmit} className="space-y-3">
          {error ? <div className="bg-red-50 text-red-600 p-2 rounded border border-red-200 text-sm">{error}</div> : null}
          {success ? (
            <div className="bg-green-50 text-green-700 p-2 rounded border border-green-200 text-sm">{success}</div>
          ) : null}
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="New password"
            required
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:border-[#1877f2]"
          />
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
            required
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:border-[#1877f2]"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1877f2] text-white py-3 rounded-md font-semibold hover:bg-[#166fe5] disabled:opacity-60"
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
        <p className="text-sm text-gray-600 mt-4 text-center">
          Back to{" "}
          <Link to="/login" className="text-[#1877f2] font-semibold hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ResetPasswordConfirm;
