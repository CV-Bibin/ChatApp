import React, { useState } from 'react';
import { Pin, Reply, Smile, Trash2, Edit2, Share, CheckCheck, Download, Eye, Play, FileText, File, Loader2 } from 'lucide-react';
import PollMessage from './PollMessage';
import VoiceMessage from './VoiceMessage';
import AnimeDP from "../images/AnimeDP";

export default function MessageItem({ 
  msg, currentUser, userData, isManager, isFirstLevelRater, groupMembers, userProfiles,
  onPin, onReply, onReact, onDelete, onEdit, onVote, onReveal, onForward 
}) {
  const [showReactionMenu, setShowReactionMenu] = useState(false);
  const isMe = msg.senderId === currentUser.uid;
  const isDeleted = msg.isDeleted;
  const myRole = userData?.role;
  const canSeeDeletedContent = myRole === 'admin';
  const showEditHistory = myRole === 'admin' && msg.editHistory && !isDeleted;

  // Live Data lookup
  const senderLiveProfile = userProfiles ? userProfiles[msg.senderId] : null;
  const currentXP = isMe ? (userData?.xp || 0) : (senderLiveProfile?.xp || msg.senderXp || 0);
  const currentRole = isMe ? (userData?.role) : (senderLiveProfile?.role || msg.senderRole);

  const handleDownload = (e) => {
    e.stopPropagation();
    if(msg.isUploading) return;
    const url = msg.mediaUrl?.includes('cloudinary') 
      ? msg.mediaUrl.replace('/upload/', '/upload/fl_attachment/') 
      : msg.mediaUrl;
    window.open(url, '_blank');
  };

  const handleView = (e) => {
    e.stopPropagation();
    if(msg.isUploading) return;
    window.open(msg.mediaUrl, '_blank');
  };

  const getDisplayName = () => {
    if (!isFirstLevelRater && !isManager) return msg.senderEmail.split('@')[0];
    if (isManager) return msg.senderEmail.split('@')[0];
    if (['admin', 'co_admin', 'assistant_admin', 'leader', 'group_leader'].includes(currentRole)) return msg.senderEmail.split('@')[0];
    return "Member";
  };
  const displayName = isMe ? "You" : getDisplayName();
  
  const getRoleTextColor = (role) => {
    const colors = { admin: 'text-gray-900', co_admin: 'text-amber-700', assistant_admin: 'text-yellow-600', leader: 'text-purple-700', group_leader: 'text-orange-600', rater: 'text-green-600' };
    return colors[role] || 'text-gray-500';
  };

  const getStatusIcon = () => {
     if (!isMe) return null; 
     const readByIDs = msg.readBy ? Object.keys(msg.readBy).filter(id => id !== currentUser.uid) : [];
     const totalMemberIDs = groupMembers ? Object.keys(groupMembers).filter(id => id !== currentUser.uid) : [];
     if (totalMemberIDs.length > 0 && readByIDs.length >= totalMemberIDs.length) return <CheckCheck size={15} className="text-green-300" strokeWidth={2.5} />;
     if (readByIDs.length > 0) return <CheckCheck size={15} className="text-sky-200" strokeWidth={2.5} />;
     return <CheckCheck size={15} className="text-blue-200/60" />;
  };

  let canDelete = isManager || (isMe && (userData?.xp || 0) >= 100);
  const canEdit = isMe && !isDeleted && msg.type === 'text'; 
  const reactions = ['👍', '👎', '❤️', '😂', '😮', '😢', '🔥'];

  // Media Card Styles
  // If it's me (Admin), use blue border but KEEP content neutral so images show up
  const containerBorder = isMe ? "border-blue-200" : "border-gray-100";
  const footerBg = isMe ? "bg-blue-600" : "bg-white";
  const footerTextMain = isMe ? "text-white" : "text-gray-800";
  const footerTextSub = isMe ? "text-blue-200" : "text-gray-500";
  const footerIconBg = isMe ? "bg-white/20 text-white" : "bg-blue-50 text-blue-500";

  return (
    <div className={`flex gap-3 mb-6 group ${isMe ? 'flex-row-reverse' : ''} relative`}>
      
      <div className="shrink-0">
        <AnimeDP seed={msg.senderEmail || msg.senderId} role={currentRole} size={45} xp={currentXP} />
      </div>

      <div className="max-w-[80%] md:max-w-[60%] relative">
        
        {/* === CONTENT SWITCHER === */}
        {msg.type === 'poll' ? (
          <PollMessage msg={msg} currentUser={currentUser} onVote={onVote} onReveal={onReveal} />
        ) : msg.type === 'audio' ? (
          <VoiceMessage msg={msg} isMe={isMe} nameTextColor={getRoleTextColor(currentRole)} canSeeDeletedContent={canSeeDeletedContent} />
        ) : (msg.type === 'image' || msg.type === 'video' || msg.type === 'file') ? (
            
           // === MEDIA & FILE CARD ===
           <div className={`relative rounded-2xl overflow-hidden shadow-sm border ${containerBorder} bg-gray-50`}>
              
              {/* Username Display (Visible to everyone except me) */}
              {!isMe && !isDeleted && (
                <div className="px-3 pt-2 pb-1 bg-white border-b border-gray-100">
                    <p className={`text-[11px] font-bold ${getRoleTextColor(currentRole)}`}>{displayName}</p>
                </div>
              )}

              {/* Preview Area (Images/Videos) */}
              {(msg.type === 'image' || msg.type === 'video') && (
                  <div className="relative bg-gray-100 flex items-center justify-center min-h-[120px]">
                    {msg.isUploading ? (
                        <div className="flex flex-col items-center justify-center text-gray-400 gap-2 p-8">
                            <Loader2 size={24} className="animate-spin text-blue-500" />
                            <span className="text-xs font-medium">Uploading...</span>
                        </div>
                    ) : (
                        <>
                            {msg.type === 'image' ? (
                                <img src={msg.mediaUrl} alt="shared" className="w-full h-auto max-h-[200px] object-cover" />
                            ) : (
                                <video controls src={msg.mediaUrl} className="w-full h-auto max-h-[200px]" />
                            )}
                            
                            {/* Overlay Buttons */}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                <button onClick={handleView} className="p-2 bg-white/20 hover:bg-white/40 rounded-full text-white backdrop-blur-sm transition"><Eye size={20} /></button>
                                <button onClick={handleDownload} className="p-2 bg-white/20 hover:bg-white/40 rounded-full text-white backdrop-blur-sm transition"><Download size={20} /></button>
                            </div>
                        </>
                    )}
                  </div>
              )}

              {/* File Info Footer */}
              <div className={`p-3 flex items-center gap-3 ${footerBg}`}>
                  <div className={`p-2 rounded-lg shrink-0 ${footerIconBg}`}>
                     {msg.isUploading ? <Loader2 size={20} className="animate-spin" /> : (msg.type === 'image' ? <FileText size={20} /> : msg.type === 'video' ? <Play size={20} /> : <File size={20} />)}
                  </div>
                  
                  <div className="flex-1 overflow-hidden min-w-0">
                      <p className={`text-xs font-bold truncate ${footerTextMain}`}>{msg.fileName || "File"}</p>
                      <p className={`text-[10px] ${footerTextSub}`}>{msg.fileSize || (msg.isUploading ? "Processing..." : "")}</p>
                  </div>
                  
                  {/* Download Button for Generic Files */}
                  {!msg.isUploading && msg.type === 'file' && (
                     <button onClick={handleDownload} className={`p-2 rounded-full ${isMe ? 'text-white hover:bg-white/20' : 'text-gray-500 hover:bg-gray-100'}`}>
                        <Download size={18} />
                     </button>
                  )}

                  {/* Time & Status */}
                  <div className="flex flex-col items-end shrink-0 pl-2">
                      <span className={`text-[9px] ${footerTextSub}`}>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      {isMe && !msg.isUploading && <div className="mt-0.5">{getStatusIcon()}</div>}
                  </div>
              </div>
           </div>

        ) : (
          
          // === TEXT MESSAGE ===
          <>
            {msg.replyTo && !isDeleted && (
              <div className={`text-xs mb-1 p-2 rounded-lg border-l-4 bg-white/50 border-gray-400 text-gray-500 opacity-80 ${isMe ? 'text-right' : 'text-left'}`}>
                <span className="font-bold block mb-0.5">{isFirstLevelRater && !isManager && !isMe ? "Member/Admin" : msg.replyTo.sender}</span>
                <span className="italic truncate block">{msg.replyTo.text}</span>
              </div>
            )}

            <div className={`relative p-4 shadow-sm break-words ${isDeleted ? 'bg-gray-100 border border-gray-200 text-gray-400 rounded-2xl italic' : isMe ? 'bg-blue-600 text-white rounded-2xl rounded-tr-sm' : 'bg-white text-gray-800 rounded-2xl rounded-tl-sm'}`}>
              {!isMe && !isDeleted && (
                <p className={`text-[11px] mb-1 font-bold ${getRoleTextColor(currentRole)}`}>{displayName}</p>
              )}

              {isDeleted ? (
                <div>
                   <p className="text-xs flex items-center gap-1"><Trash2 size={12} /> {msg.deletedByRole === 'admin' ? "Deleted by Admin" : "Message deleted"}</p>
                   {canSeeDeletedContent && <div className="mt-2 text-red-500 text-xs">(Admin): {msg.text}</div>}
                </div>
              ) : (
                <div className="flex flex-col">
                  <p className="text-sm leading-relaxed">{msg.text}</p>
                  <div className={`flex items-center gap-1 mt-1 ${isMe ? 'justify-end' : 'justify-start'} opacity-90`}>
                      {msg.isEdited && <span className="text-[9px] mr-1 opacity-70">(edited)</span>}
                      <span className="text-[9px] opacity-70">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      {isMe && <div className="ml-1 translate-y-[1px]">{getStatusIcon()}</div>}
                  </div>
                  {showEditHistory && (
                    <div className="mt-3 pt-2 border-t border-black/10 text-left">
                       <p className="text-[9px] font-bold text-gray-500 mb-1">Edit History:</p>
                       {Object.entries(msg.editHistory).map(([ts, t]) => <div key={ts} className="text-[9px] text-gray-400 line-through">{t}</div>)}
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}

        {/* --- ACTIONS MENU (FIXED POSITION) --- */}
        {!isDeleted && !msg.isUploading && (
            <div className={`absolute -top-8 ${isMe ? 'right-0' : 'left-0'} flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200 z-50 bg-white/90 backdrop-blur shadow-sm border border-gray-100 rounded-full px-2 py-1`}>
              <button onClick={() => onForward(msg)} className="p-1.5 text-gray-400 hover:text-purple-500 hover:scale-110 transition"><Share size={14} /></button>
              {canDelete && <button onClick={() => onDelete(msg)} className="p-1.5 text-gray-400 hover:text-red-500 hover:scale-110 transition"><Trash2 size={14} /></button>}
              {canEdit && <button onClick={() => onEdit(msg)} className="p-1.5 text-gray-400 hover:text-green-500 hover:scale-110 transition"><Edit2 size={14} /></button>}
              {isManager && <button onClick={() => onPin(msg)} className="p-1.5 text-gray-400 hover:text-yellow-500 hover:scale-110 transition"><Pin size={14} /></button>}
              {msg.type !== 'poll' && <button onClick={() => onReply(msg)} className="p-1.5 text-gray-400 hover:text-blue-500 hover:scale-110 transition"><Reply size={14} /></button>}
              
              <div className="w-px h-3 bg-gray-300 mx-1"></div>
              
              <div className="relative">
                <button onClick={() => setShowReactionMenu(!showReactionMenu)} className="p-1.5 text-gray-400 hover:text-orange-500 hover:scale-110 transition"><Smile size={14} /></button>
                {showReactionMenu && (
                  <div className="absolute top-8 left-0 bg-white shadow-xl rounded-full p-1 flex gap-1 border border-gray-100 z-50 animate-in zoom-in-50 duration-200">
                    {reactions.map(emoji => (
                      <button key={emoji} onClick={() => { onReact(msg.id, emoji); setShowReactionMenu(false); }} className="w-8 h-8 hover:bg-gray-100 rounded-full flex items-center justify-center text-lg transition">{emoji}</button>
                    ))}
                  </div>
                )}
              </div>
            </div>
        )}

        {/* --- REACTIONS DISPLAY --- */}
        {!isDeleted && msg.reactions && (
           <div className={`absolute -bottom-4 ${isMe ? 'right-0' : 'left-0'} flex gap-1 z-10`}>
             {Object.entries(msg.reactions).map(([emoji, users]) => (
               <div key={emoji} className="bg-white/90 backdrop-blur border border-gray-100 rounded-full px-1.5 py-0.5 text-[10px] shadow-sm flex items-center gap-1 scale-90">
                 <span>{emoji}</span><span className="font-bold text-gray-500">{Object.keys(users).length}</span>
               </div>
             ))}
           </div>
        )}

      </div>
    </div>
  );
}