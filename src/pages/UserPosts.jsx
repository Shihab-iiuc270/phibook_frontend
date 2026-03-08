import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router";
import PostCard from "../components/feed/PostCard";
import { getPosts } from "../services/postService";
import { getDefaultAvatarUrl } from "../services/media";
import { hydrateOwnersForPosts } from "../services/userService";

const getOwner = (post) => post?.poster || post?.author || post?.user || {};

const UserPosts = () => {
  const { userId } = useParams();
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const ownerCacheRef = useRef(new Map());

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setPosts([]);
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

        const id = Number(userId);
        const filtered = all.filter((p) => {
          const owner = getOwner(p);
          return owner?.id === id || p?.user_id === id || p?.author_id === id || p?.poster_id === id;
        });
        const hydrated = await hydrateOwnersForPosts(filtered, ownerCacheRef.current);
        setPosts(hydrated);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [userId]);

  return (
    <div className="space-y-3 max-w-[680px] mx-auto px-1 sm:px-0">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
        <h2 className="text-xl font-bold">User Posts</h2>
      </div>
      {loading ? <p className="text-gray-500 px-2">Loading posts...</p> : null}
      {!loading && posts.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-gray-500">No posts found for this user.</p>
        </div>
      ) : null}
      {posts.map((post) => (
        <PostCard
          key={post.id}
          user={{
            name: post?.poster?.name || post?.author?.name || post?.user?.name || "User",
            avatar: post?.poster?.avatar || post?.author?.avatar || post?.user?.avatar || getDefaultAvatarUrl(),
          }}
          time={new Date(post.created_at).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
          content={post.caption}
          images={post.images || []}
          likesCount={post.likes_count ?? 0}
          commentsCount={post.comments?.length || 0}
          comments={post.comments || []}
          isLiked={post.is_liked ?? false}
          canInteract={false}
        />
      ))}
    </div>
  );
};

export default UserPosts;
