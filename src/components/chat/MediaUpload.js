import React, { useRef } from 'react';
import { Paperclip, Loader2 } from 'lucide-react';

export default function MediaUpload({ onUpload, isUploading }) {
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      onUpload(file);
    }
    e.target.value = null;
  };

  return (
    <>
      {/* Removed accept="..." to allow ALL files */}
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        onChange={handleFileSelect}
      />
      
      <button 
        type="button" 
        onClick={() => fileInputRef.current?.click()} 
        disabled={isUploading}
        className="p-3 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-full transition relative group"
        title="Upload File, Image, or Video"
      >
        {isUploading ? (
          <Loader2 size={20} className="animate-spin text-blue-500" />
        ) : (
          <Paperclip size={20} className="group-hover:scale-110 transition-transform" />
        )}
      </button>
    </>
  );
}