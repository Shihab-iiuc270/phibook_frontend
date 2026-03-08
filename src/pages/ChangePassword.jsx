import { useState } from "react";
import apiClient from "../services/api-client";

const ChangePassword = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const payloads = [
        { current_password: currentPassword, new_password: newPassword, re_new_password: confirmPassword },
        { current_password: currentPassword, new_password: newPassword },
      ];

      let ok = false;
      let lastErr = null;
      for (const payload of payloads) {
        try {
          await apiClient.post("/auth/users/set_password/", payload);
          ok = true;
          break;
        } catch (err) {
          lastErr = err;
        }
      }

      if (!ok) throw lastErr;
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setSuccess("Password changed successfully.");
    } catch (err) {
      const data = err?.response?.data || {};
      setError(
        data?.detail ||
          data?.current_password?.[0] ||
          data?.new_password?.[0] ||
          data?.non_field_errors?.[0] ||
          "Could not change password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[680px] mx-auto px-1 sm:px-0">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
        <h2 className="text-xl font-bold mb-4">Change Password</h2>
        <form onSubmit={onSubmit} className="space-y-3">
          {error ? <div className="bg-red-50 text-red-600 p-2 rounded border border-red-200 text-sm">{error}</div> : null}
          {success ? (
            <div className="bg-green-50 text-green-700 p-2 rounded border border-green-200 text-sm">{success}</div>
          ) : null}
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Current password"
            required
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:border-[#1877f2]"
          />
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
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
            className="bg-[#1877f2] text-white px-4 py-2 rounded-md font-semibold hover:bg-[#166fe5] disabled:opacity-60 w-full sm:w-auto"
          >
            {loading ? "Changing..." : "Change Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;
