import React from 'react';
import { X, Trash2, Shield, User } from 'lucide-react';
import { database } from '../firebase';
import { ref, remove } from 'firebase/database';

export default function MembersModal({ activeGroup, isOpen, onClose, currentUser, userProfiles, isManager }) {
  if (!isOpen || !activeGroup) return null;

  // Convert members object to array
  const memberIds = activeGroup.members ? Object.keys(activeGroup.members) : [];

  const handleRemoveUser = async (userId) => {
    if (!window.confirm("Remove this user from the group?")) return;
    try {
      // Remove user from the group's member list
      await remove(ref(database, `groups/${activeGroup.id}/members/${userId}`));
      alert("User removed.");
    } catch (error) {
      console.error("Error removing user:", error);
      alert("Failed to remove user.");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        
        {/* Header */}
        <div className="bg-gray-50 p-4 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <User size={18} /> Group Members ({memberIds.length})
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full">
            <X size={20} />
          </button>
        </div>

        {/* List */}
        <div className="max-h-[60vh] overflow-y-auto p-2">
          {memberIds.map(uid => {
            const profile = userProfiles[uid] || {};
            const name = profile.displayName || profile.email?.split('@')[0] || "Unknown";
            const role = profile.role || "member";
            const isMe = uid === currentUser.uid;
            
            // Only Managers/Admins can remove people (but can't remove themselves here)
            const canRemove = isManager && !isMe; 

            return (
              <div key={uid} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white
                    ${role === 'admin' ? 'bg-red-500' : 'bg-blue-500'}`}>
                    {name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-800">{name} {isMe && "(You)"}</p>
                    <p className="text-[10px] text-gray-400 uppercase">{role}</p>
                  </div>
                </div>

                {canRemove && (
                  <button 
                    onClick={() => handleRemoveUser(uid)}
                    className="p-2 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-lg transition"
                    title="Remove User"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}