import React from 'react';
import { Hash, UserPlus } from 'lucide-react';

export default function GroupList({ 
  groups, 
  onSelectGroup, 
  userStatuses, // <--- Used to calculate online count
  unreadCounts, 
  onAddMemberClick, 
  canManageGroups,  
  activeGroupId
}) {
  if (groups.length === 0) return null;

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 px-4 mb-2 mt-2">
        <Hash size={13} className="text-gray-400" />
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Your Groups</h3>
      </div>

      <div className="space-y-1 px-2">
        {groups.map(group => {
          const unread = unreadCounts[group.id] || 0;
          const isActive = activeGroupId === group.id;

          // --- CALCULATE STATS ---
          const memberIds = group.members ? Object.keys(group.members) : [];
          const totalCount = memberIds.length;
          const onlineCount = memberIds.filter(uid => userStatuses[uid]?.state === 'online').length;

          return (
            <div 
              key={group.id}
              onClick={() => onSelectGroup(group)}
              className={`group/item p-3 rounded-xl cursor-pointer transition-all duration-200 flex items-center justify-between 
                ${isActive ? 'bg-blue-50 ring-1 ring-blue-200 shadow-sm' : 'hover:bg-gray-50 border border-transparent'}`}
            >
              <div className="flex items-center gap-3 overflow-hidden flex-1">
                {/* Group Avatar */}
                <div className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center text-xs font-bold shadow-sm transition-colors
                  ${isActive ? 'bg-blue-500 text-white' : 'bg-white border border-gray-100 text-gray-600 group-hover/item:border-blue-200'}`}>
                  {group.name.substring(0, 2).toUpperCase()}
                </div>
                
                {/* Group Info */}
                <div className="flex flex-col overflow-hidden">
                  <span className={`text-sm font-bold truncate ${isActive ? 'text-blue-900' : 'text-gray-700'}`}>
                    {group.name}
                  </span>
                  
                  {/* --- CHANGED: SHOW COUNTS INSTEAD OF DESCRIPTION --- */}
                  <span className="text-[10px] text-gray-400 truncate font-medium">
                    <span className="text-green-600">{onlineCount} Online</span> • {totalCount} Members
                  </span>
                </div>
              </div>

              {/* --- RIGHT SIDE ACTIONS --- */}
              <div className="flex items-center gap-2 shrink-0">
                
                {/* Add Member Button (Only on Hover & if Admin) */}
                {canManageGroups && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); onAddMemberClick(group); }}
                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-100 rounded-full transition opacity-0 group-hover/item:opacity-100"
                    title="Add Member"
                  >
                    <UserPlus size={16} />
                  </button>
                )}

                {/* Notification Bubble */}
                {unread > 0 && (
                  <div className="bg-red-500 text-white text-[10px] font-bold h-5 min-w-[20px] px-1.5 flex items-center justify-center rounded-full shadow-md animate-in zoom-in">
                    {unread}
                  </div>
                )}
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}