import React from 'react';
import { getDefaultAvatarUrl } from '../../services/media';

const SidebarItem = ({ icon, img, label, isBold, isOnline }) => (
  <div className="flex items-center space-x-3 p-2 hover:bg-gray-200 rounded-lg cursor-pointer mx-2 transition-colors duration-200">
    {icon && <div className="w-8 flex justify-center">{icon}</div>}
    {img && (
      <div className="relative">
        <img
          src={img}
          className="w-9 h-9 rounded-full object-cover"
          alt={label}
          onError={(e) => {
            e.currentTarget.src = getDefaultAvatarUrl();
          }}
        />
        {isOnline && (
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
        )}
      </div>
    )}
    <span className={`text-[15px] ${isBold ? 'font-semibold' : 'font-medium text-gray-700'}`}>
      {label}
    </span>
  </div>
);

export default SidebarItem;
