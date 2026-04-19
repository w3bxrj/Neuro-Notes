/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect } from 'react';
import { Loader } from 'lucide-react';

export default function NoteModal({ isOpen, onClose, onSave, editingNote, submitting }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tagsInput, setTagsInput] = useState('');

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
  }, [editingNote, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const parsedTags = tagsInput.split(',').map(t => t.trim()).filter(Boolean);
    onSave(title, content, parsedTags);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
      <div className="glass p-8 rounded-2xl w-full max-w-lg border border-surfaceBorder animate-in fade-in zoom-in-95 duration-200">
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
            <label className="block text-sm font-medium text-textSecondary mb-2">Content</label>
            <textarea 
              value={content}
              onChange={e => setContent(e.target.value)}
              className="w-full bg-background border border-surfaceBorder rounded-xl px-4 py-3 text-textPrimary focus:outline-none focus:border-primary transition-colors h-32 resize-none"
              placeholder="Record your thoughts here..."
            />
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
