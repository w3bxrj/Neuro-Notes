import React from 'react';
import { Link as LinkIcon, X } from 'lucide-react';

export default function LinkModal({ linkModalSource, onClose, onLinkCreated, availableNotes }) {
  if (!linkModalSource) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
      <div className="glass p-8 rounded-2xl w-full max-w-md border border-surfaceBorder animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-textPrimary flex items-center gap-2">
            <LinkIcon className="w-5 h-5 text-secondary" />
            Connect Note
          </h2>
          <button onClick={onClose} className="text-textSecondary hover:text-textPrimary bg-surface p-1.5 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <p className="text-sm text-textSecondary mb-4">
          Link <span className="text-primary font-semibold">"{linkModalSource.title}"</span> to:
        </p>
        
        <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-1">
          {availableNotes.length === 0 ? (
            <div className="text-center p-6 text-textSecondary text-sm bg-surface/50 rounded-xl border border-dashed border-surfaceBorder mt-2">
              No unconnected notes available.
            </div>
          ) : (
            availableNotes.map(n => (
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
