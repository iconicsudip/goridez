'use client';

import { useState, useRef } from 'react';
import { Upload, Loader2, Maximize2, X, Trash2, Star } from 'lucide-react';

interface MultiImageUploadProps {
  value: string[];
  onChange: (value: string[]) => void;
}

export default function MultiImageUpload({ value, onChange }: MultiImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    try {
      setIsUploading(true);
      const newUrls: string[] = [];

      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!res.ok) throw new Error('Upload failed');
        const data = await res.json();
        if (data.url) newUrls.push(data.url);
      }

      if (newUrls.length > 0) {
        // The first image in the gallery is used as the vehicle's primary/cover
        // photo everywhere on the site, so newly uploaded photos go to the front
        // — otherwise a freshly uploaded photo would never actually show up.
        onChange([...newUrls, ...value]);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image(s). Please try again.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeImage = (indexToRemove: number) => {
    onChange(value.filter((_, idx) => idx !== indexToRemove));
  };

  const makeCover = (index: number) => {
    if (index === 0) return;
    const next = [...value];
    const [chosen] = next.splice(index, 1);
    next.unshift(chosen);
    onChange(next);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileChange}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-white border border-gray-200 hover:border-gray-400 px-4 py-4 rounded-xl transition-all font-bold text-xs uppercase tracking-widest text-gray-900/80 border-dashed"
        >
          {isUploading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Upload size={16} />
          )}
          {isUploading ? 'Uploading...' : 'Upload Images'}
        </button>
      </div>

      {value.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {value.map((url, index) => (
            <div key={index} className="relative w-full aspect-video rounded-xl overflow-hidden bg-gray-50 border border-gray-300 group">
              {index === 0 && (
                <span className="absolute top-2 left-2 z-10 bg-green-600 text-white text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-md shadow-sm">
                  Cover
                </span>
              )}
              <img
                src={url}
                alt={`Upload preview ${index + 1}`}
                className="w-full h-full object-cover opacity-80 group-hover:opacity-50 transition-opacity"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="%23333" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>';
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                {index !== 0 && (
                  <button
                    type="button"
                    onClick={() => makeCover(index)}
                    title="Set as cover photo"
                    className="bg-white/60 p-2 rounded-full text-gray-900 backdrop-blur-sm border border-gray-300 hover:bg-white/80 transition-all"
                  >
                    <Star size={16} />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setPreviewImage(url)}
                  className="bg-white/60 p-2 rounded-full text-gray-900 backdrop-blur-sm border border-gray-300 hover:bg-white/80 transition-all"
                >
                  <Maximize2 size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="bg-red-500/20 p-2 rounded-full text-red-500 backdrop-blur-sm border border-red-500/20 hover:bg-red-500/40 hover:text-red-400 transition-all"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Full Size Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/90 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <button
            type="button"
            onClick={() => setPreviewImage(null)}
            className="absolute top-6 right-6 p-3 bg-white/50 hover:bg-white/10 rounded-full text-gray-500 hover:text-gray-900 transition-all backdrop-blur-md"
          >
            <X size={24} />
          </button>
          <img
            src={previewImage}
            alt="Full size preview"
            className="max-w-full max-h-full object-cover rounded-lg shadow-2xl"
          />
        </div>
      )}
    </div>
  );
}
