import { useState } from 'react';
import { Link } from 'react-router';
import { useNavigate } from 'react-router';
import useAuthContext from '../hooks/useAuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { loginUser } = useAuthContext();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    setLoading(true);

    try {
      await loginUser(email, password);
      navigate('/');
    } catch (err) {
      const data = err?.response?.data || {};
      setFieldErrors({
        email: data?.email || [],
        password: data?.password || [],
      });
      const rawMessage = String(data?.detail || data?.message || "").toLowerCase();
      const message = rawMessage.includes("no active account")
        ? "Wrong email or password."
        : data?.detail || data?.message || "Wrong email or password.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#f0f2f5] min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-[400px]">
        <div className="bg-white p-5 rounded-lg shadow-xl border border-gray-100">
          <h1 className="text-3xl font-bold text-[#1877f2] mb-2">phibook</h1>
          <p className="text-sm text-gray-600 mb-4">Log in to continue</p>

          <form onSubmit={onSubmit} className="flex flex-col gap-3">
            {error ? (
              <div className="bg-red-50 text-red-600 p-2 rounded border border-red-200 text-sm">
                {error}
              </div>
            ) : null}

            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="p-3 border border-gray-300 rounded-md focus:outline-none focus:border-[#1877f2]"
              required
            />
            {fieldErrors?.email?.[0] ? (
              <p className="text-red-600 text-xs">{fieldErrors.email[0]}</p>
            ) : null}

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="p-3 border border-gray-300 rounded-md focus:outline-none focus:border-[#1877f2]"
              required
            />
            {fieldErrors?.password?.[0] ? (
              <p className="text-red-600 text-xs">{fieldErrors.password[0]}</p>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="bg-[#1877f2] text-white py-3 rounded-md font-semibold hover:bg-[#166fe5] transition disabled:opacity-60"
            >
              {loading ? 'Logging in...' : 'Log In'}
            </button>
            <Link
              to="/forgot-password"
              className="text-sm text-center text-[#1877f2] font-semibold hover:underline"
            >
              Forgot password?
            </Link>
          </form>

          <p className="text-sm text-gray-600 mt-4 text-center">
            Don&apos;t have an account?{' '}
            <Link className="text-[#1877f2] font-semibold hover:underline" to="/register">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
