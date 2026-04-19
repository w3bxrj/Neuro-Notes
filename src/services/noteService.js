import { 
  collection, query, where, onSnapshot, 
  addDoc, updateDoc, deleteDoc, doc, serverTimestamp 
} from 'firebase/firestore';
import { db } from './firebase';

export const subscribeToNotes = (userId, onData, onError) => {
  const qNotes = query(collection(db, 'notes'), where('userId', '==', userId));
  return onSnapshot(qNotes, (snapshot) => {
    onData(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  }, onError);
};

export const subscribeToLinks = (userId, onData, onError) => {
  const qLinks = query(collection(db, 'links'), where('userId', '==', userId));
  return onSnapshot(qLinks, (snapshot) => {
    onData(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  }, onError);
};

export const createNote = async (userId, note) => {
  return await addDoc(collection(db, 'notes'), {
    ...note,
    userId,
    createdAt: serverTimestamp()
  });
};

export const editNote = async (id, updatedData) => {
  return await updateDoc(doc(db, 'notes', id), updatedData);
};

export const removeNote = async (id) => {
  return await deleteDoc(doc(db, 'notes', id));
};

export const createLink = async (userId, sourceId, targetId) => {
  return await addDoc(collection(db, 'links'), {
    sourceId,
    targetId,
    userId,
    createdAt: serverTimestamp()
  });
};

export const removeLink = async (linkId) => {
  return await deleteDoc(doc(db, 'links', linkId));
};
