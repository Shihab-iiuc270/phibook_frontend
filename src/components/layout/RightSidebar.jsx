import SidebarItem from '../shared/SidebarItem';

const RightSidebar = () => {
    return (
        
            <aside className="hidden lg:block w-80 sticky top-20 self-start space-y-4">
           <div className="bg-white/85 backdrop-blur p-4 rounded-2xl shadow-[0_10px_30px_rgba(15,23,42,0.08)] border border-slate-200">
             <h3 className="font-semibold text-slate-600 mb-2">Sponsored</h3>
             <img src="https://picsum.photos/300/150" className="rounded-xl mb-2" alt="ad" />
             <p className="text-sm font-semibold text-slate-800">Lebo's Pizza</p>
             <p className="text-xs text-slate-500">Palo Alo's finest slices.</p>
           </div>
           {/* <div className="bg-white/85 backdrop-blur p-4 rounded-2xl shadow-[0_10px_30px_rgba(15,23,42,0.08)] border border-slate-200">
              <h3 className="font-semibold text-slate-600 mb-3">Contacts</h3>
              <SidebarItem img="https://i.pravatar.cc/100?u=eric" label="Eric Jones" isOnline />
              <SidebarItem img="https://i.pravatar.cc/100?u=betty" label="Betty Chen" isOnline />
           </div> */}
        </aside>
    
    );
};

export default RightSidebar;
