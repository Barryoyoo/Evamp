import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { Plus, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const ToDosPage = () => {
  const { theme } = useTheme();
  const [todos, setTodos] = useState([]);
  const [newTask, setNewTask] = useState('');

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/todos`);
      const data = await response.json();
      setTodos(data);
    } catch (err) {
      toast.error('Failed to load todos');
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;

    try {
      const response = await fetch(`${BACKEND_URL}/todos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task: newTask })
      });
      
      if (response.ok) {
        toast.success('Task added!');
        setNewTask('');
        fetchTodos();
      }
    } catch (err) {
      toast.error('Failed to add task');
    }
  };

  const handleToggle = async (id, completed) => {
    try {
      const response = await fetch(`${BACKEND_URL}/todos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !completed })
      });
      
      if (response.ok) {
        if (!completed) {
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.6 },
            colors: theme === 'dark' ? ['#00f0ff', '#ffd700'] : ['#ffb7b2', '#fdfd96']
          });
        }
        fetchTodos();
      }
    } catch (err) {
      toast.error('Failed to update task');
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`${BACKEND_URL}/todos/${id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        toast.success('Task deleted');
        fetchTodos();
      }
    } catch (err) {
      toast.error('Failed to delete task');
    }
  };

  return (
    <div className={`min-h-screen p-4 md:p-8 ${
      theme === 'dark'
        ? 'bg-gradient-to-br from-zinc-900 via-black to-zinc-900'
        : 'bg-gradient-to-br from-pink-50 via-purple-50 to-yellow-50'
    }`}>
      <div className="max-w-3xl mx-auto">
        <h1 className={`text-4xl md:text-6xl font-bold text-center mb-8 heading-font ${
          theme === 'dark'
            ? 'text-cyan-400 tracking-tighter uppercase'
            : 'text-pink-500 tracking-wide'
        }`}>
          TO-DOS
        </h1>

        <form onSubmit={handleAdd} className="mb-8">
          <div className="flex gap-3">
            <input
              type="text"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder="Add a new task..."
              className={`flex-1 p-4 rounded-lg transition-all duration-300 ${
                theme === 'dark'
                  ? 'bg-black/50 border border-zinc-700 focus:border-cyan-500 text-white placeholder:text-zinc-500'
                  : 'bg-white/80 border border-pink-100 focus:ring-2 focus:ring-pink-200 text-slate-700'
              } outline-none`}
            />
            <button
              type="submit"
              className={`px-6 py-4 rounded-lg font-semibold transition-all duration-300 ${
                theme === 'dark'
                  ? 'bg-cyan-500 text-black hover:bg-cyan-400 hover:shadow-[0_0_20px_rgba(0,240,255,0.4)]'
                  : 'bg-gradient-to-r from-pink-400 to-yellow-400 text-white hover:scale-105 shadow-lg'
              }`}
            >
              <Plus size={24} />
            </button>
          </div>
        </form>

        <div className="space-y-3">
          <AnimatePresence>
            {todos.map((todo) => (
              <motion.div
                key={todo.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                className={`p-4 rounded-lg backdrop-blur-xl flex items-center gap-4 group hover:scale-[1.02] transition-all duration-300 ${
                  theme === 'dark'
                    ? 'bg-black/40 border border-cyan-500/30'
                    : 'bg-white/60 border border-white/40 shadow-lg'
                }`}
              >
                <button
                  onClick={() => handleToggle(todo.id, todo.completed)}
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                    todo.completed
                      ? theme === 'dark'
                        ? 'bg-cyan-500 border-cyan-500'
                        : 'bg-pink-400 border-pink-400'
                      : theme === 'dark'
                        ? 'border-zinc-600 hover:border-cyan-500'
                        : 'border-pink-200 hover:border-pink-400'
                  }`}
                >
                  {todo.completed && <Check size={14} className="text-white" />}
                </button>
                
                <span className={`flex-1 ${
                  todo.completed
                    ? 'line-through opacity-50'
                    : theme === 'dark'
                      ? 'text-zinc-300'
                      : 'text-slate-700'
                }`}>
                  {todo.task}
                </span>

                <button
                  onClick={() => handleDelete(todo.id)}
                  className={`p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity ${
                    theme === 'dark'
                      ? 'bg-red-500/80 text-white hover:bg-red-600'
                      : 'bg-red-400/80 text-white hover:bg-red-500'
                  }`}
                >
                  <X size={16} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {todos.length === 0 && (
          <div className="text-center py-20">
            <p className={theme === 'dark' ? 'text-zinc-400' : 'text-slate-600'}>
              No tasks yet. Add your first one!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ToDosPage;