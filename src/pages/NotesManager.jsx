import React, { useState } from 'react';
import { useNotes } from '../context/NotesContext';
import { Plus, Loader, Search, LayoutGrid, Network, Filter, SortAsc } from 'lucide-react';
import toast from 'react-hot-toast';
import NoteCard from '../components/notes/NoteCard';
import NoteModal from '../components/notes/NoteModal';
import LinkModal from '../components/notes/LinkModal';
import GraphComponent from '../components/graph/GraphComponent';
import CustomDropdown from '../components/common/CustomDropdown';

export default function NotesManager() {
  const { notes, links, addNote, updateNote, deleteNote, addLink, deleteLink, loading } = useNotes();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [linkModalSource, setLinkModalSource] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [sortBy, setSortBy] = useState('latest');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'graph'

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

  const tagOptions = [
    { label: 'All Tags', value: '' },
    ...allTags.map(tag => ({ label: tag, value: tag }))
  ];

  const sortOptions = [
    { label: 'Latest', value: 'latest' },
    { label: 'A-Z', value: 'alphabetical' },
    { label: 'Z-A', value: 'reverse-alphabetical' }
  ];

  const filteredNotes = notes
    .filter(n => {
      const matchesSearch = n.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTag = !selectedTag || (n.tags && n.tags.includes(selectedTag));
      return matchesSearch && matchesTag;
    })
    .sort((a, b) => {
      if (sortBy === 'alphabetical') {
        return a.title.localeCompare(b.title);
      } else if (sortBy === 'reverse-alphabetical') {
        return b.title.localeCompare(a.title);
      } else if (sortBy === 'latest') {
        // Handle Firebase Timestamp or fallback to regular Date
        const dateA = a.createdAt?.seconds ? a.createdAt.seconds * 1000 : (a.createdAt || 0);
        const dateB = b.createdAt?.seconds ? b.createdAt.seconds * 1000 : (b.createdAt || 0);
        return dateB - dateA;
      }
      return 0;
    });

  return (
    <div className="p-4 sm:p-8 h-full flex flex-col relative max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 sm:mb-8 gap-4">
        <div>
          <h1 className="text-xl sm:text-3xl font-bold text-textPrimary mb-1 sm:mb-2">My Notes</h1>
          <p className="text-sm text-textSecondary">Manage your thoughts and connections.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto mt-4 md:mt-0">
          <div className="flex bg-surface border border-surfaceBorder rounded-xl p-1 shrink-0 shadow-sm">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all duration-200 ${viewMode === 'grid' ? 'bg-primary text-white shadow-md' : 'text-textSecondary hover:text-textPrimary'}`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setViewMode('graph')}
              className={`p-2 rounded-lg transition-all duration-200 ${viewMode === 'graph' ? 'bg-primary text-white shadow-md' : 'text-textSecondary hover:text-textPrimary'}`}
              title="Graph View"
            >
              <Network className="w-4 h-4" />
            </button>
          </div>

          <div className="relative flex-1 min-w-[200px] md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-textSecondary" />
            <input
              type="text"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface border border-surfaceBorder rounded-xl pl-9 pr-4 py-2 text-sm text-textPrimary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all shadow-sm"
            />
          </div>

          <CustomDropdown 
            options={tagOptions}
            value={selectedTag}
            onChange={setSelectedTag}
            placeholder="Filter by Tag"
            icon={Filter}
          />

          <CustomDropdown 
            options={sortOptions}
            value={sortBy}
            onChange={setSortBy}
            placeholder="Sort by"
            icon={SortAsc}
          />

          <button
            onClick={openCreateModal}
            className="bg-primary hover:bg-blue-500 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-primary/20 shrink-0 min-h-[40px] font-medium"
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
      ) : viewMode === 'graph' ? (
        <div className="flex-1 min-h-0 bg-surface/10 rounded-3xl overflow-hidden border border-surfaceBorder">
          <GraphComponent 
            notes={notes} 
            links={links} 
            searchQuery={searchQuery} 
            selectedTag={selectedTag} 
          />
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
