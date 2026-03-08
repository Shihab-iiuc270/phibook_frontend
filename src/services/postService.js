import apiClient from "./api-client";
import { getDefaultAvatarUrl, toAbsoluteMediaUrl } from "./media";

const normalizeActor = (actor = {}) => {
  if (!actor || typeof actor !== "object") return null;
  return {
    ...actor,
    name:
      actor?.name ||
      actor?.full_name ||
      [actor?.first_name, actor?.last_name].filter(Boolean).join(" ") ||
      actor?.username ||
      actor?.email ||
      "Unknown User",
    avatar:
      toAbsoluteMediaUrl(actor?.avatar || actor?.profile_image || actor?.photo || null) ||
      getDefaultAvatarUrl(),
  };
};

const normalizePost = (post = {}) => {
  const owner =
    normalizeActor(post?.poster) ||
    normalizeActor(post?.author) ||
    normalizeActor(post?.user) ||
    null;

  return {
    ...post,
    poster: owner,
    author: owner,
    user: owner,
    likes_count: post?.likes_count ?? post?.likesCount ?? 0,
    is_liked: post?.is_liked ?? post?.isLiked ?? false,
    comments: Array.isArray(post?.comments) ? post.comments : [],
  };
};

export const getPosts = async (page = 1) => {
  const response = await apiClient.get("/posts/", { params: { page } });
  const data = response.data;

  if (Array.isArray(data)) {
    return {
      items: data.map(normalizePost),
      count: data.length,
      next: null,
      previous: null,
      page: 1,
      totalPages: 1,
    };
  }

  const items = Array.isArray(data?.results)
    ? data.results
    : Array.isArray(data?.items)
      ? data.items
      : Array.isArray(data?.data)
        ? data.data
        : [];

  const pageSize = Number(data?.page_size) || (items.length > 0 ? items.length : 1);
  const count = Number(data?.count ?? items.length);
  const totalPages = Math.max(1, Math.ceil(count / pageSize));

  return {
    items: items.map(normalizePost),
    count,
    next: data?.next ?? null,
    previous: data?.previous ?? null,
    page: Number(data?.page ?? page) || page,
    totalPages,
  };
};

export const createPost = async ({ caption, images = [] }) => {
  const postResponse = await apiClient.post("/posts/", { caption });
  const createdPost = postResponse.data;

  if (images.length > 0 && createdPost?.id) {
    for (const file of images) {
      const form = new FormData();
      form.append("image", file);
      await apiClient.post(`/posts/${createdPost.id}/images/`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    }
  }

  const refreshResponse = await apiClient.get(`/posts/${createdPost.id}/`);
  return normalizePost(refreshResponse.data);
};

export const togglePostLike = async (postId) => {
  const candidates = [
    `/posts/${postId}/toggle_like/`,
    `/posts/${postId}/toggle-like/`,
    `/posts/${postId}/like/`,
  ];

  let lastError = null;
  for (const url of candidates) {
    try {
      const response = await apiClient.post(url, {});
      return response.data;
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError;
};

export const createPostComment = async (postId, content) => {
  const candidates = [
    { content },
    { text: content },
    { comment: content },
    { body: content },
  ];

  let lastError = null;
  for (const payload of candidates) {
    try {
      const response = await apiClient.post(`/posts/${postId}/comments/`, payload);
      return response.data;
    } catch (err) {
      if (err?.response?.status === 400) {
        lastError = err;
        continue;
      }
      throw err;
    }
  }

  throw lastError;
};
