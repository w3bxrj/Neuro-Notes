import React, { useState } from 'react';
import { useNotes } from '../context/NotesContext';
import { Plus, Loader, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import NoteCard from '../components/notes/NoteCard';
import NoteModal from '../components/notes/NoteModal';
import LinkModal from '../components/notes/LinkModal';

export default function NotesManager() {
  const { notes, links, addNote, updateNote, deleteNote, addLink, deleteLink, loading } = useNotes();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [linkModalSource, setLinkModalSource] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('');

  const openCreateModal = () => {
    setEditingNote(null);
    setIsModalOpen(true);
  };

  const openEditModal = (note) => {
    setEditingNote(note);
    setIsModalOpen(true);
  };

  const handleSaveNote = async (title, content, tags) => {
    setSubmitting(true);
    try {
      if (editingNote) {
        await updateNote(editingNote.id, { title, content, tags });
      } else {
        await addNote({ title, content, tags, x: Math.random() * 300 + 100, y: Math.random() * 300 + 100 });
      }
      toast.success(editingNote ? 'Note updated successfully!' : 'Note created successfully!');
      setIsModalOpen(false);
    } catch (error) {
      toast.error('Failed to save note: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateLink = async (targetId) => {
    try {
      await addLink(linkModalSource.id, targetId);
      toast.success('Connection added!');
      setLinkModalSource(null);
    } catch (err) {
      toast.error('Failed to create link: ' + err.message);
    }
  };

  const getAvailableNotesForLink = () => {
    if (!linkModalSource) return [];
    return notes
      .filter(n => n.id !== linkModalSource.id) 
      .filter(n => !links.some(l => 
        (l.sourceId === linkModalSource.id && l.targetId === n.id) ||
        (l.sourceId === n.id && l.targetId === linkModalSource.id)
      ));
  };

  const allTags = Array.from(new Set(notes.flatMap(n => n.tags || []))).sort();

  const filteredNotes = notes.filter(n => {
    const matchesSearch = n.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = !selectedTag || (n.tags && n.tags.includes(selectedTag));
    return matchesSearch && matchesTag;
  });

  return (
    <div className="p-8 h-full flex flex-col relative max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-textPrimary mb-2">My Notes</h1>
          <p className="text-textSecondary">Manage your thoughts and connections.</p>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto mt-4 md:mt-0">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-textSecondary" />
            <input 
              type="text" 
              placeholder="Search notes..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface border border-surfaceBorder rounded-xl pl-9 pr-4 py-2 text-sm text-textPrimary focus:outline-none focus:border-primary transition-colors"
            />
          </div>
          
          <select 
            value={selectedTag} 
            onChange={(e) => setSelectedTag(e.target.value)}
            className="bg-surface border border-surfaceBorder rounded-xl px-4 py-2 text-sm text-textPrimary focus:outline-none focus:border-primary transition-colors"
          >
            <option value="">All Tags</option>
            {allTags.map(tag => (
              <option key={tag} value={tag}>{tag}</option>
            ))}
          </select>

          <button 
            onClick={openCreateModal}
            className="bg-primary hover:bg-blue-500 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-colors shadow-lg shadow-primary/20 shrink-0"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden md:inline">New Note</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex justify-center items-center">
          <Loader className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : notes.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-textSecondary glass p-8 rounded-3xl m-auto max-w-md w-full border border-surfaceBorder border-dashed">
          <p className="mb-4 text-center">No notes found. It's quiet in here...</p>
          <button onClick={openCreateModal} className="text-primary hover:underline font-medium">Create your first note</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 overflow-y-auto pb-8">
          {filteredNotes.length === 0 && searchQuery && (
            <div className="col-span-full p-8 text-center text-textSecondary bg-surface/30 rounded-2xl border border-dashed border-surfaceBorder">
              No notes match "{searchQuery}"
            </div>
          )}
          {filteredNotes.map(note => {
            const connectedNotes = links
              .filter(l => l.sourceId === note.id || l.targetId === note.id)
              .map(l => ({
                note: notes.find(n => n.id === (l.sourceId === note.id ? l.targetId : l.sourceId)), 
                linkId: l.id 
              }))
              .filter(item => item.note);

            return (
              <NoteCard
                key={note.id}
                note={note}
                searchQuery={searchQuery}
                connectedNotes={connectedNotes}
                onEdit={openEditModal}
                onDelete={deleteNote}
                onOpenLinkModal={setLinkModalSource}
                onRemoveLink={deleteLink}
              />
            );
          })}
        </div>
      )}

      <NoteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveNote}
        editingNote={editingNote}
        submitting={submitting}
      />

      <LinkModal
        linkModalSource={linkModalSource}
        onClose={() => setLinkModalSource(null)}
        onLinkCreated={handleCreateLink}
        availableNotes={getAvailableNotesForLink()}
      />
    </div>
  );
}
