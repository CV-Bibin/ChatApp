import React from 'react';
import { Search } from 'lucide-react';
import UserProfileHeader from './UserProfileHeader';

export default function SidebarHeader({ user, userData, onOpenPasswordModal, searchTerm, setSearchTerm }) {
  return (
    <div className="bg-gray-50/80 backdrop-blur-sm pt-2 pb-2 border-b border-gray-100 sticky top-0 z-10">
      {/* Profile Section */}
      <UserProfileHeader 
        user={user} 
        userData={userData} 
        onChangePasswordClick={onOpenPasswordModal} 
      />
      
      {/* Search Bar */}
      <div className="px-4 pb-2 mt-2">
        <div className="relative group">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Search..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-gray-200 text-gray-700 text-sm rounded-xl pl-9 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all shadow-sm placeholder-gray-400"
          />
        </div>
      </div>
    </div>
  );
}
