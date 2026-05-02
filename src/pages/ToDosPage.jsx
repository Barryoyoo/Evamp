import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { 
  Plus, Check, X, ListTodo, Sparkles, 
  Trash2, Target, Heart, Zap, Clock
} from 'lucide-react';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';
import api from '../api';

const ToDosPage = () => {
  const { theme } = useTheme();
  const [todos, setTodos] = useState([]);
  const [newTask, setNewTask] = useState('');

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      const response = await api.get('/todos');
      setTodos(response.data);
    } catch (err) {
      toast.error('Sync failed');
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;

    try {
      const response = await api.post('/todos', { task: newTask });
      if (response.status === 201) {
        toast.success('Objective added');
        setNewTask('');
        fetchTodos();
      }
    } catch (err) {
      toast.error('Registry error');
    }
  };

  const handleToggle = async (id, completed) => {
    try {
      const response = await api.patch(`/todos/${id}`, { completed: !completed });
      if (response.status === 200) {
        if (!completed) {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#818cf8', '#f472b6', '#34d399']
          });
          toast.success('Done');
        }
        fetchTodos();
      }
    } catch (err) {
      toast.error('Update failed');
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await api.delete(`/todos/${id}`);
      if (response.status === 200) {
        toast.success('Purged');
        fetchTodos();
      }
    } catch (err) {
      toast.error('Delete error');
    }
  };

  const pendingCount = todos.filter(t => !t.completed).length;
  const completedCount = todos.filter(t => t.completed).length;

  return (
    <div className={`min-h-screen md:pl-[340px] pt-32 md:pt-12 md:pr-12 pb-24 transition-colors duration-500 ${
      theme === 'dark' ? 'bg-slate-900' : 'bg-slate-50'
    }`}>
      <div className="noise-overlay" />

      <div className="max-w-3xl mx-auto px-4">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16"
        >
          <div className="flex items-center gap-2 mb-4 text-emerald-500 font-black tracking-[0.3em] uppercase text-[10px]">
             <Target size={14} />
             <span>Objective Log</span>
          </div>
          <h1 className="text-5xl md:text-8xl font-bold heading-font tracking-tight uppercase mb-8">
             TASKS
          </h1>
          
          <div className="grid grid-cols-2 gap-4">
             <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 flex items-center gap-4 rounded-2xl shadow-sm">
                <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500">
                   <Zap size={18} />
                </div>
                <div>
                   <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Active</p>
                   <p className="text-xl font-bold">{pendingCount}</p>
                </div>
             </div>
             <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 flex items-center gap-4 rounded-2xl shadow-sm">
                <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500">
                   <Check size={18} />
                </div>
                <div>
                   <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Done</p>
                   <p className="text-xl font-bold">{completedCount}</p>
                </div>
             </div>
          </div>
        </motion.div>

        <div className="space-y-8">
          {/* Input Area */}
          <form onSubmit={handleAdd}>
            <div className="relative group">
              <input
                type="text"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                placeholder="ADD NEW TASK..."
                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-5 pl-12 rounded-2xl outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all text-[11px] font-bold tracking-wider placeholder:tracking-normal placeholder:font-medium"
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                 <Plus size={20} strokeWidth={3} />
              </div>
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold heading-font uppercase text-[9px] tracking-widest transition-all hover:bg-emerald-500 shadow-lg shadow-emerald-600/20"
              >
                COMMIT
              </button>
            </div>
          </form>

          {/* Tasks Container */}
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {todos.map((todo) => (
                <motion.div
                  key={todo.id}
                  layout
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className={`bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 flex items-center gap-4 rounded-2xl transition-all ${
                    todo.completed ? 'opacity-50 grayscale' : 'shadow-sm hover:border-emerald-500/30'
                  }`}
                >
                  <button
                    onClick={() => handleToggle(todo.id, todo.completed)}
                    className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                      todo.completed
                        ? 'bg-emerald-500 border-emerald-500'
                        : 'border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 hover:border-emerald-500/50'
                    }`}
                  >
                    {todo.completed && <Check size={16} className="text-white" strokeWidth={4} />}
                  </button>

                  <div className="flex-1">
                     <p className={`text-sm font-bold body-font tracking-tight transition-all ${
                       todo.completed ? 'line-through text-slate-400' : 'text-slate-700 dark:text-slate-200'
                     }`}>
                       {todo.task}
                     </p>
                  </div>

                  <button
                    onClick={() => handleDelete(todo.id)}
                    className="p-2 rounded-lg bg-red-500/10 text-red-500 opacity-0 group-hover:opacity-100 sm:opacity-100 transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {todos.length === 0 && (
               <div className="py-24 text-center">
                  <div className="p-8 rounded-full bg-slate-100 dark:bg-slate-800 inline-flex mb-6 text-slate-300">
                     <ListTodo size={40} strokeWidth={1.5} />
                  </div>
                  <h3 className="text-xl font-bold heading-font uppercase mb-1">Queue Empty</h3>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">No active tasks detected</p>
               </div>
            )}
          </div>
        </div>

        {/* Footer Meta */}
        <div className="mt-20 text-center">
           <div className="flex items-center justify-center gap-3 text-red-500/20">
              <Heart size={10} fill="currentColor" />
              <div className="h-[1px] w-16 bg-slate-200 dark:bg-slate-800" />
              <Heart size={10} fill="currentColor" />
           </div>
           <p className="mt-4 text-[8px] font-black tracking-[0.4em] uppercase text-slate-400">
              Protocol Clear
           </p>
        </div>
      </div>
    </div>
  );
};

export default ToDosPage;