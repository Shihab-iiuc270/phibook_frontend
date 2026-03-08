import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router";
import useAuthContext from "../hooks/useAuthContext";
import { getPosts } from "../services/postService";
import PostCard from "../components/feed/PostCard";
import { getDefaultAvatarUrl } from "../services/media";
import { hydrateOwnersForPosts } from "../services/userService";

const getPostOwner = (post) => post?.poster || post?.author || post?.user || {};

const Profile = () => {
  const routeLocation = useLocation();
  const { user, fetchMyProfile, updateProfile } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [myPosts, setMyPosts] = useState([]);
  const ownerCacheRef = useRef(new Map());
  const showPostsOnly = routeLocation.pathname === "/profile/posts";

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const me = await fetchMyProfile();
        setName(me?.name || "");
        setLocation(me?.location || "");
        setPhoneNumber(me?.phone_number || "");

        if (showPostsOnly) {
          setMyPosts([]);
          const allPosts = [];
          let page = 1;
          let hasNext = true;

          // Load paginated feed pages so profile can find the user's posts reliably.
          while (hasNext && page <= 50) {
            const payload = await getPosts(page);
            const items = Array.isArray(payload) ? payload : payload?.items || [];
            allPosts.push(...items);
            hasNext = Boolean(payload?.next);
            page += 1;
          }

          const mine = allPosts.filter((post) => {
            const poster = getPostOwner(post);
            return (
              (me?.id && poster?.id === me.id) ||
              (me?.id &&
                (post?.user_id === me.id || post?.author_id === me.id || post?.poster_id === me.id)) ||
              (me?.email && poster?.email === me.email) ||
              (me?.name && poster?.name === me.name)
            );
          });
          const hydrated = await hydrateOwnersForPosts(mine, ownerCacheRef.current);
          setMyPosts(hydrated);
        }
      } catch {
        // Keep showing locally cached profile if API fetch fails.
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [showPostsOnly]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setFieldErrors({});
    setSaving(true);
    try {
      const updated = await updateProfile({ name, location, phoneNumber, avatarFile });
      setName(updated?.name || "");
      setLocation(updated?.location || "");
      setPhoneNumber(updated?.phone_number || "");
      setAvatarFile(null);
    } catch (err) {
      const data = err?.response?.data || {};
      setFieldErrors({
        name: data?.name || [],
        location: data?.location || [],
        phoneNumber: data?.phone_number || [],
        avatar: data?.avatar || [],
      });
      setFormError(data?.detail || data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const err = (key) => fieldErrors?.[key]?.[0] || "";

  return (
    <div className="space-y-4 max-w-[680px] mx-auto px-1 sm:px-0">
      {showPostsOnly ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
          <h3 className="text-lg font-bold mb-3">My Posts</h3>
          {loading ? <p className="text-gray-500">Loading posts...</p> : null}
          {!loading && myPosts.length === 0 ? (
            <p className="text-gray-500">You have not posted yet.</p>
          ) : (
            <div className="space-y-2">
              {myPosts.map((post) => (
                <PostCard
                  key={post.id}
                  user={{
                    name:
                      post?.poster?.name ||
                      post?.author?.name ||
                      post?.user?.name ||
                      user?.name ||
                      "Unknown User",
                    avatar:
                      user?.avatar ||
                      post?.poster?.avatar ||
                      post?.author?.avatar ||
                      post?.user?.avatar ||
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
                  likesCount={post.likes_count ?? 0}
                  commentsCount={post.comments?.length || 0}
                  comments={post.comments || []}
                  isLiked={post.is_liked ?? false}
                  canInteract={false}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
          <h2 className="text-xl font-bold mb-4">Edit Profile</h2>
          {loading ? <p className="text-gray-500">Loading profile...</p> : null}

          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-4">
            <img
              src={user?.avatar || getDefaultAvatarUrl()}
              alt="Profile"
              className="w-16 h-16 rounded-full object-cover border border-gray-200"
              onError={(e) => {
                e.currentTarget.src = getDefaultAvatarUrl();
              }}
            />
            <div className="min-w-0">
              <p className="font-semibold break-words">{user?.name || "Not available"}</p>
              <p className="text-sm text-gray-600 break-all">{user?.email || "Not available"}</p>
            </div>
          </div>

          <form onSubmit={onSubmit} className="space-y-3">
            {formError ? (
              <div className="bg-red-50 text-red-600 p-2 rounded border border-red-200 text-sm">
                {formError}
              </div>
            ) : null}

            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Name"
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:border-[#1877f2]"
            />
            {err("name") ? <p className="text-red-600 text-xs">{err("name")}</p> : null}

            <input
              type="text"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="Phone number"
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:border-[#1877f2]"
            />
            {err("phoneNumber") ? <p className="text-red-600 text-xs">{err("phoneNumber")}</p> : null}

            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Location"
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:border-[#1877f2]"
            />
            {err("location") ? <p className="text-red-600 text-xs">{err("location")}</p> : null}

            <input
              type="file"
              accept="image/*"
              onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
              className="w-full text-sm"
            />
            {err("avatar") ? <p className="text-red-600 text-xs">{err("avatar")}</p> : null}

            <button
              type="submit"
              disabled={saving}
              className="bg-[#1877f2] text-white px-4 py-2 rounded-md font-semibold hover:bg-[#166fe5] disabled:opacity-60 w-full sm:w-auto"
            >
              {saving ? "Saving..." : "Save Profile"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Profile;
