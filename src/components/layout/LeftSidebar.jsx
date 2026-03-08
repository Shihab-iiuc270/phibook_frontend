import { Heart, Settings, SquarePen } from "lucide-react";
import { Link } from "react-router";
import SidebarItem from "../shared/SidebarItem";
import useAuthContext from "../../hooks/useAuthContext";
import { getDefaultAvatarUrl } from "../../services/media";

const LeftSidebar = () => {
    const { user } = useAuthContext();

    return (
        <div>
             <aside className="hidden xl:block w-80 sticky top-20 self-start max-h-screen overflow-y-auto bg-white/85 backdrop-blur rounded-2xl border border-slate-200 shadow-[0_10px_30px_rgba(15,23,42,0.08)] py-2">
                      <Link to="/profile/posts">
                        <SidebarItem
                          img={user?.avatar || getDefaultAvatarUrl()}
                          label={user?.name || user?.email || "Guest User"}
                          isBold
                        />
                      </Link>
                      <Link to="/profile/edit">
                        <SidebarItem icon={<SquarePen className="text-blue-500" />} label="Edit Profile" />
                      </Link>
                      <Link to="/likes">
                        <SidebarItem icon={<Heart className="text-red-400" />} label="Likes" />
                      </Link>
                      <Link to="/profile/change-password">
                        <SidebarItem icon={<Settings className="text-gray-700" />} label="Change Password" />
                      </Link>
                      <div className="h-[1px] bg-slate-200 my-4 mx-4"></div>
                      {/* <SidebarItem icon={<LayoutGrid className="text-blue-600" />} label="Memories" />
                      <h3 className="px-4 font-semibold text-gray-500 mb-2">Your Shortcuts</h3>
                      <SidebarItem img="https://picsum.photos/50/50?random=1" label="Undiscovered Eats" /> */}
                    </aside>
        </div>
    );
};

export default LeftSidebar;
