'use client';

import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';
import { useMemo } from 'react';

const ReactQuill = dynamic(() => import('react-quill'), { 
  ssr: false,
  loading: () => <div className="h-64 flex items-center justify-center bg-[#111111] text-white/40 font-mono text-xs border border-white/5 rounded-xl">Loading Editor...</div>
});

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const modules = useMemo(() => ({
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link', 'clean']
    ],
  }), []);

  return (
    <div className="rich-text-editor-wrapper text-white">
      <ReactQuill 
        theme="snow" 
        value={value} 
        onChange={onChange} 
        modules={modules}
        placeholder={placeholder || 'Write detailed content here...'}
        className="bg-[#050505] border border-white/10 rounded-xl overflow-hidden [&_.ql-toolbar]:border-0 [&_.ql-toolbar]:border-b [&_.ql-toolbar]:border-white/10 [&_.ql-toolbar]:bg-[#111111] [&_.ql-container]:border-0 [&_.ql-editor]:min-h-[250px] [&_.ql-editor]:text-sm [&_.ql-editor]:font-mono [&_.ql-stroke]:stroke-white/70 [&_.ql-fill]:fill-white/70 [&_.ql-picker]:text-white/70"
      />
    </div>
  );
}
