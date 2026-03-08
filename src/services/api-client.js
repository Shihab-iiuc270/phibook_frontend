import axios from "axios";

const apiClient = axios.create({
  baseURL: "https://phibook-1cwh.vercel.app/api/v1",
});

const getAuthToken = () => {
  const direct = localStorage.getItem("phi_token");
  if (direct) {
    return String(direct).replace(/^"|"$/g, "");
  }

  const rawTokens = localStorage.getItem("authTokens");
  if (!rawTokens) return null;

  try {
    const parsed = JSON.parse(rawTokens);
    return (
      parsed?.access ||
      parsed?.access_token ||
      parsed?.token ||
      parsed?.auth_token ||
      null
    );
  } catch {
    return null;
  }
};

apiClient.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) config.headers.Authorization = `JWT ${token}`;
  return config;
});

export default apiClient;
