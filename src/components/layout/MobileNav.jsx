import { Link, useLocation } from "react-router";
import { Home, KeyRound, LogIn, SquarePen, UserSquare2 } from "lucide-react";
import useAuthContext from "../../hooks/useAuthContext";

const Item = ({ to, label, icon, active }) => (
  <Link
    to={to}
    className={`flex flex-col items-center justify-center gap-1 text-[11px] font-medium px-2 py-1 rounded-md transition ${
      active ? "text-[#1877f2]" : "text-gray-500"
    }`}
  >
    {icon}
    <span>{label}</span>
  </Link>
);

const MobileNav = () => {
  const { user } = useAuthContext();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur border-t border-gray-200 h-16 px-2 sm:hidden">
      <div className="h-full max-w-[680px] mx-auto flex items-center justify-around">
        <Item to="/" label="Home" icon={<Home size={19} />} active={isActive("/")} />
        {user ? (
          <>
            <Item
              to="/profile/posts"
              label="My Posts"
              icon={<UserSquare2 size={19} />}
              active={isActive("/profile/posts")}
            />
            <Item
              to="/profile/edit"
              label="Edit"
              icon={<SquarePen size={19} />}
              active={isActive("/profile/edit")}
            />
            <Item
              to="/profile/change-password"
              label="Password"
              icon={<KeyRound size={19} />}
              active={isActive("/profile/change-password")}
            />
          </>
        ) : (
          <Item to="/login" label="Login" icon={<LogIn size={19} />} active={isActive("/login")} />
        )}
      </div>
    </nav>
  );
};

export default MobileNav;
