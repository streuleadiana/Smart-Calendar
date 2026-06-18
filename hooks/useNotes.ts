import { Note } from '../types';
import { db, auth, cleanPayload } from '../lib/firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';

export const useNotes = () => {
  const handleSaveNote = async (
    title: string,
    content: string,
    folder: string,
    color: string
  ) => {
    if (!auth.currentUser) return;
    try {
      const payload = cleanPayload({
        title,
        content,
        folder,
        color,
        createdAt: Date.now(),
        userId: auth.currentUser.uid
      });
      await addDoc(collection(db, 'notes'), payload);
    } catch (error) {
      console.error("Error adding note:", error);
    }
  };

  const handleUpdateNote = async (
    id: string,
    title: string,
    content: string,
    folder: string,
    color: string
  ) => {
    if (!auth.currentUser) return;
    try {
      const payload = cleanPayload({
        title,
        content,
        folder,
        color
      });
      await updateDoc(doc(db, 'notes', id), payload);
    } catch (error) {
      console.error("Error updating note:", error);
    }
  };

  const handleDeleteNote = async (id: string) => {
    if (!auth.currentUser) return;
    try {
      await deleteDoc(doc(db, 'notes', id));
    } catch (error) {
      console.error("Error deleting note:", error);
    }
  };

  return {
    handleSaveNote,
    handleUpdateNote,
    handleDeleteNote
  };
};
