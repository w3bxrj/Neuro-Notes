import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';
import { 
  subscribeToNotes, 
  subscribeToLinks, 
  createNote as apiCreateNote, 
  editNote as apiEditNote, 
  removeNote as apiRemoveNote, 
  createLink as apiCreateLink, 
  removeLink as apiRemoveLink 
} from '../services/noteService';

const NotesContext = createContext();

export function NotesProvider({ children }) {
  const { currentUser } = useAuth();
  const [notes, setNotes] = useState([]);
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      setNotes([]);
      setLinks([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    
    const unsubNotes = subscribeToNotes(currentUser.uid, 
      (data) => { setNotes(data); setLoading(false); }, 
      (error) => { 
        console.error(error); 
        toast.error('Permission denied to load notes'); 
        setLoading(false); 
      }
    );
    
    const unsubLinks = subscribeToLinks(currentUser.uid, 
      (data) => setLinks(data), 
      (error) => {
        console.error(error);
        toast.error('Permission denied to load connections');
      }
    );

    return () => {
      unsubNotes();
      unsubLinks();
    };
  }, [currentUser]);

  const addNote = async (note) => {
    if (!currentUser) return;
    await apiCreateNote(currentUser.uid, note);
  };

  const updateNote = async (id, updatedData) => {
    if (!currentUser) return;
    await apiEditNote(id, updatedData);
  };

  const deleteNote = async (id) => {
    if (!currentUser) return;
    await apiRemoveNote(id);
    const relatedLinks = links.filter(l => l.sourceId === id || l.targetId === id);
    for (const link of relatedLinks) {
      await apiRemoveLink(link.id);
    }
  };

  const addLink = async (sourceId, targetId) => {
    if (!currentUser) return;
    if (sourceId === targetId) return;
    
    const exists = links.some(l => 
      (l.sourceId === sourceId && l.targetId === targetId) ||
      (l.sourceId === targetId && l.targetId === sourceId)
    );
    if (exists) throw new Error("This conceptual connection already exists.");

    await apiCreateLink(currentUser.uid, sourceId, targetId);
  };

  const deleteLink = async (linkId) => {
    if (!currentUser) return;
    await apiRemoveLink(linkId);
  }

  const value = { notes, links, loading, addNote, updateNote, deleteNote, addLink, deleteLink, setNotes };
  return <NotesContext.Provider value={value}>{children}</NotesContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useNotes() {
  return useContext(NotesContext);
}
