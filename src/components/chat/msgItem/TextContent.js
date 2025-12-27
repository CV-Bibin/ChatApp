import React from 'react';
import { Star } from 'lucide-react';

export default function TextContent({ msg, isMe, highlightText, searchTerm, isStarred, statusIcon, isAdmin }) {
  // Admin sees edit history even if active
  const showEditHistory = isAdmin && msg.editHistory;

  return (
    <div className="flex flex-col">
      <p className="text-sm leading-relaxed">{highlightText(msg.text, searchTerm)}</p>
      
      <div className={`flex items-center gap-1 mt-1 ${isMe ? 'justify-end' : 'justify-start'} opacity-90`}>
        {msg.isEdited && <span className="text-[9px] mr-1 opacity-70">(edited)</span>}
        {isStarred && <Star size={10} fill="currentColor" className="text-yellow-300 mr-1" />}
        <span className="text-[9px] opacity-70">
          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
        {isMe && <div className="ml-1 translate-y-[1px]">{statusIcon}</div>}
      </div>

      {showEditHistory && (
        <div className="mt-3 pt-2 border-t border-black/10 text-left">
          <p className="text-[9px] font-bold text-gray-500 mb-1">Edit History (Admin):</p>
          {Object.entries(msg.editHistory).map(([ts, t]) => (
            <div key={ts} className="text-[9px] text-gray-400 line-through">{t}</div>
          ))}
        </div>
      )}
    </div>
  );
}