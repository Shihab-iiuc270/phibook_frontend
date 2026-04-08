import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import PostCard from "../components/feed/PostCard";
import useAuthContext from "../hooks/useAuthContext";
import { getDefaultAvatarUrl } from "../services/media";
import { createPostComment, getPosts, togglePostLike } from "../services/postService";
import { hydrateOwnersForPosts } from "../services/userService";

const Likes = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const ownerCacheRef = useRef(new Map());

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const all = [];
        let page = 1;
        let hasNext = true;
        while (hasNext && page <= 50) {
          const payload = await getPosts(page);
          const items = Array.isArray(payload) ? payload : payload?.items || [];
          all.push(...items);
          hasNext = Boolean(payload?.next);
          page += 1;
        }
        const liked = all.filter((p) => Boolean(p?.is_liked));
        const hydrated = await hydrateOwnersForPosts(liked, ownerCacheRef.current);
        setPosts(hydrated);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (loading) return;
    const hash = typeof window !== "undefined" ? window.location.hash : "";
    if (!hash || !hash.startsWith("#post-")) return;
    const targetId = hash.slice(1);
    const el = document.getElementById(targetId);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [loading, posts]);

  const requireAuth = () => navigate("/login");

  const handleToggleLike = async (postId) => {
    if (!user) return requireAuth();
    const previous = posts;
    setPosts((prev) =>
      prev
        .map((post) => {
          if (post.id !== postId) return post;
          const wasLiked = !!post.is_liked;
          return {
            ...post,
            is_liked: !wasLiked,
            likes_count: Math.max(0, (post.likes_count || 0) + (wasLiked ? -1 : 1)),
          };
        })
        .filter((p) => p.id !== postId || p.is_liked)
    );

    try {
      const updated = await togglePostLike(postId);
      setPosts((prev) =>
        prev
          .map((post) =>
            post.id === postId
              ? {
                  ...post,
                  is_liked: updated?.is_liked ?? post.is_liked,
                  likes_count: updated?.likes_count ?? post.likes_count,
                }
              : post
          )
          .filter((p) => p.id !== postId || p.is_liked)
      );
    } catch {
      setPosts(previous);
    }
  };

  const handleComment = async (postId, content) => {
    if (!user) return requireAuth();
    try {
      const comment = await createPostComment(postId, content);
      const normalizedComment = {
        id: comment?.id ?? Date.now(),
        content: comment?.content || comment?.text || content,
        user: comment?.user || comment?.author || { name: user?.name || user?.email || "You" },
        created_at: comment?.created_at || new Date().toISOString(),
      };
      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId
            ? { ...post, comments: [...(post.comments || []), normalizedComment] }
            : post
        )
      );
    } catch {
      // keep silent like feed behavior
    }
  };

  return (
    <div className="flex flex-col w-full max-w-[680px] mx-auto pb-10 px-1 sm:px-2 space-y-3">
      <div className="bg-white/95 rounded-2xl border border-slate-200 shadow-[0_10px_30px_rgba(15,23,42,0.08)] p-4">
        <h2 className="text-lg font-bold text-slate-800">Posts You Liked</h2>
        <p className="text-sm text-slate-500">Quick access to your liked posts.</p>
      </div>

      {loading ? <p className="text-slate-500 px-2">Loading liked posts...</p> : null}
      {!loading && posts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 text-slate-500">
          You have not liked any posts yet.
        </div>
      ) : null}

      {posts.map((post) => (
        <PostCard
          key={post.id}
          postId={post.id}
          user={{
            name: post?.poster?.name || post?.author?.name || post?.user?.name || "Unknown User",
            avatar:
              post?.poster?.avatar || post?.author?.avatar || post?.user?.avatar || getDefaultAvatarUrl(),
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
      ))}
    </div>
  );
};

export default Likes;
