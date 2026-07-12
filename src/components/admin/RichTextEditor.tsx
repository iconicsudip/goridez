'use client';

import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';
import { useMemo } from 'react';

const ReactQuill = dynamic(() => import('react-quill-new'), {
  ssr: false,
  loading: () => <div className="h-64 flex items-center justify-center bg-gray-100 text-gray-500 font-mono text-xs border border-gray-200 rounded-xl">Loading Editor...</div>
});

// DOM TEXT_NODE constant (3) — resolved without referencing the global `Node`,
// which doesn't exist during this client component's server-side render pass.
const TEXT_NODE = 3;
const NBSP = String.fromCharCode(160);

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
    clipboard: {
      matchVisual: false,
      matchers: [
        // Pasted content from Word/Google Docs often replaces every space with a
        // non-breaking space, which makes the whole paragraph a single unbreakable
        // line and blows out the page layout. Normalize those back to regular spaces.
        [TEXT_NODE, (node: any, delta: any) => {
          if (typeof node.data === 'string' && node.data.indexOf(NBSP) !== -1) {
            delta.ops.forEach((op: any) => {
              if (typeof op.insert === 'string') {
                op.insert = op.insert.split(NBSP).join(' ');
              }
            });
          }
          return delta;
        }],
      ],
    },
  }), []);

  return (
    <div className="rich-text-editor-wrapper text-gray-900">
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        placeholder={placeholder || 'Write detailed content here...'}
        className="bg-gray-50 border border-gray-300 rounded-xl overflow-hidden [&_.ql-toolbar]:border-0 [&_.ql-toolbar]:border-b [&_.ql-toolbar]:border-gray-300 [&_.ql-toolbar]:bg-gray-100 [&_.ql-container]:border-0 [&_.ql-editor]:min-h-[250px] [&_.ql-editor]:text-sm [&_.ql-editor]:font-mono [&_.ql-stroke]:stroke-white/70 [&_.ql-fill]:fill-white/70 [&_.ql-picker]:text-gray-600"
      />
    </div>
  );
}
