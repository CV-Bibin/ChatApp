import React, { useRef } from 'react';
import { Image, Video, FileText, X } from 'lucide-react';

export default function AttachmentMenu({ isOpen, onClose, onSelect }) {
  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleFileChange = (e, type) => {
    if (e.target.files?.[0]) {
      onSelect(e.target.files[0], type);
      onClose();
    }
    e.target.value = null; // Reset
  };

  return (
    <div className="absolute bottom-16 left-4 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 flex flex-col gap-1 z-50 animate-in slide-in-from-bottom-5 fade-in duration-200 w-40">
      
      {/* 1. PHOTO (Compressed) */}
      <button onClick={() => imageInputRef.current?.click()} className="flex items-center gap-3 p-3 hover:bg-blue-50 rounded-xl transition text-gray-700 hover:text-blue-600 text-left group">
        <div className="bg-blue-100 p-2 rounded-full text-blue-600 group-hover:scale-110 transition"><Image size={18} /></div>
        <span className="text-xs font-bold">Photo</span>
      </button>
      <input type="file" ref={imageInputRef} accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, 'image')} />

      {/* 2. VIDEO */}
      <button onClick={() => videoInputRef.current?.click()} className="flex items-center gap-3 p-3 hover:bg-purple-50 rounded-xl transition text-gray-700 hover:text-purple-600 text-left group">
        <div className="bg-purple-100 p-2 rounded-full text-purple-600 group-hover:scale-110 transition"><Video size={18} /></div>
        <span className="text-xs font-bold">Video</span>
      </button>
      <input type="file" ref={videoInputRef} accept="video/*" className="hidden" onChange={(e) => handleFileChange(e, 'video')} />

      {/* 3. DOCUMENT (Original Quality) */}
      <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-3 p-3 hover:bg-green-50 rounded-xl transition text-gray-700 hover:text-green-600 text-left group">
        <div className="bg-green-100 p-2 rounded-full text-green-600 group-hover:scale-110 transition"><FileText size={18} /></div>
        <span className="text-xs font-bold">Document</span>
      </button>
      <input type="file" ref={fileInputRef} accept="*/*" className="hidden" onChange={(e) => handleFileChange(e, 'file')} />

    </div>
  );
}