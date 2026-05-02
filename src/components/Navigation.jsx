import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { 
  Home, Image, Trophy, ListTodo, Heart, Moon, Sun, 
  LogOut, BookOpen, Fingerprint, ChevronRight, Settings2,
  Sparkles
} from 'lucide-react';

const Navigation = () => {
  const { theme, toggleTheme, logout } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navItems = [
    { path: '/home', icon: Home, label: 'Dashboard' },
    { path: '/journal', icon: BookOpen, label: 'Daily Log' },
    { path: '/gallery', icon: Image, label: 'Memory Gallery' },
    { path: '/achievements', icon: Trophy, label: 'Achievements' },
    { path: '/todos', icon: ListTodo, label: 'To-Do List' },
    { path: '/tribute', icon: Heart, label: 'In Loving Memory' }
  ];

  const NavContent = ({ mobile = false }) => (
    <div className={`flex ${mobile ? 'flex-row justify-around w-full' : 'flex-col gap-1 w-full'}`}>
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            className={`group relative flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all ${
              isActive
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
            {!mobile && (
              <span className={`text-sm font-bold body-font tracking-tight relative z-10 hidden md:block ${
                isActive ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'
              }`}>
                {item.label}
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar - Plain */}
      <nav className="hidden md:flex flex-col fixed top-6 left-6 bottom-6 w-72 z-50">
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 h-full flex flex-col justify-between p-6 rounded-3xl shadow-sm">
           <div>
              <div className="flex items-center gap-3 mb-12 px-2">
                 <div className="p-3 rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/20">
                    <Heart size={20} fill="currentColor" />
                 </div>
                 <div>
                    <h2 className="text-xl font-bold heading-font tracking-tight uppercase">EVAMP</h2>
                    <p className="text-[8px] font-black tracking-[0.3em] text-indigo-500 uppercase">Forever</p>
                 </div>
              </div>
              <NavContent />
           </div>
           
           <div className="space-y-3">
              <div className="p-2 space-y-1">
                 <button
                    onClick={toggleTheme}
                    className="w-full flex items-center justify-between px-3 py-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-all text-slate-500"
                 >
                    <div className="flex items-center gap-3">
                       <Settings2 size={16} />
                       <span className="text-[10px] font-bold uppercase tracking-widest">Theme</span>
                    </div>
                    {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
                 </button>

                 <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-between px-3 py-3 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
                 >
                    <div className="flex items-center gap-3">
                       <LogOut size={16} />
                       <span className="text-[10px] font-bold uppercase tracking-widest">Logout</span>
                    </div>
                    <ChevronRight size={14} />
                 </button>
              </div>

              <div className="text-center pt-2 border-t border-slate-100 dark:border-slate-700">
                 <p className="text-[9px] font-black tracking-[0.4em] text-slate-400 uppercase">
                    Barrack & Echo
                 </p>
              </div>
           </div>
        </div>
      </nav>

      {/* Mobile Bar - Plain */}
      <nav className="md:hidden fixed bottom-6 left-6 right-6 z-50">
         <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-[2rem] shadow-xl">
            <NavContent mobile={true} />
         </div>
      </nav>

      {/* Mobile Header - Plain */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 p-6">
         <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 flex items-center justify-between rounded-2xl shadow-sm">
            <div className="flex items-center gap-3">
               <Heart size={20} fill="currentColor" className="text-indigo-600" />
               <span className="text-lg font-bold heading-font tracking-tight uppercase">EVAMP</span>
            </div>
            <div className="flex gap-2">
               <button
                  onClick={toggleTheme}
                  className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
               >
                  {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
               </button>
            </div>
         </div>
      </div>
    </>
  );
};

export default Navigation;