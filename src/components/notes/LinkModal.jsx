import React, { useState } from 'react';
import { Link as LinkIcon, X } from 'lucide-react';

export default function LinkModal({ linkModalSource, onClose, onLinkCreated, availableNotes }) {
  const [sortBy, setSortBy] = useState('latest');

  if (!linkModalSource) return null;

  const sortedNotes = [...availableNotes].sort((a, b) => {
    if (sortBy === 'alphabetical') {
      return a.title.localeCompare(b.title);
    } else if (sortBy === 'reverse-alphabetical') {
      return b.title.localeCompare(a.title);
    } else if (sortBy === 'latest') {
      const dateA = a.createdAt?.seconds ? a.createdAt.seconds * 1000 : (a.createdAt || 0);
      const dateB = b.createdAt?.seconds ? b.createdAt.seconds * 1000 : (b.createdAt || 0);
      return dateB - dateA;
    }
    return 0;
  });

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
      <div className="bg-background shadow-2xl p-8 rounded-2xl w-full max-w-md border border-surfaceBorder animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-textPrimary flex items-center gap-2">
            <LinkIcon className="w-5 h-5 text-secondary" />
            Connect Note
          </h2>
          <button onClick={onClose} className="text-textSecondary hover:text-textPrimary bg-surface p-1.5 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <div className="flex flex-col gap-4 mb-6">
          <p className="text-sm text-textSecondary">
            Link <span className="text-primary font-semibold">"{linkModalSource.title}"</span> to:
          </p>
          
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full bg-surface border border-surfaceBorder rounded-xl px-4 py-2 text-sm text-textPrimary focus:outline-none focus:border-primary transition-colors cursor-pointer"
          >
            <option value="latest" className="bg-white text-slate-900 dark:bg-[#0B0F19] dark:text-white">Latest</option>
            <option value="alphabetical" className="bg-white text-slate-900 dark:bg-[#0B0F19] dark:text-white">A-Z (Alphabetic)</option>
            <option value="reverse-alphabetical" className="bg-white text-slate-900 dark:bg-[#0B0F19] dark:text-white">Z-A (Reverse Alphabetic)</option>
          </select>
        </div>
        
        <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-1">
          {sortedNotes.length === 0 ? (
            <div className="text-center p-6 text-textSecondary text-sm bg-surface/50 rounded-xl border border-dashed border-surfaceBorder mt-2">
              No unconnected notes available.
            </div>
          ) : (
            sortedNotes.map(n => (
              <button
                key={n.id}
                onClick={() => onLinkCreated(n.id)}
                className="flex flex-col text-left p-4 rounded-xl border border-surfaceBorder hover:border-secondary hover:bg-secondary/10 transition-colors group"
              >
                <span className="font-medium text-textPrimary group-hover:text-secondary transition-colors">{n.title}</span>
                <span className="text-xs text-textSecondary truncate w-full mt-1">{n.content}</span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
