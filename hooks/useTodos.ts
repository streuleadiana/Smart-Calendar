import { Todo } from '../types';
import * as storage from '../utils/storage';

export const useTodos = (
  todos: Todo[],
  setTodos: React.Dispatch<React.SetStateAction<Todo[]>>,
  setLastCompletedTask: React.Dispatch<React.SetStateAction<string | null>>
) => {
  const handleAddTodo = (text: string, isPinned: boolean = false, categoryId?: string, color?: string) => {
    const newTodo: Todo = {
      id: crypto.randomUUID(),
      text,
      completed: false,
      isPinned,
      categoryId,
      color
    };
    const newList = [newTodo, ...todos].sort((a, b) => {
        if (a.isPinned === b.isPinned) return 0;
        return a.isPinned ? -1 : 1;
    });
    setTodos(newList);
    storage.saveTodos(newList);
  };

  const handleEditTodo = (id: string, text: string, categoryId?: string, color?: string) => {
    const updated = todos.map(t => t.id === id ? { ...t, text, categoryId, color } : t);
    setTodos(updated);
    storage.saveTodos(updated);
  };

  const handleToggleTodo = (id: string) => {
    let completedTaskName: string | null = null;
    const updatedTodos = todos.map(t => {
      if (t.id === id) {
        const newStatus = !t.completed;
        if (newStatus) completedTaskName = t.text;
        return { ...t, completed: newStatus };
      }
      return t;
    });
    setTodos(updatedTodos);
    storage.saveTodos(updatedTodos);

    if (completedTaskName) {
        // @ts-ignore
        if (window.confetti) window.confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        setLastCompletedTask(`${completedTaskName}::${Date.now()}`);
    }
  };

  const handleTogglePin = (id: string) => {
    const updated = todos.map(t => t.id === id ? { ...t, isPinned: !t.isPinned } : t);
    updated.sort((a, b) => {
        if (a.isPinned === b.isPinned) return 0;
        return a.isPinned ? -1 : 1;
    });
    setTodos(updated);
    storage.saveTodos(updated);
  };

  const handleChangeTodoColor = (id: string, color: string) => {
    const updated = todos.map(t => t.id === id ? { ...t, color: color } : t);
    setTodos(updated);
    storage.saveTodos(updated);
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

  const handleDeleteTodo = (id: string) => {
    const updatedTodos = todos.filter(t => t.id !== id);
    setTodos(updatedTodos);
    storage.saveTodos(updatedTodos);
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
