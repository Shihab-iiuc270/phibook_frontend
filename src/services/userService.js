import apiClient from "./api-client";
import { getDefaultAvatarUrl, toAbsoluteMediaUrl } from "./media";

const normalizeUser = (u = {}) => ({
  ...u,
  name:
    u?.name ||
    [u?.first_name, u?.last_name].filter(Boolean).join(" ") ||
    u?.username ||
    u?.email ||
    "User",
  avatar: toAbsoluteMediaUrl(u?.avatar) || getDefaultAvatarUrl(),
});

export const searchUsers = async (name) => {
  const q = String(name || "").trim();
  if (!q) return [];
  const response = await apiClient.get("/users/search/", { params: { name: q } });
  const data = response?.data;
  const list = Array.isArray(data)
    ? data
    : Array.isArray(data?.results)
      ? data.results
      : [];
  return list.map(normalizeUser);
};

export const getUserById = async (id) => {
  if (!id) return null;
  const response = await apiClient.get(`/auth/users/${id}/`);
  return normalizeUser(response?.data || {});
};

export const resolveUserFromOwner = async (owner = {}) => {
  const ownerId = owner?.id;
  const ownerName = String(owner?.name || "").trim();

  if (ownerId) {
    try {
      return await getUserById(ownerId);
    } catch {
      // fallback below
    }
  }

  if (ownerName) {
    try {
      const nameQueries = [
        ownerName,
        ...ownerName
          .split(" ")
          .map((t) => t.trim())
          .filter(Boolean),
      ];
      const dedup = [...new Set(nameQueries)];
      const batches = await Promise.allSettled(dedup.map((q) => searchUsers(q)));
      const candidates = batches
        .filter((b) => b.status === "fulfilled")
        .flatMap((b) => b.value || []);

      if (ownerId) {
        const byId = candidates.find((u) => Number(u?.id) === Number(ownerId));
        if (byId) return byId;
      }
      const normalizedOwner = ownerName.toLowerCase();
      const byExactName = candidates.find(
        (u) => String(u?.name || "").toLowerCase() === normalizedOwner
      );
      if (byExactName) return byExactName;

      const byStartsWith = candidates.find((u) =>
        normalizedOwner.startsWith(String(u?.name || "").toLowerCase())
      );
      return byStartsWith || candidates[0] || null;
    } catch {
      return null;
    }
  }

  return null;
};

export const hydrateOwnersForPosts = async (list = [], cacheMap = new Map()) => {
  const ownersToFetch = [
    ...new Map(
      list
        .map((post) => post?.poster || post?.author || post?.user || null)
        .filter(Boolean)
        .map((owner) => [String(owner?.id || owner?.name || Math.random()), owner])
    ).values(),
  ].filter((owner) => {
    const key = String(owner?.id || owner?.name || "");
    return key && !cacheMap.has(key);
  });

  if (ownersToFetch.length > 0) {
    const results = await Promise.allSettled(ownersToFetch.map((owner) => resolveUserFromOwner(owner)));
    results.forEach((res, idx) => {
      const original = ownersToFetch[idx];
      const key = String(original?.id || original?.name || "");
      if (!key) return;
      if (res.status === "fulfilled" && res.value) {
        cacheMap.set(key, res.value);
        if (res.value?.id) {
          cacheMap.set(String(res.value.id), res.value);
        }
      } else {
        cacheMap.set(key, null);
      }
    });
  }

  return list.map((post) => {
    const ownerId = post?.poster?.id || post?.author?.id || post?.user?.id;
    const ownerName = post?.poster?.name || post?.author?.name || post?.user?.name;
    const cached = cacheMap.get(String(ownerId)) || cacheMap.get(String(ownerName));
    if (!cached) return post;
    const mergedOwner = {
      ...(post?.poster || post?.author || post?.user || {}),
      ...cached,
    };
    return {
      ...post,
      poster: mergedOwner,
      author: mergedOwner,
      user: mergedOwner,
    };
  });
};
