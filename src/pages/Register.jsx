import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router";
import useAuthContext from "../hooks/useAuthContext";

const Register = () => {
  const navigate = useNavigate();
  const { registerUser } = useAuthContext();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [location, setLocation] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [redirecting, setRedirecting] = useState(false);
  const redirectTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (redirectTimerRef.current) {
        clearTimeout(redirectTimerRef.current);
      }
    };
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setFieldErrors({});

    if (password !== confirmPassword) {
      setFieldErrors({ confirmPassword: ["Passwords do not match"] });
      return;
    }

    setLoading(true);
    try {
      await registerUser({
        name,
        email,
        password,
        phoneNumber,
        location,
        avatarFile,
      });
      setSuccessMessage("Check your email for activation. After activating, please log in.");
      setRedirecting(true);
      redirectTimerRef.current = setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (err) {
      const data = err?.response?.data || {};
      const mappedErrors = {
        name: data?.name || [],
        email: data?.email || [],
        phoneNumber: data?.phone_number || [],
        location: data?.location || [],
        avatar: data?.avatar || [],
        password: data?.password || [],
      };
      setFieldErrors(mappedErrors);
      setFormError(data?.detail || data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const firstError = (key) => fieldErrors?.[key]?.[0] || "";

  return (
    <div className="bg-[#f0f2f5] min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-[420px]">
        <div className="bg-white p-5 rounded-lg shadow-xl border border-gray-100">
          <h1 className="text-3xl font-bold text-[#1877f2] mb-2">phibook</h1>
          <p className="text-sm text-gray-600 mb-4">Create your account</p>

          <form onSubmit={onSubmit} className="flex flex-col gap-3">
            {formError ? (
              <div className="bg-red-50 text-red-600 p-2 rounded border border-red-200 text-sm">
                {formError}
              </div>
            ) : null}
            {successMessage ? (
              <div className="bg-green-50 text-green-700 p-2 rounded border border-green-200 text-sm">
                {successMessage}
              </div>
            ) : null}

            <input
              type="text"
              placeholder="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="p-3 border border-gray-300 rounded-md focus:outline-none focus:border-[#1877f2]"
              required
            />
            {firstError("name") ? <p className="text-red-600 text-xs">{firstError("name")}</p> : null}
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="p-3 border border-gray-300 rounded-md focus:outline-none focus:border-[#1877f2]"
              required
            />
            {firstError("email") ? <p className="text-red-600 text-xs">{firstError("email")}</p> : null}
            <input
              type="text"
              placeholder="Phone number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="p-3 border border-gray-300 rounded-md focus:outline-none focus:border-[#1877f2]"
              required
            />
            {firstError("phoneNumber") ? (
              <p className="text-red-600 text-xs">{firstError("phoneNumber")}</p>
            ) : null}
            <input
              type="text"
              placeholder="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="p-3 border border-gray-300 rounded-md focus:outline-none focus:border-[#1877f2]"
              required
            />
            {firstError("location") ? (
              <p className="text-red-600 text-xs">{firstError("location")}</p>
            ) : null}
            <div>
              <label className="text-sm font-medium text-gray-700">Profile image (optional)</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
                className="block w-full mt-1 text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">
                If you skip this, a default profile image will be used.
              </p>
              {firstError("avatar") ? <p className="text-red-600 text-xs">{firstError("avatar")}</p> : null}
            </div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="p-3 border border-gray-300 rounded-md focus:outline-none focus:border-[#1877f2]"
              required
            />
            {firstError("password") ? (
              <p className="text-red-600 text-xs">{firstError("password")}</p>
            ) : null}
            <input
              type="password"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="p-3 border border-gray-300 rounded-md focus:outline-none focus:border-[#1877f2]"
              required
            />
            {firstError("confirmPassword") ? (
              <p className="text-red-600 text-xs">{firstError("confirmPassword")}</p>
            ) : null}

            <button
              type="submit"
              disabled={loading || redirecting}
              className="bg-[#00a400] text-white py-3 rounded-md font-semibold hover:bg-[#008a00] transition disabled:opacity-60"
            >
              {loading ? "Creating account..." : redirecting ? "Redirecting to login..." : "Register"}
            </button>
          </form>

          <p className="text-sm text-gray-600 mt-4 text-center">
            Already have an account?{" "}
            <Link className="text-[#1877f2] font-semibold hover:underline" to="/login">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
