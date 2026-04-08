import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { Search, Home, Users, Plus, BadgeCheck } from "lucide-react";
import useAuthContext from "../../hooks/useAuthContext";
import { searchUsers } from "../../services/userService";
import { getDefaultAvatarUrl } from "../../services/media";

const SearchDropdown = ({ open, loading, users, onPick }) => {
  if (!open) return null;
  return (
    <div className="absolute left-0 right-0 top-[calc(100%+6px)] bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-80 overflow-y-auto">
      {loading ? <p className="px-3 py-2 text-sm text-gray-500">Searching...</p> : null}
      {!loading && users.length === 0 ? (
        <p className="px-3 py-2 text-sm text-gray-500">No users found.</p>
      ) : null}
      {!loading
        ? users.map((item) => (
            <button
              key={item.id}
              onClick={() => onPick(item)}
              className="w-full text-left px-3 py-2 hover:bg-gray-50 flex items-center gap-3"
            >
              <img
                src={item.avatar}
                alt={item.name}
                className="w-8 h-8 rounded-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = getDefaultAvatarUrl();
                }}
              />

              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{item.name}</p>
                <p className="text-xs text-gray-500 truncate">{item.email}</p>
              </div>
            </button>
          ))
        : null}
    </div>
  );
};

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logoutUser } = useAuthContext();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [openSearch, setOpenSearch] = useState(false);
  const desktopSearchRef = useRef(null);
  const mobileSearchRef = useRef(null);

  const onLogout = () => {
    logoutUser();
    navigate("/login");
  };

  useEffect(() => {
    const term = query.trim();
    if (!term) {
      setResults([]);
      setOpenSearch(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setSearchLoading(true);
        const users = await searchUsers(term);
        setResults(users);
        setOpenSearch(true);
      } catch {
        setResults([]);
        setOpenSearch(true);
      } finally {
        setSearchLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const onClickOutside = (e) => {
      const outsideDesktop = desktopSearchRef.current
        ? !desktopSearchRef.current.contains(e.target)
        : true;
      const outsideMobile = mobileSearchRef.current
        ? !mobileSearchRef.current.contains(e.target)
        : true;
      if (outsideDesktop && outsideMobile) {
        setOpenSearch(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const onPickUser = (picked) => {
    setOpenSearch(false);
    setQuery("");
    navigate(`/users/${picked.id}/posts`);
  };

  const navUserLabel =
    user?.first_name ||
    user?.raw?.first_name ||
    user?.last_name ||
    user?.raw?.last_name ||
    user?.email ||
    "Profile";

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-200 px-2 sm:px-4 py-2 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
      <div className="flex items-center justify-between gap-2 sm:gap-3">
        <div className="flex items-center space-x-2 min-w-0 flex-1">
          <Link
            to="/"
            className="bg-gradient-to-br from-sky-500 to-blue-700 text-white w-9 h-9 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center font-bold text-xl sm:text-2xl shrink-0 shadow-md"
          >
            Pb
          </Link>
          <div
            ref={desktopSearchRef}
            className="hidden md:flex relative items-center bg-slate-100 rounded-2xl px-3 py-2 flex-1 max-w-md border border-slate-200 focus-within:border-sky-300"
          >
            <Search size={18} className="text-slate-500 mr-2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => query.trim() && setOpenSearch(true)}
              placeholder="Search user by name/email..."
              className="bg-transparent outline-none text-sm w-full text-slate-700 placeholder:text-slate-500"
            />
            <SearchDropdown open={openSearch} loading={searchLoading} users={results} onPick={onPickUser} />
          </div>
        </div>

        <div className="hidden lg:flex items-center justify-center gap-2 flex-1 h-full">
          <NavIcon
            to="/"
            icon={<Home />}
            active={location.pathname === "/"}
          />
          <NavIcon
            to={user ? "/profile/posts" : "/login"}
            icon={<Users />}
            active={location.pathname === "/profile/posts" || location.pathname.startsWith("/users/")}
          />
          <NavIcon
            to={user ? "/blue-badge" : "/login"}
            icon={<BadgeCheck />}
            active={location.pathname === "/blue-badge"}
          />
        </div>

        <div className="flex items-center justify-end space-x-1 sm:space-x-2 flex-1 min-w-0">
          {user ? (
            <div className="bg-slate-100 p-2 rounded-xl hover:bg-slate-200 cursor-pointer transition-colors">
              <Plus size={20} />
            </div>
          ) : null}
          {user ? (
            <>
              <Link
                to="/profile/posts"
                className="text-sm font-semibold text-slate-700 hover:text-[#1877f2] max-w-[90px] sm:max-w-[160px] truncate"
              >
                {navUserLabel}
              </Link>
              <button
                onClick={onLogout}
                className="text-xs sm:text-sm bg-slate-100 hover:bg-slate-200 px-2 sm:px-3 py-2 rounded-xl font-semibold transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm bg-[#1877f2] text-white hover:bg-[#166fe5] px-3 py-2 rounded-xl font-semibold transition-colors"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="text-sm bg-[#00a400] text-white hover:bg-[#008a00] px-3 py-2 rounded-xl font-semibold transition-colors"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
      <div className="md:hidden mt-2 relative" ref={mobileSearchRef}>
        <div className="flex items-center bg-slate-100 rounded-2xl px-3 py-2 border border-slate-200 focus-within:border-sky-300">
          <Search size={18} className="text-slate-500 mr-2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => query.trim() && setOpenSearch(true)}
            placeholder="Search user by name/email..."
            className="bg-transparent outline-none text-sm w-full text-slate-700 placeholder:text-slate-500"
          />
        </div>
        <SearchDropdown open={openSearch} loading={searchLoading} users={results} onPick={onPickUser} />
      </div>
    </nav>
  );
};

const NavIcon = ({ icon, active, to }) => (
  <Link
    to={to}
    className={`px-10 py-2 cursor-pointer transition-all ${
      active
        ? "border-b-4 border-[#1877f2] text-[#1877f2] bg-sky-50 rounded-t-xl"
        : "text-slate-500 hover:bg-slate-100 rounded-xl"
    }`}
  >
    {React.cloneElement(icon, { size: 26 })}
  </Link>
);

export default Navbar;
