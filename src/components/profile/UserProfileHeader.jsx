import { getDefaultAvatarUrl } from "../../services/media";
import VerifiedName from "../shared/VerifiedName";

const UserProfileHeader = ({ user, loading = false, postsCount = 0, primaryAction = null }) => {
  const name = user?.name || (loading ? "Loading..." : "User");
  const avatar = user?.avatar || getDefaultAvatarUrl();
  const email = user?.email || "";
  const location = user?.location || "";

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="h-36 sm:h-48 bg-gradient-to-r from-[#1877f2] via-sky-500 to-indigo-600" />
      <div className="px-4 sm:px-6 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div className="flex items-end gap-3 -mt-12">
            <img
              src={avatar}
              alt={`${name} avatar`}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover ring-4 ring-white border border-gray-200 bg-white"
              onError={(e) => {
                e.currentTarget.src = getDefaultAvatarUrl();
              }}
            />
            <div className="pb-1 min-w-0">
              <h2 className="text-xl sm:text-2xl font-bold break-words">
                <VerifiedName user={user} name={name} />
              </h2>
              {email ? <p className="text-sm text-gray-600 break-all">{email}</p> : null}
              {location ? <p className="text-sm text-gray-600 break-words">{location}</p> : null}
            </div>
          </div>

          <div className="flex items-center gap-2 sm:pb-1">
            {primaryAction ? (
              <button
                type="button"
                onClick={primaryAction.onClick}
                disabled={primaryAction.disabled}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
                  primaryAction.disabled
                    ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                    : primaryAction.variant === "secondary"
                      ? "bg-slate-100 text-slate-900 hover:bg-slate-200"
                      : "bg-[#1877f2] text-white hover:bg-[#166fe5]"
                }`}
              >
                {primaryAction.label}
              </button>
            ) : null}
            <span className="text-sm text-gray-600">
              <span className="font-semibold text-gray-900">{postsCount}</span> posts
            </span>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-gray-200 flex items-center gap-2 text-sm">
          <span className="font-semibold text-gray-900">Posts</span>
          {loading ? <span className="text-gray-500">Loading profile...</span> : null}
          {!loading && !user ? <span className="text-gray-500">Profile not available</span> : null}
        </div>
      </div>
    </div>
  );
};

export default UserProfileHeader;
