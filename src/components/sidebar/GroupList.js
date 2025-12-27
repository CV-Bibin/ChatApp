import React from 'react';
import { UserPlus, Hash, ChevronRight } from 'lucide-react';

// 1. Define distinct modern gradients
const GRADIENTS = [
  'from-blue-500 to-indigo-600',
  'from-violet-500 to-purple-600',
  'from-fuchsia-500 to-pink-600',
  'from-rose-500 to-red-600',
  'from-orange-400 to-amber-500',
  'from-emerald-400 to-teal-500',
  'from-cyan-400 to-blue-500',
  'from-slate-500 to-gray-600',
];

// 2. Helper to pick a gradient based on Group ID (Deterministic)
// This ensures the color stays the same for the group, but looks random
const getGradient = (id) => {
  const sum = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return GRADIENTS[sum % GRADIENTS.length];
};

export default function GroupList({ 
  groups, 
  onSelectGroup, 
  userStatuses, 
  unreadCounts, 
  onAddMemberClick, 
  canManageGroups,  
  activeGroupId
}) {

  if (groups.length === 0) return (
    <div className="flex flex-col items-center justify-center h-32 text-gray-300 text-sm">
      <Hash size={24} className="mb-2 opacity-50" />
      No groups yet
    </div>
  );

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 px-4 mb-3 mt-4">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
          <Hash size={12} /> Your Groups
        </h3>
      </div>

      <div className="space-y-2 px-3">
        {groups.map(group => {
          const unread = unreadCounts[group.id] || 0;
          const isActive = activeGroupId === group.id;

          // --- STATS ---
          const memberIds = group.members ? Object.keys(group.members) : [];
          const totalCount = memberIds.length;
          const onlineCount = memberIds.filter(uid => userStatuses[uid]?.state === 'online').length;

          // Get the gradient for this group
          const gradientClass = getGradient(group.id);

          return (
            <div 
              key={group.id}
              onClick={() => onSelectGroup(group)}
              className={`
                group/item relative p-3 rounded-2xl cursor-pointer transition-all duration-300 flex items-center gap-3 border
                ${isActive 
                  ? 'bg-blue-50/80 border-blue-200 shadow-sm translate-x-1' 
                  : 'bg-transparent border-transparent hover:bg-gray-50 hover:border-gray-100 hover:shadow-sm'
                }
              `}
            >
              {/* Active Indicator Bar (Left) */}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 bg-blue-500 rounded-r-full"></div>
              )}

              {/* --- 1. GRADIENT AVATAR --- */}
              <div className={`
                w-12 h-12 shrink-0 rounded-2xl flex items-center justify-center text-white shadow-md
                bg-gradient-to-br ${gradientClass} transition-transform group-hover/item:scale-105 duration-300
              `}>
                <span className="font-bold text-lg drop-shadow-sm">
                  {group.name.substring(0, 1).toUpperCase()}
                </span>
              </div>

              {/* --- 2. GROUP INFO --- */}
              <div className="flex flex-col overflow-hidden flex-1 min-w-0">
                <div className="flex justify-between items-center">
                   <span className={`text-sm font-bold truncate transition-colors ${isActive ? 'text-blue-900' : 'text-gray-800'}`}>
                     {group.name}
                   </span>
                   {/* Date or Unread could go here */}
                </div>
                
                <div className="flex items-center gap-2 text-[10px] font-medium truncate">
                   {onlineCount > 0 ? (
                      <span className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                        {onlineCount} Online
                      </span>
                   ) : (
                      <span className="text-gray-400">{totalCount} Members</span>
                   )}
                </div>
              </div>

              {/* --- 3. ACTIONS & BADGES --- */}
              <div className="flex items-center gap-1 shrink-0">
                
                {/* Unread Badge */}
                {unread > 0 && (
                  <div className="bg-red-500 text-white text-[10px] font-bold h-5 min-w-[20px] px-1.5 flex items-center justify-center rounded-full shadow-sm animate-bounce">
                    {unread}
                  </div>
                )}

                {/* Add Member Button (Only on Hover & if Manager) */}
                {canManageGroups ? (
                  <button 
                    onClick={(e) => { e.stopPropagation(); onAddMemberClick(group); }}
                    className={`
                      p-2 rounded-full transition-all duration-200
                      ${isActive ? 'text-blue-400 hover:bg-blue-100' : 'text-gray-300 hover:text-blue-600 hover:bg-blue-50 opacity-0 group-hover/item:opacity-100'}
                    `}
                    title="Add Member"
                  >
                    <UserPlus size={16} />
                  </button>
                ) : (
                   /* If not manager, show arrow on active */
                   isActive && <ChevronRight size={16} className="text-blue-300" />
                )}
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}