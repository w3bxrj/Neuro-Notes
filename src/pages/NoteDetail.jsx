import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useNotes } from '../context/NotesContext';
import { ArrowLeft, Link as LinkIcon, Network, X, Loader } from 'lucide-react';
import toast from 'react-hot-toast';
import LinkModal from '../components/notes/LinkModal';

export default function NoteDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { notes, links, addLink, deleteLink, loading } = useNotes();
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);

  if (loading) {
    return (
      <div className="p-8 h-full flex justify-center items-center">
        <Loader className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  const note = notes.find(n => n.id === id);

  if (!note) {
    return (
      <div className="p-8 h-full flex flex-col justify-center items-center">
        <h2 className="text-2xl font-bold text-textPrimary mb-4">Note not found</h2>
        <button onClick={() => navigate('/notes')} className="text-primary hover:underline">
          Return to Notes
        </button>
      </div>
    );
  }

  // Calculate connected notes bidirectionally
  const connectedNotes = links
    .filter(l => l.sourceId === id || l.targetId === id)
    .map(l => ({
      note: notes.find(n => n.id === (l.sourceId === id ? l.targetId : l.sourceId)),
      linkId: l.id
    }))
    .filter(item => item.note);

  const getAvailableNotesForLink = () => {
    return notes
      .filter(n => n.id !== id)
      .filter(n => !links.some(l => 
        (l.sourceId === id && l.targetId === n.id) ||
        (l.sourceId === n.id && l.targetId === id)
      ));
  };

  const handleCreateLink = async (targetId) => {
    try {
      await addLink(id, targetId);
      toast.success('Notes successfully connected!');
      setIsLinkModalOpen(false);
    } catch (err) {
      toast.error('Failed to create link: ' + err.message);
    }
  };

  return (
    <div className="p-8 h-full flex flex-col relative max-w-4xl mx-auto w-full">
      <button 
        onClick={() => navigate('/notes')}
        className="flex items-center gap-2 text-textSecondary hover:text-primary transition-colors mb-6 w-fit"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Notes
      </button>

      <div className="glass p-8 rounded-3xl flex flex-col flex-1 mb-8">
        <h1 className="text-4xl font-bold text-textPrimary mb-4">{note.title}</h1>
        {note.tags && note.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {note.tags.map(tag => (
              <span key={tag} className="px-3 py-1 text-sm font-medium bg-primary/10 text-primary border border-primary/20 rounded-md">
                #{tag}
              </span>
            ))}
          </div>
        )}
        <div className="text-textSecondary whitespace-pre-wrap leading-relaxed text-lg flex-1">
          {note.content}
        </div>
      </div>

      <div className="glass p-6 rounded-3xl">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <Network className="w-5 h-5 text-secondary" />
            <h2 className="text-xl font-bold text-textPrimary">Connected Notes</h2>
          </div>
          <button 
            onClick={() => setIsLinkModalOpen(true)}
            className="bg-secondary/10 hover:bg-secondary/20 text-secondary px-4 py-2 rounded-xl flex items-center gap-2 transition-colors text-sm font-medium border border-secondary/20"
          >
            <LinkIcon className="w-4 h-4" />
            Link Note
          </button>
        </div>

        {connectedNotes.length === 0 ? (
          <div className="text-center p-6 text-textSecondary bg-surface/50 rounded-2xl border border-dashed border-surfaceBorder">
            No notes connected yet. Build your knowledge graph!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {connectedNotes.map(({ note: cNote, linkId }) => (
              <div key={cNote.id} className="group relative glass p-4 rounded-xl border border-secondary/20 hover:border-secondary/40 transition-colors flex justify-between items-center">
                <Link to={`/notes/${cNote.id}`} className="flex-1 truncate pr-4">
                  <h3 className="font-semibold text-textPrimary group-hover:text-secondary transition-colors truncate">
                    {cNote.title}
                  </h3>
                </Link>
                <button 
                  onClick={async () => {
                    try {
                      await deleteLink(linkId);
                      toast.success('Connection removed!');
                    } catch (e) {
                      toast.error('Failed to remove: ' + e.message);
                    }
                  }} 
                  className="text-textSecondary hover:text-red-400 p-2 rounded-lg hover:bg-surface transition-colors"
                  title="Remove connection"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {isLinkModalOpen && (
        <LinkModal
          linkModalSource={note}
          onClose={() => setIsLinkModalOpen(false)}
          onLinkCreated={handleCreateLink}
          availableNotes={getAvailableNotesForLink()}
        />
      )}
    </div>
  );
}
