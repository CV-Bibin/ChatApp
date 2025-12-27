import React from 'react';
import { Loader2, Eye, Download, FileText, Play, File } from 'lucide-react';

export default function MediaContent({ msg, isMe, highlightText, searchTerm, displayName, roleColor }) {
  
  // --- Handlers inside component ---
  const handleDownload = (e) => {
    e.stopPropagation();
    if (msg.isUploading) return;
    // Force download for images, open directly for PDF/others
    if (msg.type === 'image' && !msg.fileName?.toLowerCase().endsWith('.pdf')) {
        const url = msg.mediaUrl.replace('/upload/', '/upload/fl_attachment/');
        window.open(url, '_blank');
    } else {
        window.open(msg.mediaUrl, '_blank');
    }
  };

  const handleView = (e) => {
    e.stopPropagation();
    if (msg.isUploading) return;
    window.open(msg.mediaUrl, '_blank');
  };

  // --- Styles ---
  const containerBorder = isMe ? "border-blue-200" : "border-gray-100";
  const footerBg = isMe ? "bg-blue-600" : "bg-white";
  const footerTextMain = isMe ? "text-white" : "text-gray-800";
  const footerTextSub = isMe ? "text-blue-200" : "text-gray-500";
  const footerIconBg = isMe ? "bg-white/20 text-white" : "bg-blue-50 text-blue-500";

  return (
    <div className={`relative rounded-2xl overflow-hidden shadow-sm border ${containerBorder} bg-gray-50`}>
      {!isMe && (
        <div className="px-3 pt-2 pb-1 bg-white border-b border-gray-100">
          <p className={`text-[11px] font-bold ${roleColor}`}>{displayName}</p>
        </div>
      )}

      {/* Preview Area */}
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
              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                <button onClick={handleView} className="p-2 bg-white/20 hover:bg-white/40 rounded-full text-white backdrop-blur-sm transition"><Eye size={20} /></button>
                <button onClick={handleDownload} className="p-2 bg-white/20 hover:bg-white/40 rounded-full text-white backdrop-blur-sm transition"><Download size={20} /></button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Footer Area */}
      <div className={`p-3 flex items-center gap-3 ${footerBg}`}>
        <div className={`p-2 rounded-lg shrink-0 ${footerIconBg}`}>
          {msg.isUploading ? <Loader2 size={20} className="animate-spin" /> : 
           (msg.type === 'image' ? <FileText size={20} /> : 
            msg.type === 'video' ? <Play size={20} /> : <File size={20} />)}
        </div>
        <div className="flex-1 overflow-hidden min-w-0">
          <p className={`text-xs font-bold truncate max-w-[200px] ${footerTextMain}`}>
            {highlightText(msg.fileName, searchTerm) || "File"}
          </p>
          <p className={`text-[10px] ${footerTextSub}`}>
            {msg.fileSize || (msg.isUploading ? "Processing..." : "")}
          </p>
        </div>
        {!msg.isUploading && msg.type === 'file' && (
          <button onClick={handleDownload} className={`p-2 rounded-full ${isMe ? 'text-white hover:bg-white/20' : 'text-gray-500 hover:bg-gray-100'}`}>
            <Download size={18} />
          </button>
        )}
        <div className="flex flex-col items-end shrink-0 pl-2">
           <span className={`text-[9px] ${footerTextSub}`}>
             {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
           </span>
        </div>
      </div>
    </div>
  );
}