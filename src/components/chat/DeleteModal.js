import React from 'react';
import { Trash2 } from 'lucide-react';

export default function DeleteModal({ isOpen, onClose, onConfirm }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      
      {/* The Box */}
      <div className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-xs border border-gray-100 transform transition-all animate-in zoom-in-95 duration-200">
        
        <div className="flex flex-col items-center text-center">
          {/* Icon */}
          <div className="w-14 h-14 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-3 shadow-inner">
            <Trash2 size={24} />
          </div>
          
          <h3 className="text-lg font-bold text-gray-800">Delete Message?</h3>
          <p className="text-xs text-gray-400 mt-1 mb-6 leading-relaxed px-2">
            Are you sure you want to remove this? <br/>
            <span className="text-orange-400 font-medium">This action cannot be undone.</span>
          </p>

          <div className="flex gap-2 w-full">
            <button 
              onClick={onClose}
              className="flex-1 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-600 text-xs font-bold rounded-xl transition"
            >
              Cancel
            </button>
            <button 
              onClick={onConfirm}
              className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-red-100 transition transform active:scale-95"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}