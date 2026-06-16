import { Todo } from '../types';
import { db, auth, cleanPayload } from '../lib/firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';

export const useTodos = (
  todos: Todo[],
  setTodos: React.Dispatch<React.SetStateAction<Todo[]>>,
  setLastCompletedTask: React.Dispatch<React.SetStateAction<string | null>>
) => {
  const handleAddTodo = async (text: string, isPinned: boolean = false, categoryId?: string, color?: string) => {
    if (!auth.currentUser) {
        console.error("User not authenticated");
        return;
    }
    
    try {
        const payload = cleanPayload({
            text,
            completed: false,
            isPinned,
            categoryId: categoryId || null,
            color: color || null,
            userId: auth.currentUser.uid
        });
        await addDoc(collection(db, 'todos'), payload);
    } catch (error) {
        console.error("Error adding todo:", error);
    }
  };

  const handleEditTodo = async (id: string, text: string, categoryId?: string, color?: string) => {
    if (!auth.currentUser) return;
    try {
        const payload = cleanPayload({ text, categoryId: categoryId || null, color: color || null });
        await updateDoc(doc(db, 'todos', id), payload);
    } catch (error) {
        console.error("Error editing todo:", error);
    }
  };

  const handleToggleTodo = async (id: string) => {
    if (!auth.currentUser) return;
    const todo = todos.find(t => t.id === id);
    if (!todo) return;
    try {
        const newStatus = !todo.completed;
        await updateDoc(doc(db, 'todos', id), { completed: newStatus });
        
        if (newStatus) {
            // @ts-ignore
            if (window.confetti) window.confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
            setLastCompletedTask(`${todo.text}::${Date.now()}`);
        }
    } catch (error) {
        console.error("Error toggling todo:", error);
    }
  };

  const handleTogglePin = async (id: string) => {
    if (!auth.currentUser) return;
    const todo = todos.find(t => t.id === id);
    if (!todo) return;
    try {
        await updateDoc(doc(db, 'todos', id), { isPinned: !todo.isPinned });
    } catch (error) {
        console.error("Error pinning todo:", error);
    }
  };

  const handleChangeTodoColor = async (id: string, color: string) => {
    if (!auth.currentUser) return;
    try {
        await updateDoc(doc(db, 'todos', id), { color });
    } catch (error) {
        console.error("Error tracking color:", error);
    }
  };

  const handleToggleTodoByText = (textFragment: string): boolean => {
    const target = textFragment.toLowerCase();
    const todo = todos.find(t => t.text.toLowerCase().includes(target));
    if (todo) {
      handleToggleTodo(todo.id);
      return true;
    }
    return false;
  };

  const handleDeleteTodo = async (id: string) => {
    try {
        await deleteDoc(doc(db, 'todos', id));
    } catch (error) {
        console.error("Error deleting todo:", error);
    }
  };

  return {
    handleAddTodo,
    handleEditTodo,
    handleToggleTodo,
    handleTogglePin,
    handleChangeTodoColor,
    handleToggleTodoByText,
    handleDeleteTodo
  };
};
