import React from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Edit2, Link as LinkIcon, Network, X } from 'lucide-react';

export default function NoteCard({ note, connectedNotes, searchQuery = '', onEdit, onDelete, onOpenLinkModal, onRemoveLink }) {
  
  const renderHighlightedTitle = (text) => {
    if (!searchQuery.trim()) return text;
    const regex = new RegExp(`(${searchQuery})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) => 
      regex.test(part) ? <mark key={i} className="bg-yellow-400/50 text-textPrimary px-0.5 rounded shadow-sm">{part}</mark> : part
    );
  };

  return (
    <div className="glass p-6 rounded-2xl flex flex-col hover:border-primary/50 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 group min-h-[200px] border border-surfaceBorder/40">
      <div className="flex justify-between items-start mb-4 gap-2">
        <Link to={`/notes/${note.id}`} className="hover:text-primary transition-colors truncate">
          <h3 className="font-bold text-textPrimary text-xl truncate">{renderHighlightedTitle(note.title)}</h3>
        </Link>
        <div className="flex gap-2 flex-shrink-0">
          <button 
            onClick={() => onOpenLinkModal(note)}
            className="p-1.5 text-textSecondary hover:text-secondary transition-colors bg-surface rounded-md"
            title="Link to..."
          >
            <LinkIcon className="w-4 h-4" />
          </button>
          <button 
            onClick={() => onEdit(note)}
            className="p-1.5 text-textSecondary hover:text-primary transition-colors bg-surface rounded-md"
            title="Edit Note"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button 
            onClick={() => {
                if (window.confirm('Delete this note and its connections?')) onDelete(note.id);
            }}
            className="p-1.5 text-textSecondary hover:text-red-400 transition-colors bg-surface rounded-md"
            title="Delete Note"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <p className="text-sm text-textSecondary overflow-hidden line-clamp-3 leading-relaxed flex-1">
        {note.content}
      </p>

      {note.tags && note.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4">
          {note.tags.map(tag => (
            <span key={tag} className="px-2 py-0.5 text-xs font-medium bg-primary/10 text-primary border border-primary/20 rounded-md">
              #{tag}
            </span>
          ))}
        </div>
      )}
      
      {connectedNotes && connectedNotes.length > 0 && (
        <div className="mt-auto border-t border-surfaceBorder pt-4">
          <div className="flex items-center gap-2 mb-3">
            <Network className="w-4 h-4 text-secondary" />
            <span className="text-xs font-semibold text-textSecondary uppercase tracking-wide">Linked Ideas</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {connectedNotes.map(({ note: cNote, linkId }) => (
              <div key={cNote.id} className="group/pill flex items-center gap-1.5 bg-secondary/10 border border-secondary/20 pl-3 pr-2 py-1.5 rounded-lg text-sm text-secondary transition-colors hover:bg-secondary/20">
                <Link to={`/notes/${cNote.id}`} className="truncate max-w-[150px] hover:underline">
                  {cNote.title}
                </Link>
                <button 
                  onClick={() => onRemoveLink(linkId)} 
                  className="text-secondary/60 hover:text-red-400 transition-colors"
                  title="Remove connection"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
