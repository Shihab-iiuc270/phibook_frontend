import apiClient from "./api-client";

export const DEFAULT_AVATAR_PATH = "avatars/default-avatar-profile-icon-of-social-media-user-vector.jpg";
export const FRONTEND_DEFAULT_AVATAR = "/default-avatar.svg";

const getApiOrigin = () => {
  const base = apiClient?.defaults?.baseURL || "";
  try {
    return new URL(base).origin;
  } catch {
    return "";
  }
};

export const toAbsoluteMediaUrl = (value) => {
  if (!value || typeof value !== "string") return null;
  if (value.includes("default-avatar-profile-icon-of-social-media-user-vector")) {
    return FRONTEND_DEFAULT_AVATAR;
  }
  if (value.startsWith("http://") || value.startsWith("https://")) return value;

  const origin = getApiOrigin();
  if (!origin) return value;

  if (value.startsWith("/media/")) return `${origin}${value}`;
  if (value.startsWith("/avatars/")) return `${origin}/media${value}`;
  if (value.startsWith("media/")) return `${origin}/${value}`;
  if (value.startsWith("avatars/")) return `${origin}/media/${value}`;
  if (value.startsWith("/")) return `${origin}${value}`;
  return `${origin}/${value}`;
};

export const getDefaultAvatarUrl = () => FRONTEND_DEFAULT_AVATAR;
