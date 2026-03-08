import Navbar from './Navbar';
import { Outlet } from 'react-router';
import LeftSidebar from './LeftSidebar';
import RightSidebar from './RightSidebar';
import MobileNav from './MobileNav';

const MainLayout = () => {
  return (
    <div className="bg-[radial-gradient(circle_at_top_right,_#dbeafe,_#eff6ff_35%,_#f8fafc_70%)] min-h-screen pb-20 sm:pb-0">
      <Navbar />
      <div className="flex justify-center max-w-[1600px] mx-auto pt-3 sm:pt-4 gap-0 md:gap-4 xl:gap-8 px-2 sm:px-3">
        <LeftSidebar />
        <main className="w-full max-w-[680px] px-0 sm:px-1">
          <Outlet />
        </main>
        <RightSidebar />
      </div>
      <MobileNav />
    </div>
  );
};

export default MainLayout;
