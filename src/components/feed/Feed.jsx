import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import PostCard from "./PostCard";
import CreatePost from "./CreatePost";
import useAuthContext from "../../hooks/useAuthContext";
import {
  createPost,
  createPostComment,
  getPosts,
  togglePostLike,
} from "../../services/postService";
import { getDefaultAvatarUrl } from "../../services/media";
import { hydrateOwnersForPosts } from "../../services/userService";

const Feed = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [posting, setPosting] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  const ownerCacheRef = useRef(new Map());

  useEffect(() => {
    fetchPosts(page);
  }, [page]);

  useEffect(() => {
    if (loading) return;
    const hash = typeof window !== "undefined" ? window.location.hash : "";
    if (!hash || !hash.startsWith("#post-")) return;
    const targetId = hash.slice(1);
    const el = document.getElementById(targetId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [loading, posts]);

  const fetchPosts = async (targetPage = 1) => {
    try {
      setLoading(true);
      const payload = await getPosts(targetPage);
      const list = Array.isArray(payload) ? payload : payload?.items || [];
      let hydrated = list;
      try {
        hydrated = await hydrateOwnersForPosts(list, ownerCacheRef.current);
      } catch (ownerError) {
        console.warn("Falling back to post owner data without profile hydration.", ownerError);
      }
      setPosts(hydrated);
      setTotalPages(Math.max(1, Number(payload?.totalPages) || 1));
      setHasNext(Boolean(payload?.next));
      setHasPrevious(Boolean(payload?.previous));
      setError(null);
    } catch (err) {
      console.error("Error fetching posts:", err);
      setError("Could not load posts. Make sure your backend server is running.");
    } finally {
      setLoading(false);
    }
  };

  const requireAuth = () => {
    navigate("/login");
  };

  const handleCreatePost = async ({ caption, images }) => {
    if (!user) {
      requireAuth();
      return;
    }

    try {
      setPosting(true);
      const created = await createPost({ caption, images });
      if (page === 1) {
        setPosts((prev) => [created, ...prev]);
      } else {
        setPage(1);
      }
      return created;
    } catch (err) {
      const message =
        err?.response?.data?.detail || err?.response?.data?.message || "Could not create post.";
      alert(message);
      throw err;
    } finally {
      setPosting(false);
    }
  };

  const handleToggleLike = async (postId) => {
    if (!user) {
      requireAuth();
      return;
    }

    const previous = posts;
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id !== postId) return post;
        const wasLiked = !!post.is_liked;
        return {
          ...post,
          is_liked: !wasLiked,
          likes_count: Math.max(0, (post.likes_count || 0) + (wasLiked ? -1 : 1)),
        };
      })
    );

    try {
      const updated = await togglePostLike(postId);
      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId
            ? {
                ...post,
                is_liked: updated?.is_liked ?? post.is_liked,
                likes_count: updated?.likes_count ?? post.likes_count,
              }
            : post
        )
      );
    } catch (err) {
      console.error(err);
      setPosts(previous);
    }
  };

  const handleComment = async (postId, content) => {
    if (!user) {
      requireAuth();
      return;
    }

    try {
      const comment = await createPostComment(postId, content);
      const normalizedComment = {
        id: comment?.id ?? Date.now(),
        content: comment?.content || comment?.text || content,
        user:
          comment?.user ||
          comment?.author || {
            id: user?.id ?? null,
            email: user?.email ?? null,
            name: user?.name || user?.email || "You",
            avatar: user?.avatar ?? null,
          },
        created_at: comment?.created_at || new Date().toISOString(),
      };

      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId
            ? { ...post, comments: [...(post.comments || []), normalizedComment] }
            : post
        )
      );
    } catch (err) {
      const message =
        err?.response?.data?.detail || err?.response?.data?.message || "Could not add comment.";
      alert(message);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-10">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1877f2]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200 text-center mx-auto max-w-[680px]">
        {error}
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full max-w-[680px] mx-auto pb-10 px-1 sm:px-2 space-y-3">
      <div className="bg-gradient-to-r from-sky-600 via-blue-700 to-indigo-700 text-white rounded-2xl px-4 py-4 shadow-[0_10px_30px_rgba(30,64,175,0.35)]">
        <p className="text-xs uppercase tracking-widest text-sky-100">Phibook</p>
        <h2 className="text-xl font-bold leading-tight">Your News Feed</h2>
        <p className="text-sm text-sky-100">Discover updates, photos, and conversations.</p>
      </div>
      {user ? <CreatePost onSubmit={handleCreatePost} loading={posting} /> : null}

      {posts && posts.length > 0 ? (
        posts.map((post) => (
          (() => {
            const owner = post?.poster || post?.author || post?.user || null;
            const postOwnerId = owner?.id || null;
            const isMyPost = Boolean(user?.id && postOwnerId && Number(postOwnerId) === Number(user.id));
            return (
          <PostCard
            key={post.id}
            postId={post.id}
            user={{
              id: (isMyPost ? user?.id : null) ?? owner?.id ?? null,
              email: (isMyPost ? user?.email : null) ?? owner?.email ?? null,
              name:
                owner?.name ||
                (isMyPost ? user?.name : null) ||
                "Unknown User",
              avatar:
                (isMyPost ? user?.avatar : null) ||
                owner?.avatar ||
                getDefaultAvatarUrl(),
            }}
            time={new Date(post.created_at).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
            content={post.caption}
            images={post.images || []}
            likesCount={post.likes_count}
            commentsCount={post.comments?.length || 0}
            comments={post.comments || []}
            isLiked={post.is_liked}
            canInteract={!!user}
            onLike={() => handleToggleLike(post.id)}
            onComment={(text) => handleComment(post.id, text)}
            onRequireAuth={requireAuth}
          />
            );
          })()
        ))
      ) : (
        <div className="bg-white/95 p-10 rounded-2xl text-center shadow-[0_10px_30px_rgba(15,23,42,0.08)] border border-slate-200">
          <p className="text-slate-500 font-medium">No posts found in the feed.</p>
        </div>
      )}

      <div className="flex items-center justify-between px-1 sm:px-2 gap-2">
        <button
          className="px-3 py-1.5 text-xs sm:text-sm rounded-xl border border-slate-300 bg-white/90 disabled:opacity-40"
          disabled={loading || (!hasPrevious && page <= 1)}
          onClick={() => setPage((prev) => Math.max(1, prev - 1))}
        >
          Previous
        </button>
        <p className="text-xs sm:text-sm text-slate-600 text-center">
          Page {page} of {totalPages}
        </p>
        <button
          className="px-3 py-1.5 text-xs sm:text-sm rounded-xl border border-slate-300 bg-white/90 disabled:opacity-40"
          disabled={loading || page >= totalPages || !hasNext}
          onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Feed;
