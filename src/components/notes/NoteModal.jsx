/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect, useRef } from 'react';
import { Loader, Eye, Edit3, Upload, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { convertDocumentToMarkdown } from '../../utils/documentConverter';
import MermaidChart from './MermaidChart';

export default function NoteModal({ isOpen, onClose, onSave, editingNote, submitting }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [editorMode, setEditorMode] = useState('write'); 
  const [fileError, setFileError] = useState('');
  const [isConverting, setIsConverting] = useState(false);
  const fileInputRef = useRef(null);
  const docInputRef = useRef(null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.name.endsWith('.md')) {
      setFileError('Only .md files are supported.');
      e.target.value = '';
      return;
    }
    setFileError('');
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      setContent(text);
      // Auto-fill title from filename if empty
      if (!title.trim()) {
        setTitle(file.name.replace(/\.md$/i, ''));
      }
      setEditorMode('write');
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleDocumentUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFileError('');
    setIsConverting(true);
    try {
      const markdown = await convertDocumentToMarkdown(file);
      setContent(markdown);
      if (!title.trim()) {
        setTitle(file.name.replace(/\.(pdf|docx)$/i, ''));
      }
      setEditorMode('write');
    } catch (err) {
      setFileError('AI conversion failed: ' + err.message);
    } finally {
      setIsConverting(false);
      e.target.value = '';
    }
  };

  useEffect(() => {
    if (editingNote) {
      setTitle(editingNote.title);
      setContent(editingNote.content);
      setTagsInput(editingNote.tags?.join(', ') || '');
    } else {
      setTitle('');
      setContent('');
      setTagsInput('');
    }
    setEditorMode('write');
  }, [editingNote, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const parsedTags = tagsInput.split(',').map(t => t.trim()).filter(Boolean);
    onSave(title, content, parsedTags);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
      <div className="glass p-8 rounded-2xl w-full max-w-3xl border border-surfaceBorder animate-in fade-in zoom-in-95 duration-200">
        <h2 className="text-2xl font-bold text-textPrimary mb-6">
          {editingNote ? 'Edit Note' : 'Create New Note'}
        </h2>
        <form onSubmit={handleSubmit}>

          <div className="mb-4">
            <label className="block text-sm font-medium text-textSecondary mb-2">Title</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full bg-background border border-surfaceBorder rounded-xl px-4 py-3 text-textPrimary focus:outline-none focus:border-primary transition-colors"
              placeholder="E.g., Quantum Computing"
              autoFocus
            />
          </div>


          <div className="mb-4">
            <label className="block text-sm font-medium text-textSecondary mb-2">Tags (comma-separated)</label>
            <input
              type="text"
              value={tagsInput}
              onChange={e => setTagsInput(e.target.value)}
              className="w-full bg-background border border-surfaceBorder rounded-xl px-4 py-3 text-textPrimary focus:outline-none focus:border-primary transition-colors"
              placeholder="e.g., project, frontend, theory"
            />
          </div>


          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-textSecondary">Content</label>
              <div className="flex items-center gap-2">

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".md"
                  className="hidden"
                  onChange={handleFileUpload}
                />

                <input
                  ref={docInputRef}
                  type="file"
                  accept=".pdf,.docx"
                  className="hidden"
                  onChange={handleDocumentUpload}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isConverting}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-surface border border-surfaceBorder text-textSecondary hover:border-primary hover:text-primary transition-all disabled:opacity-50"
                  title="Import a .md file"
                >
                  <Upload className="w-3 h-3" /> Import .md
                </button>
                <button
                  type="button"
                  onClick={() => docInputRef.current?.click()}
                  disabled={isConverting}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-secondary/10 border border-secondary/20 text-secondary hover:bg-secondary/20 transition-all disabled:opacity-50"
                  title="Upload PDF or DOCX and convert to Markdown using AI"
                >
                  {isConverting
                    ? <><Loader className="w-3 h-3 animate-spin" /> Converting...</>
                    : <><Sparkles className="w-3 h-3" /> AI Convert</>}
                </button>

                <div className="flex items-center gap-1 bg-surface border border-surfaceBorder rounded-lg p-1">
                <button
                  type="button"
                  onClick={() => setEditorMode('write')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                    editorMode === 'write'
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-textSecondary hover:text-textPrimary'
                  }`}
                >
                  <Edit3 className="w-3 h-3" /> Write
                </button>
                <button
                  type="button"
                  onClick={() => setEditorMode('preview')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                    editorMode === 'preview'
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-textSecondary hover:text-textPrimary'
                  }`}
                >
                  <Eye className="w-3 h-3" /> Preview
                </button>
                </div>
              </div>
            </div>

            {editorMode === 'write' ? (
              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                className="w-full bg-background border border-surfaceBorder rounded-xl px-4 py-3 text-textPrimary focus:outline-none focus:border-primary transition-colors h-64 resize-none font-mono text-sm leading-relaxed"
                placeholder={'# Your Note Title\n\nWrite your ideas here using **Markdown**...\n\n- Bullet point\n- Another point\n\n```js\n// Code blocks work too\n```'}
              />
            ) : (
              <div className="w-full bg-background border border-surfaceBorder rounded-xl px-4 py-3 h-64 overflow-y-auto">
                {content.trim() ? (
                  <div className="markdown-body">
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm]}
                      components={{
                        code(props) {
                          const {children, className, node, ...rest} = props;
                          const match = /language-(\w+)/.exec(className || '');
                          if (match && match[1] === 'mermaid') {
                            return <MermaidChart chart={String(children).replace(/\n$/, '')} />;
                          }
                          return <code {...rest} className={className}>{children}</code>;
                        }
                      }}
                    >
                      {content}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <p className="text-textSecondary text-sm italic opacity-60">Nothing to preview yet. Switch to Write and add some content.</p>
                )}
              </div>
            )}

            {fileError && (
              <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1">
                ⚠ {fileError}
              </p>
            )}
            <p className="text-xs text-textSecondary mt-1.5 opacity-60">
              Supports <span className="font-semibold text-primary">Markdown</span> — headings, bold, lists, code blocks & more.
            </p>
          </div>

          <div className="flex justify-end gap-3 border-t border-surfaceBorder pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-5 py-2 rounded-xl text-textSecondary hover:bg-surfaceBorder transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !title.trim() || !content.trim()}
              className="px-5 py-2 rounded-xl bg-primary hover:bg-blue-500 text-white transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting && <Loader className="w-4 h-4 animate-spin" />}
              {submitting ? 'Saving...' : editingNote ? 'Save Changes' : 'Create Note'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
