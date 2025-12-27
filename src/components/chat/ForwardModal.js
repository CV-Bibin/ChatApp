import React, { useState, useEffect } from 'react';
import { X, Send, Search, CheckCircle2, Circle } from 'lucide-react';
import { database } from '../../firebase';
import { ref, onValue } from 'firebase/database';

export default function ForwardModal({ isOpen, onClose, onForward, currentUser }) {
  const [groups, setGroups] = useState([]);
  const [selectedGroupIds, setSelectedGroupIds] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!isOpen || !currentUser) return;

    const groupsRef = ref(database, 'groups');
    const unsubscribe = onValue(groupsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const allGroups = Object.entries(data).map(([id, val]) => ({ id, ...val }));
        
        // --- CRITICAL SECURITY FIX ---
        // Only show groups where the current user is a member
        const myGroups = allGroups.filter(group => 
            group.members && group.members[currentUser.uid]
        );
        
        setGroups(myGroups);
      } else {
        setGroups([]);
      }
    });

    return () => unsubscribe();
  }, [isOpen, currentUser]);

  const toggleSelection = (groupId) => {
    setSelectedGroupIds(prev => 
      prev.includes(groupId) 
        ? prev.filter(id => id !== groupId) 
        : [...prev, groupId]
    );
  };

  const handleSend = () => {
    if (selectedGroupIds.length > 0) {
      onForward(selectedGroupIds);
      setSelectedGroupIds([]); // Reset
      onClose();
    }
  };

  if (!isOpen) return null;

  // Filter by Search Term
  const displayedGroups = groups.filter(g => 
    g.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-bold text-gray-800">Forward to...</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-500"><X size={20} /></button>
        </div>

        {/* Search */}
        <div className="p-3 border-b border-gray-100">
            <div className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-xl">
                <Search size={18} className="text-gray-400" />
                <input 
                    className="bg-transparent border-none outline-none text-sm w-full"
                    placeholder="Search groups..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
        </div>

        {/* Group List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {displayedGroups.length > 0 ? (
            displayedGroups.map(group => {
                const isSelected = selectedGroupIds.includes(group.id);
                return (
                    <div 
                        key={group.id} 
                        onClick={() => toggleSelection(group.id)}
                        className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition ${isSelected ? 'bg-blue-50 border border-blue-100' : 'hover:bg-gray-50 border border-transparent'}`}
                    >
                        <div className="flex items-center gap-3">
                            {/* Group Avatar Placeholder */}
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-100 to-purple-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                                {group.name.substring(0, 2).toUpperCase()}
                            </div>
                            <span className={`text-sm font-medium ${isSelected ? 'text-blue-700' : 'text-gray-700'}`}>
                                {group.name}
                            </span>
                        </div>
                        {isSelected ? <CheckCircle2 size={22} className="text-blue-600 fill-blue-100" /> : <Circle size={22} className="text-gray-300" />}
                    </div>
                );
            })
          ) : (
            <div className="p-8 text-center text-gray-400 text-sm">No groups found</div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 flex justify-end">
          <button 
            onClick={handleSend}
            disabled={selectedGroupIds.length === 0}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-6 py-2.5 rounded-full font-bold transition shadow-md disabled:shadow-none"
          >
            <Send size={16} /> Send {selectedGroupIds.length > 0 && `(${selectedGroupIds.length})`}
          </button>
        </div>

      </div>
    </div>
  );
}