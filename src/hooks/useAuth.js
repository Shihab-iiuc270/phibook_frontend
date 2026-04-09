import { useState } from "react";
import apiClient from "../services/api-client";
import { ensureUserLocallyVerified } from "../services/localVerification";
import { getDefaultAvatarUrl, toAbsoluteMediaUrl } from "../services/media";

const tokenFromPayload = (tokens) =>
  tokens?.access ||
  tokens?.access_token ||
  tokens?.token ||
  tokens?.auth_token ||
  tokens?.jwt ||
  null;

const useAuth = () => {
  const getStoredUser = () => {
    const savedUser = localStorage.getItem("phi_user");
    return savedUser ? JSON.parse(savedUser) : null;
  };

  const getToken = () => {
    const token = localStorage.getItem("authTokens");
    return token ? JSON.parse(token) : null;
  };

  const [user, setUser] = useState(getStoredUser());
  const [authTokens, setAuthTokens] = useState(getToken());

  const persistAuth = (tokens, profile) => {
    const accessToken = tokenFromPayload(tokens);

    setAuthTokens(tokens || null);
    if (tokens) {
      localStorage.setItem("authTokens", JSON.stringify(tokens));
    } else {
      localStorage.removeItem("authTokens");
    }

    if (accessToken) {
      localStorage.setItem("phi_token", accessToken);
    } else {
      localStorage.removeItem("phi_token");
    }

    if (profile) {
      setUser(profile);
      localStorage.setItem("phi_user", JSON.stringify(profile));
    }
  };

  const fetchMyProfile = async () => {
    const response = await apiClient.get("/auth/users/me/");
    const me = response.data;
    const profile = {
      id: me?.id,
      name:
        me?.name ||
        [me?.first_name, me?.last_name].filter(Boolean).join(" ") ||
        me?.username ||
        me?.email ||
        "User",
      email: me?.email || "",
      avatar: toAbsoluteMediaUrl(me?.avatar) || getDefaultAvatarUrl(),
      location: me?.location || "",
      phone_number: me?.phone_number || "",
      raw: me,
    };

    setUser(profile);
    localStorage.setItem("phi_user", JSON.stringify(profile));

    const serverVerified =
      me?.is_verified ?? me?.isVerified ?? me?.verified ?? me?.blue_badge ?? me?.is_blue_badge ?? false;

    if (serverVerified) {
      ensureUserLocallyVerified(profile);
    }
    return profile;
  };

  const loginUser = async (email, password) => {
    const response = await apiClient.post("/auth/jwt/create/", {
      email,
      password,
    });

    const tokens = response.data;
    persistAuth(tokens, null);

    try {
      await fetchMyProfile();
    } catch {
      const fallbackProfile = { email, name: email, avatar: getDefaultAvatarUrl() };
      setUser(fallbackProfile);
      localStorage.setItem("phi_user", JSON.stringify(fallbackProfile));
    }
  };

  const registerUser = async ({
    name,
    email,
    password,
    confirmPassword,
    phoneNumber,
    location,
    avatarFile,
  }) => {
    const names = (name || "").trim().split(" ").filter(Boolean);
    const firstName = names[0] || "";
    const lastName = names.slice(1).join(" ");

    const payload = {
      email,
      password,
      first_name: firstName,
      last_name: lastName,
    };

    if (phoneNumber !== undefined && phoneNumber !== null && phoneNumber !== "") {
      payload.phone_number = phoneNumber;
    }
    if (location !== undefined && location !== null && location !== "") {
      payload.location = location;
    }

    const submitRegistration = (data) => apiClient.post("/auth/users/", data);

    if (avatarFile) {
      const form = new FormData();
      Object.entries(payload).forEach(([key, value]) => {
        form.append(key, value);
      });
      form.append("avatar", avatarFile);

      try {
        await submitRegistration(form);
        return;
      } catch (err) {
        const requiresPasswordRetype = Boolean(err?.response?.data?.re_password);
        const requiresUsername = Boolean(err?.response?.data?.username);
        if (!requiresPasswordRetype && !requiresUsername) {
          throw err;
        }

        if (requiresPasswordRetype && confirmPassword) {
          form.append("re_password", confirmPassword);
        }
        if (requiresUsername) {
          form.append("username", email);
        }
        await submitRegistration(form);
        return;
      }
    }

    try {
      await submitRegistration(payload);
    } catch (err) {
      const data = err?.response?.data || {};
      const nextPayload = { ...payload };
      let shouldRetry = false;

      if (data?.re_password && confirmPassword) {
        nextPayload.re_password = confirmPassword;
        shouldRetry = true;
      }
      if (data?.username) {
        nextPayload.username = email;
        shouldRetry = true;
      }

      if (!shouldRetry) {
        throw err;
      }

      await submitRegistration(nextPayload);
    }
  };

  const updateProfile = async ({ name, location, phoneNumber, avatarFile }) => {
    const form = new FormData();
    if (name !== undefined) {
      const names = String(name).trim().split(" ").filter(Boolean);
      form.append("first_name", names[0] || "");
      form.append("last_name", names.slice(1).join(" "));
    }
    if (location !== undefined) form.append("location", location);
    if (phoneNumber !== undefined) form.append("phone_number", phoneNumber);
    if (avatarFile) form.append("avatar", avatarFile);

    let response;
    try {
      // Let browser/axios set multipart boundary automatically.
      response = await apiClient.patch("/auth/users/me/", form);
    } catch (err) {
      // Some deployments accept avatar updates only via PUT.
      if (avatarFile) {
        response = await apiClient.put("/auth/users/me/", form);
      } else {
        throw err;
      }
    }

    const updatedRaw = response.data;
    const updatedProfile = {
      id: updatedRaw?.id ?? user?.id,
      name:
        updatedRaw?.name ||
        [updatedRaw?.first_name, updatedRaw?.last_name].filter(Boolean).join(" ") ||
        user?.name ||
        "User",
      email: updatedRaw?.email || user?.email || "",
      avatar: toAbsoluteMediaUrl(updatedRaw?.avatar) || user?.avatar || getDefaultAvatarUrl(),
      location: updatedRaw?.location || "",
      phone_number: updatedRaw?.phone_number || "",
      raw: updatedRaw,
    };

    setUser(updatedProfile);
    localStorage.setItem("phi_user", JSON.stringify(updatedProfile));
    return updatedProfile;
  };

  const logoutUser = () => {
    setUser(null);
    setAuthTokens(null);
    localStorage.removeItem("phi_user");
    localStorage.removeItem("phi_token");
    localStorage.removeItem("authTokens");
  };

  return {
    user,
    setUser,
    authTokens,
    loginUser,
    registerUser,
    updateProfile,
    logoutUser,
    fetchMyProfile,
  };
};

export default useAuth;
