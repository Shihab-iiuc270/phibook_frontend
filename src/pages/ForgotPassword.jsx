import { useState } from "react";
import { Link } from "react-router";
import apiClient from "../services/api-client";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      await apiClient.post("/auth/users/reset_password/", { email });
      setSuccess("Reset link sent. Please check your email.");
    } catch (err) {
      const data = err?.response?.data || {};
      setError(data?.detail || data?.email?.[0] || "Could not send reset email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#f0f2f5] min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-[420px] bg-white p-5 rounded-lg shadow-xl border border-gray-100">
        <h1 className="text-2xl font-bold text-[#1877f2] mb-2">Forgot Password</h1>
        <p className="text-sm text-gray-600 mb-4">Enter your account email to get a reset link.</p>
        <form onSubmit={onSubmit} className="space-y-3">
          {error ? <div className="bg-red-50 text-red-600 p-2 rounded border border-red-200 text-sm">{error}</div> : null}
          {success ? (
            <div className="bg-green-50 text-green-700 p-2 rounded border border-green-200 text-sm">{success}</div>
          ) : null}
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
            required
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:border-[#1877f2]"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1877f2] text-white py-3 rounded-md font-semibold hover:bg-[#166fe5] disabled:opacity-60"
          >
            {loading ? "Sending..." : "Send Reset Link"}
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

export default ForgotPassword;
