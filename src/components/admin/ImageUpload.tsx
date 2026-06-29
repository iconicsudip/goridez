'use client';

import { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, Loader2, Maximize2, X } from 'lucide-react';

interface ImageUploadProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function ImageUpload({ value, onChange, placeholder = 'https://images.unsplash.com/...' }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        throw new Error('Upload failed');
      }

      const data = await res.json();
      if (data.url) {
        onChange(data.url);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
      // Reset input so the same file can be uploaded again if needed
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <ImageIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full bg-gray-100 border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm text-gray-900 outline-none focus:border-gray-400 transition-colors"
          />
        </div>
        <input
          type="file"
          accept="image/*,video/*"
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileChange}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-gray-300 px-4 py-3 rounded-xl transition-colors font-bold text-xs uppercase tracking-widest text-gray-900/80 shrink-0"
        >
          {isUploading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Upload size={16} />
          )}
          Upload
        </button>
      </div>
      {value && (
        <div className="mt-3 relative w-full h-32 rounded-xl overflow-hidden bg-gray-50 border border-gray-300 group">
          {value.match(/\.(mp4|webm)$/i) ? (
            <video 
              src={value}
              className="w-full h-full object-cover opacity-80 group-hover:opacity-60 transition-opacity"
              autoPlay muted loop playsInline
            />
          ) : (
            <img 
              src={value} 
              alt="Upload preview" 
              className="w-full h-full object-cover opacity-80 group-hover:opacity-60 transition-opacity"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="%23333" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>';
              }}
            />
          )}
          <button
            type="button"
            onClick={() => setIsPreviewOpen(true)}
            className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <div className="bg-white/60 p-3 rounded-full text-gray-900 backdrop-blur-sm border border-gray-300 hover:bg-white/80 hover:scale-110 transition-all">
              <Maximize2 size={20} />
            </div>
          </button>
          <div className="absolute bottom-2 left-2 right-2 px-2 py-1 bg-white/80 backdrop-blur-md rounded text-[9px] text-green-700 font-mono truncate border border-gray-300 pointer-events-none">
            {value}
          </div>
        </div>
      )}

      {/* Full Size Preview Modal */}
      {isPreviewOpen && value && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/90 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <button 
            type="button"
            onClick={() => setIsPreviewOpen(false)}
            className="absolute top-6 right-6 p-3 bg-white/50 hover:bg-white/10 rounded-full text-gray-500 hover:text-gray-900 transition-all backdrop-blur-md"
          >
            <X size={24} />
          </button>
          {value.match(/\.(mp4|webm)$/i) ? (
            <video 
              src={value} 
              className="max-w-full max-h-full rounded-lg shadow-2xl"
              controls autoPlay
            />
          ) : (
            <img 
              src={value} 
              alt="Full size preview" 
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
            />
          )}
        </div>
      )}
    </div>
  );
}
