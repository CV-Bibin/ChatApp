import React, { useState } from 'react';
import { Pin, Reply, Smile, Trash2, Edit2, Share, Star } from 'lucide-react';

export default function ActionMenu({ msg, isMe, isStarred, canDelete, canEdit, isManager, onAction }) {
  const [showEmojis, setShowEmojis] = useState(false);
  const reactions = ['👍', '👎', '❤️', '😂', '😮', '😢', '🔥'];

  return (
    <div className={`absolute -top-8 ${isMe ? 'right-0' : 'left-0'} flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200 z-[60] bg-white/95 backdrop-blur shadow-md border border-gray-100 rounded-full px-2 py-1`}>
      <button onClick={() => onAction('star', msg)} className="p-1.5 hover:scale-110 transition">
        <Star size={14} fill={isStarred ? "gold" : "none"} className={isStarred ? "text-yellow-500" : "text-gray-400"} />
      </button>
      <button onClick={() => onAction('forward', msg)} className="p-1.5 text-gray-400 hover:text-purple-500 transition"><Share size={14} /></button>
      
      {canDelete && <button onClick={() => onAction('delete', msg)} className="p-1.5 text-gray-400 hover:text-red-500 transition"><Trash2 size={14} /></button>}
      {canEdit && <button onClick={() => onAction('edit', msg)} className="p-1.5 text-gray-400 hover:text-green-500 transition"><Edit2 size={14} /></button>}
      {isManager && <button onClick={() => onAction('pin', msg)} className="p-1.5 text-gray-400 hover:text-yellow-500 transition"><Pin size={14} /></button>}
      {msg.type !== 'poll' && <button onClick={() => onAction('reply', msg)} className="p-1.5 text-gray-400 hover:text-blue-500 transition"><Reply size={14} /></button>}
      
      <div className="w-px h-3 bg-gray-300 mx-1"></div>
      
      <div className="relative">
        <button onClick={() => setShowEmojis(!showEmojis)} className="p-1.5 text-gray-400 hover:text-orange-500 transition"><Smile size={14} /></button>
        {showEmojis && (
          <div className="absolute top-8 left-0 bg-white shadow-xl rounded-full p-1 flex gap-1 z-50">
            {reactions.map(emoji => (
              <button key={emoji} onClick={() => { onAction('react', msg.id, emoji); setShowEmojis(false); }} className="hover:bg-gray-100 p-1 rounded-full text-lg">{emoji}</button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}