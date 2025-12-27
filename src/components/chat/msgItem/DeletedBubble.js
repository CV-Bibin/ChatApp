import React from 'react';
import { Trash2 } from 'lucide-react';

export default function DeletedBubble({ msg, isAdmin, children }) {
  return (
    <div className="flex flex-col">
      <p className="text-xs flex items-center gap-1 text-gray-500 italic">
        <Trash2 size={12} /> 
        {msg.deletedByRole === 'admin' ? "Deleted by Admin" : "Message deleted"}
      </p>

      {/* ADMIN LOGIC: Show Deleted Text */}
      {isAdmin && msg.type === 'text' && (
        <div className="mt-2 text-red-500 text-xs border-t border-red-200 pt-1 text-left">
          <strong>(Admin View):</strong> {msg.text}
        </div>
      )}

      {/* ADMIN LOGIC: Show Deleted Content (like Voice) passed as children */}
      {isAdmin && children && (
        <div className="mt-1 opacity-75 origin-left scale-95">
           {children}
        </div>
      )}
    </div>
  );
}