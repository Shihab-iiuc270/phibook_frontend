import Navbar from './components/layout/Navbar';
import PostCard from './components/feed/PostCard';
import LeftSidebar from './components/layout/LeftSidebar';
import RightSidebar from './components/layout/RightSidebar';

const App = () => {
  return (
    <div className="bg-[#f0f2f5] min-h-screen">
      <Navbar />
      
      <div className="flex justify-center max-w-[1600px] mx-auto pt-4 gap-8">
        
        {/* LEFT SIDEBAR */}
          <LeftSidebar />

        {/* FEED SECTION */}
        <main className="w-full max-w-[680px] px-2">
          {/* Mock Post */}
          <PostCard 
            user={{ name: "Ashake Alahi", avatar: "https://i.pravatar.cc/100?u=fiona" }}
            time="5 hrs"
            content="This has some great healthy recipes!"
            image="https://picsum.photos/800/600?random=10"
          />
        </main>

        {/* RIGHT SIDEBAR */}
        <RightSidebar />
       
      </div>
    </div>
  );
};

export default App;