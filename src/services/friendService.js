import apiClient from "./api-client";

const normalizePath = (value) => {
  const raw = String(value || "").trim();
  if (!raw) return null;
  const withLeading = raw.startsWith("/") ? raw : `/${raw}`;
  return withLeading.endsWith("/") ? withLeading : `${withLeading}/`;
};

const friendRequestPath =
  normalizePath(import.meta.env.VITE_FRIEND_REQUESTS_PATH) || "/friends/requests/";

const messageFromError = (err) => {
  const data = err?.response?.data || {};
  return (
    data?.detail ||
    data?.message ||
    (Array.isArray(data?.non_field_errors) ? data.non_field_errors[0] : null) ||
    "Could not send friend request."
  );
};

export const sendFriendRequest = async (toUserId) => {
  const id = String(toUserId ?? "").trim();
  if (!id) throw new Error("Missing user id");

  const payloads = [
    { receiver: id },
    { receiver_id: id },
    { to_user: id },
    { to_user_id: id },
    { user: id },
    { user_id: id },
    { friend: id },
    { friend_id: id },
  ];

  let lastError = null;
  for (const payload of payloads) {
    try {
      const res = await apiClient.post(friendRequestPath, payload);
      return res?.data;
    } catch (err) {
      lastError = err;
      const status = err?.response?.status;
      if (status === 400 || status === 404 || status === 405) {
        continue;
      }
      throw Object.assign(err, { friendlyMessage: messageFromError(err) });
    }
  }

  const error = lastError || new Error("Could not send friend request.");
  throw Object.assign(error, { friendlyMessage: messageFromError(error) });
};

