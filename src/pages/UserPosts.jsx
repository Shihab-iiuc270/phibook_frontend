import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import PostCard from "../components/feed/PostCard";
import UserProfileHeader from "../components/profile/UserProfileHeader";
import useAuthContext from "../hooks/useAuthContext";
import { sendFriendRequest } from "../services/friendService";
import { getPosts } from "../services/postService";
import { getDefaultAvatarUrl } from "../services/media";
import { getUserById, hydrateOwnersForPosts } from "../services/userService";

const getOwner = (post) => post?.poster || post?.author || post?.user || {};

const UserPosts = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: me } = useAuthContext();
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [friendSending, setFriendSending] = useState(false);
  const [friendSent, setFriendSent] = useState(false);
  const [friendError, setFriendError] = useState("");
  const ownerCacheRef = useRef(new Map());

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setProfileLoading(true);
      setPosts([]);
      setProfile(null);
      try {
        const rawId = String(userId || "").trim();
        const numericId = Number(rawId);
        const hasNumericId = rawId !== "" && Number.isFinite(numericId);

        const profileTask = (async () => {
          if (!rawId) return null;
          try {
            return await getUserById(rawId);
          } catch {
            return null;
          }
        })();

        const postsTask = (async () => {
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

          const filtered = all.filter((p) => {
            const owner = getOwner(p);
            const ownerId = owner?.id;
            return (
              (hasNumericId && ownerId === numericId) ||
              String(ownerId ?? "") === rawId ||
              (hasNumericId &&
                (p?.user_id === numericId || p?.author_id === numericId || p?.poster_id === numericId)) ||
              String(p?.user_id ?? "") === rawId ||
              String(p?.author_id ?? "") === rawId ||
              String(p?.poster_id ?? "") === rawId
            );
          });

          return hydrateOwnersForPosts(filtered, ownerCacheRef.current);
        })();

        const [profileResult, postsResult] = await Promise.allSettled([profileTask, postsTask]);
        if (profileResult.status === "fulfilled") setProfile(profileResult.value);
        if (postsResult.status === "fulfilled") setPosts(postsResult.value || []);
      } finally {
        setLoading(false);
        setProfileLoading(false);
      }
    };
    load();
  }, [userId]);

  const derivedProfile = profile || (posts?.[0] ? getOwner(posts[0]) : null);
  const targetUserId = derivedProfile?.id ?? userId ?? null;
  const isMe = Boolean(me?.id && targetUserId && String(me.id) === String(targetUserId));

  useEffect(() => {
    setFriendSending(false);
    setFriendSent(false);
    setFriendError("");
  }, [userId]);

  useEffect(() => {
    if (loading) return;
    const hash = typeof window !== "undefined" ? window.location.hash : "";
    if (!hash || !hash.startsWith("#post-")) return;
    const targetId = hash.slice(1);
    const el = document.getElementById(targetId);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [loading, posts]);

  const handleAddFriend = async () => {
    setFriendError("");
    if (!targetUserId) return;

    if (!me) {
      navigate("/login");
      return;
    }

    if (friendSending || friendSent) return;

    setFriendSending(true);
    try {
      await sendFriendRequest(targetUserId);
      setFriendSent(true);
    } catch (err) {
      setFriendError(
        err?.friendlyMessage ||
          err?.response?.data?.detail ||
          err?.response?.data?.message ||
          "Could not send friend request."
      );
    } finally {
      setFriendSending(false);
    }
  };

  return (
    <div className="space-y-3 max-w-[680px] mx-auto px-1 sm:px-0">
      <UserProfileHeader
        user={derivedProfile}
        loading={profileLoading}
        postsCount={posts.length}
        primaryAction={
          !isMe && targetUserId
            ? {
                label: friendSent ? "Request Sent" : friendSending ? "Sending..." : "Add Friend",
                onClick: handleAddFriend,
                disabled: profileLoading || friendSending || friendSent,
                variant: friendSent ? "secondary" : "primary",
              }
            : null
        }
      />
      {friendError ? (
        <div className="bg-red-50 text-red-600 p-3 rounded-xl border border-red-200 text-sm">
          {friendError}
        </div>
      ) : null}
      {loading ? <p className="text-gray-500 px-2">Loading posts...</p> : null}
      {!loading && posts.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-gray-500">No posts found for this user.</p>
        </div>
      ) : null}
      {posts.map((post) => (
        <PostCard
          key={post.id}
          postId={post.id}
          user={{
            id: post?.poster?.id ?? post?.author?.id ?? post?.user?.id ?? null,
            email: post?.poster?.email ?? post?.author?.email ?? post?.user?.email ?? null,
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
