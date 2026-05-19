/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  CheckCircle2, 
  Circle, 
  Clock, 
  Calendar, 
  Bell, 
  Sparkles, 
  X, 
  ChevronRight,
  TrendingUp,
  Brain,
  Timer,
  LayoutDashboard,
  Settings,
  MoreVertical,
  Trash2,
  Repeat,
  Lock,
  Unlock,
  Shield,
  Smartphone,
  Zap,
  Fingerprint
} from 'lucide-react';
import { Task, TaskSuggestion, LockedApp, OTPState } from './types';

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [lockedApps, setLockedApps] = useState<LockedApp[]>([]);
  const [otp, setOtp] = useState<OTPState | null>(null);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filter, setFilter] = useState<'all' | 'today' | 'upcoming'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [activeView, setActiveView] = useState<'dashboard' | 'locks' | 'schedule' | 'performance' | 'reflect' | 'settings'>('dashboard');

  // Local storage persistence
  useEffect(() => {
    const savedTasks = localStorage.getItem('focusflow_tasks');
    const savedLocks = localStorage.getItem('timelock_apps');

    if (savedLocks) {
      setLockedApps(JSON.parse(savedLocks));
    } else {
      const initialLocks: LockedApp[] = [
        { id: '1', name: 'Instagram', icon: 'camera', isLocked: true, unlockTime: '21:00', usageLimit: 30, category: 'social' },
        { id: '2', name: 'YouTube', icon: 'video', isLocked: true, unlockTime: '18:00', usageLimit: 60, category: 'entertainment' },
        { id: '3', name: 'Reddit', icon: 'message-circle', isLocked: false, unlockTime: '22:00', usageLimit: 15, category: 'social' },
      ];
      setLockedApps(initialLocks);
      localStorage.setItem('timelock_apps', JSON.stringify(initialLocks));
    }

    if (savedTasks) {
      try {
        let loadedTasks: Task[] = JSON.parse(savedTasks);
        
        // Recurring Tasks Maintenance Logic
        const now = new Date();
        const maintainedTasks = loadedTasks.map(task => {
          if (!task.recurrence || task.recurrence === 'none' || !task.isCompleted || !task.lastCompletedAt) {
            return task;
          }

          const lastCompleted = new Date(task.lastCompletedAt);
          const diffDays = Math.floor((now.getTime() - lastCompleted.getTime()) / (1000 * 3600 * 24));

          let shouldReset = false;
          if (task.recurrence === 'daily' && diffDays >= 1) {
            shouldReset = true;
          } else if (task.recurrence === 'alternate' && diffDays >= 2) {
            shouldReset = true;
          }

          if (shouldReset) {
            return { ...task, isCompleted: false };
          }
          return task;
        });

        setTasks(maintainedTasks);
      } catch (e) {
        console.error('Failed to load tasks', e);
      }
    } else {
      // Mock initial tasks for "cool" first look
      const initialTasks: Task[] = [
        {
          id: '1',
          title: 'Design high-fidelity UI for Task Hub',
          priority: 'high',
          isCompleted: false,
          category: 'work',
          createdAt: new Date().toISOString(),
          dueDate: new Date().toISOString(),
        },
        {
          id: '2',
          title: 'Daily workout - 30 mins cardio',
          priority: 'medium',
          isCompleted: true,
          category: 'health',
          createdAt: new Date().toISOString(),
          dueDate: new Date().toISOString(),
        },
        {
          id: '3',
          title: 'Review weekly progress and set next goals',
          priority: 'high',
          isCompleted: false,
          category: 'work',
          createdAt: new Date().toISOString(),
          dueDate: new Date(Date.now() + 86400000).toISOString(),
        }
      ];
      setTasks(initialTasks);
      localStorage.setItem('focusflow_tasks', JSON.stringify(initialTasks));
    }
  }, []);

  useEffect(() => {
    if (tasks.length > 0 || localStorage.getItem('focusflow_tasks')) {
      localStorage.setItem('focusflow_tasks', JSON.stringify(tasks));
    }
  }, [tasks]);

  const addTask = (title: string, priority: Task['priority'], dueDate?: string, recurrence: Task['recurrence'] = 'none') => {
    const newTask: Task = {
      id: Math.random().toString(36).substr(2, 9),
      title,
      priority,
      category: 'other',
      recurrence,
      isCompleted: false,
      createdAt: new Date().toISOString(),
      dueDate: dueDate || new Date().toISOString(),
    };
    setTasks([newTask, ...tasks]);
    setIsAddingTask(false);
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => {
      if (t.id === id) {
        const isNowCompleted = !t.isCompleted;
        return { 
          ...t, 
          isCompleted: isNowCompleted, 
          lastCompletedAt: isNowCompleted ? new Date().toISOString() : t.lastCompletedAt 
        };
      }
      return t;
    }));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const filteredTasks = useMemo(() => {
    let result = tasks.filter(t => 
      t.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (filter === 'today') {
      const today = new Date().toISOString().split('T')[0];
      result = result.filter(t => t.dueDate?.startsWith(today));
    } else if (filter === 'upcoming') {
      const today = new Date().toISOString().split('T')[0];
      result = result.filter(t => t.dueDate && t.dueDate > today);
    }

    return result.sort((a, b) => {
      if (a.isCompleted !== b.isCompleted) return a.isCompleted ? 1 : -1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [tasks, filter, searchQuery]);

  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.isCompleted).length;
    const pending = total - completed;
    const productivity = total === 0 ? 0 : Math.round((completed / total) * 100);
    return { total, completed, pending, productivity };
  }, [tasks]);

  const [suggestions, setSuggestions] = useState<TaskSuggestion[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

  useEffect(() => {
    if (showSuggestions) {
      fetchSuggestions();
    }
  }, [showSuggestions]);

  const fetchSuggestions = async () => {
    setIsLoadingSuggestions(true);
    try {
      const response = await fetch('/api/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentTasks: tasks.map(t => t.title) }),
      });
      const data = await response.json();
      setSuggestions(data);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      // Fallback suggestions
      setSuggestions([
        {
          title: "Focus Block: Deep Strategic Work",
          category: "work",
          priority: "high",
          reason: "Based on your 90% morning productivity peak."
        }
      ]);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0C0C0E] text-[#E4E3E0] font-sans overflow-x-hidden selection:bg-[#F27D26] selection:text-white">
      {/* Decorative Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[50%] bg-[#F27D26] opacity-[0.03] blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[35%] h-[45%] bg-[#4A4A4A] opacity-[0.05] blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 flex h-screen">
        {/* Sidebar */}
        <aside className="w-20 lg:w-64 border-r border-[#1C1C1F] flex flex-col items-center lg:items-start p-6 bg-[#0C0C0E]/80 backdrop-blur-md">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-[#F27D26] rounded-xl flex items-center justify-center shadow-lg shadow-[#F27D26]/20">
              <Timer className="w-6 h-6 text-white" />
            </div>
            <h1 className="hidden lg:block text-xl font-bold tracking-tight text-white">FocusHub</h1>
          </div>

          <nav className="flex-1 w-full space-y-2">
            <NavItem icon={<LayoutDashboard />} label="Dashboard" active={activeView === 'dashboard'} onClick={() => setActiveView('dashboard')} />
            <NavItem icon={<Shield />} label="TimeLock" active={activeView === 'locks'} onClick={() => setActiveView('locks')} />
            <NavItem icon={<Calendar />} label="Schedule" active={activeView === 'schedule'} onClick={() => setActiveView('schedule')} />
            <NavItem icon={<TrendingUp />} label="Performance" active={activeView === 'performance'} onClick={() => setActiveView('performance')} />
            <NavItem icon={<Brain />} label="Reflect" active={activeView === 'reflect'} onClick={() => setActiveView('reflect')} />
          </nav>

          <div className="pt-6 border-t border-[#1C1C1F] w-full">
            <NavItem icon={<Settings />} label="Settings" active={activeView === 'settings'} onClick={() => setActiveView('settings')} />
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Top Bar */}
          <header className="h-20 border-b border-[#1C1C1F] flex items-center justify-between px-8 bg-[#0C0C0E]/50 backdrop-blur-sm">
            <div className="flex items-center gap-4 flex-1">
              <div className="relative w-full max-w-md hidden md:block">
                <input 
                  type="text" 
                  placeholder="Scan tasks..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#151518] border border-[#1C1C1F] rounded-full py-2 px-10 text-sm focus:outline-none focus:border-[#F27D26]/50 transition-colors"
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30 text-xs">/</span>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <button className="relative p-2 text-[#8E9299] hover:text-[#F27D26] transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#F27D26] rounded-full border-2 border-[#0C0C0E]" />
              </button>
              <div className="flex items-center gap-3 border-l border-[#1C1C1F] pl-6 ml-2">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-white leading-none mb-1">Alex Riva</p>
                  <p className="text-[10px] text-[#8E9299] font-mono tracking-widest uppercase">Pro Dev</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#F27D26] to-[#FF4444] p-[1px]">
                  <div className="w-full h-full rounded-full bg-[#0C0C0E] flex items-center justify-center p-1 overflow-hidden">
                     <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex" alt="Avatar" className="w-full h-full object-cover" />
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Activity Scroll */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
            <div className="max-w-5xl mx-auto space-y-10">
              {activeView === 'dashboard' ? (
                <>
                  {/* Stats Overview */}
                  <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard label="Locked Assets" value={lockedApps.filter(a => a.isLocked).length} sub="Active restrictions" color="#ef4444" />
                    <StatCard label="Completed" value={stats.completed} sub="Tasks today" color="#22c55e" />
                    <StatCard label="Remaining" value={stats.pending} sub="Across boards" color="#F27D26" />
                    <div className="bg-[#151518] border border-[#1C1C1F] rounded-3xl p-6 flex flex-col justify-between overflow-hidden relative group">
                       <div className="z-10">
                          <p className="text-xs font-mono uppercase tracking-widest text-[#8E9299] mb-1">Discipline Engine</p>
                          <p className="text-sm text-white/80 leading-snug">AI detected 3 usage spikes in Social Ops</p>
                       </div>
                       <button 
                        onClick={() => setShowSuggestions(true)}
                        className="z-10 mt-4 flex items-center gap-2 text-[#F27D26] text-sm font-medium hover:gap-3 transition-all"
                       >
                         View Insights <ChevronRight className="w-4 h-4" />
                       </button>
                       <Zap className="absolute -bottom-2 -right-2 w-20 h-20 text-[#F27D26] opacity-[0.03] group-hover:opacity-[0.08] transition-opacity" />
                    </div>
                  </section>

                  {/* Active Locks Preview */}
                  <section className="bg-[#151518] border border-[#1C1C1F] rounded-[32px] p-8 overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#F27D26]/5 blur-3xl -translate-y-1/2 translate-x-1/2" />
                    <div className="flex items-center justify-between mb-8 relative z-10">
                      <div>
                        <h3 className="text-xl font-bold text-white mb-1">Current Restrictions</h3>
                        <p className="text-[#8E9299] text-sm">Apps scheduled for restricted access mode.</p>
                      </div>
                      <button 
                        onClick={() => setActiveView('locks')}
                        className="p-3 bg-[#1C1C1F] text-white rounded-2xl hover:bg-[#2C2C2F] transition-colors"
                      >
                         Manage Locks
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 relative z-10">
                      {lockedApps.map(app => (
                        <div key={app.id} className="bg-[#0C0C0E] border border-[#1C1C1F] p-5 rounded-2xl flex items-center gap-4">
                           <div className={`p-3 rounded-xl ${app.isLocked ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'}`}>
                             {app.isLocked ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />}
                           </div>
                           <div>
                             <p className="font-bold text-white leading-none mb-1">{app.name}</p>
                             <p className="text-[10px] font-mono text-[#8E9299] uppercase tracking-widest">Until {app.unlockTime}</p>
                           </div>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Task Section Header */}
                  <section className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
                    <div>
                      <h2 className="text-3xl font-bold tracking-tight text-white mb-1">Focus List</h2>
                      <p className="text-[#8E9299]">Discipline is the root of all success.</p>
                    </div>
                    <div className="flex items-center bg-[#151518] p-1 rounded-xl border border-[#1C1C1F]">
                      <FilterBtn label="All" active={filter === 'all'} onClick={() => setFilter('all')} />
                      <FilterBtn label="Today" active={filter === 'today'} onClick={() => setFilter('today')} />
                      <FilterBtn label="Upcoming" active={filter === 'upcoming'} onClick={() => setFilter('upcoming')} />
                    </div>
                  </section>

                  {/* Task Grid */}
                  <section className="space-y-4 pb-12">
                    <AnimatePresence mode="popLayout">
                      {filteredTasks.length === 0 ? (
                        <motion.div 
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-center py-20 border-2 border-dashed border-[#1C1C1F] rounded-3xl"
                        >
                          <div className="w-16 h-16 bg-[#151518] rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle2 className="w-8 h-8 text-[#8E9299] opacity-20" />
                          </div>
                          <p className="text-[#8E9299]">The grid is operational. Awaiting command.</p>
                        </motion.div>
                      ) : (
                        filteredTasks.map((task, idx) => (
                          <TaskCard 
                            key={task.id} 
                            task={task} 
                            onToggle={() => toggleTask(task.id)}
                            onDelete={() => deleteTask(task.id)}
                            index={idx}
                          />
                        ))
                      )}
                    </AnimatePresence>
                  </section>
                </>
              ) : activeView === 'locks' ? (
                <TimeLockView 
                  lockedApps={lockedApps} 
                  otp={otp} 
                  generateOTP={(appId) => {
                    const code = Math.floor(100000 + Math.random() * 900000).toString();
                    setOtp({ code, expiresAt: new Date(Date.now() + 300000).toISOString(), isAvailable: true, targetAppId: appId });
                  }}
                  onUnlock={(appId) => {
                    setLockedApps(lockedApps.map(a => a.id === appId ? { ...a, isLocked: false } : a));
                    setOtp(null);
                  }}
                />
              ) : (
                <ViewPlaceholder label={activeView} />
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Suggestion Box Button (Floating Action) */}
      <button 
        onClick={() => setIsAddingTask(true)}
        className="fixed bottom-8 right-8 w-16 h-16 bg-[#F27D26] text-white rounded-full flex items-center justify-center shadow-2xl shadow-[#F27D26]/40 hover:scale-110 active:scale-95 transition-all z-50 group"
      >
        <Plus className="w-8 h-8 group-hover:rotate-90 transition-transform duration-300" />
      </button>

      {/* Suggestion Sidebar Trigger */}
      <button 
        onClick={() => setShowSuggestions(true)}
        className="fixed left-72 bottom-8 hidden lg:flex items-center gap-3 bg-[#151518] border border-[#1C1C1F] py-3 px-6 rounded-2xl hover:border-[#F27D26]/30 transition-all z-50"
      >
        <Brain className="w-5 h-5 text-[#F27D26]" />
        <span className="text-sm font-medium">Smart Suggestion Box</span>
      </button>

      {/* Add Task Modal */}
      <AnimatePresence>
        {isAddingTask && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddingTask(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-[#151518] border border-[#1C1C1F] rounded-[32px] p-8 shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#F27D26]/10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />
              
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold text-white">New Objective</h3>
                <button onClick={() => setIsAddingTask(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <TaskForm onSubmit={addTask} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Smart Suggestion Box Modal */}
      <AnimatePresence>
        {showSuggestions && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
             <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSuggestions(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              className="relative w-full max-w-xl h-[80vh] bg-[#0C0C0E] border border-[#1C1C1F] rounded-[40px] shadow-2xl flex flex-col overflow-hidden"
            >
              <header className="p-8 border-b border-[#1C1C1F] flex items-center justify-between bg-[#151518]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#F27D26]/10 flex items-center justify-center">
                    <Brain className="w-5 h-5 text-[#F27D26]" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white leading-tight">Suggestion Box</h2>
                    <p className="text-xs text-[#8E9299]">AI optimized tasks for your flow</p>
                  </div>
                </div>
                <button onClick={() => setShowSuggestions(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </header>

              <div className="flex-1 overflow-y-auto p-8 space-y-6">
                {isLoadingSuggestions ? (
                  <div className="flex flex-col items-center justify-center h-full gap-4">
                    <div className="w-12 h-12 border-4 border-[#F27D26] border-t-transparent rounded-full animate-spin" />
                    <p className="text-[#8E9299] text-sm animate-pulse">Scanning goal nodes...</p>
                  </div>
                ) : suggestions.length === 0 ? (
                   <div className="text-center py-20">
                      <p className="text-[#8E9299]">No suggestions available right now.</p>
                   </div>
                ) : (
                  suggestions.map((suggestion, idx) => (
                    <AiSuggestionItem 
                      key={idx}
                      suggestion={suggestion}
                      onAccept={() => {
                        addTask(suggestion.title, suggestion.priority, new Date(Date.now() + 86400000).toISOString());
                        setShowSuggestions(false);
                      }}
                    />
                  ))
                )}
              </div>

              <footer className="p-8 border-t border-[#1C1C1F] bg-[#151518]/50">
                <p className="text-xs text-center text-[#8E9299]">
                  Suggestions are refreshed based on your daily biological rhythm.
                </p>
              </footer>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function NavItem({ icon, label, active = false, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`
      w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all group
      ${active ? 'bg-[#F27D26]/10 text-[#F27D26]' : 'text-[#8E9299] hover:text-white hover:bg-[#151518]'}
    `}>
      <span className={`w-5 h-5 ${active ? 'text-[#F27D26]' : 'opacity-70 group-hover:opacity-100'}`}>{icon}</span>
      <span className="hidden lg:block text-sm font-medium">{label}</span>
      {active && <div className="hidden lg:block ml-auto w-1.5 h-1.5 bg-[#F27D26] rounded-full shadow-[0_0_8px_#F27D26]" />}
    </button>
  );
}

function ViewPlaceholder({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-32 text-center">
      <div className="w-20 h-20 bg-[#151518] border border-[#1C1C1F] rounded-3xl flex items-center justify-center mb-6 animate-float">
        {label === 'schedule' && <Calendar className="w-10 h-10 text-[#F27D26]" />}
        {label === 'performance' && <TrendingUp className="w-10 h-10 text-[#F27D26]" />}
        {label === 'reflect' && <Brain className="w-10 h-10 text-[#F27D26]" />}
        {label === 'settings' && <Settings className="w-10 h-10 text-[#F27D26]" />}
      </div>
      <h3 className="text-2xl font-bold text-white mb-2 uppercase tracking-tighter">
        {label} Terminal
      </h3>
      <p className="text-[#8E9299] max-w-sm">
        This specialized dashboard module is currently initializing. Stay tuned for advanced discipline analytics.
      </p>
    </div>
  );
}

function TimeLockView({ 
  lockedApps, 
  otp, 
  generateOTP, 
  onUnlock 
}: { 
  lockedApps: LockedApp[], 
  otp: OTPState | null, 
  generateOTP: (id: string) => void,
  onUnlock: (id: string) => void
}) {
  const [typedOtp, setTypedOtp] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const handleVerify = () => {
    if (otp && typedOtp === otp.code) {
      setIsVerifying(true);
      setTimeout(() => {
        if (otp.targetAppId) onUnlock(otp.targetAppId);
        setIsVerifying(false);
        setTypedOtp('');
      }, 1500);
    }
  };

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white mb-1">TimeLock Control</h2>
          <p className="text-[#8E9299]">Neural habits reorganization interface.</p>
        </div>
        <div className="bg-red-500/10 border border-red-500/20 px-6 py-3 rounded-2xl flex items-center gap-3">
          <Shield className="w-5 h-5 text-red-400" />
          <span className="text-sm font-bold text-red-400">Restricted Ops Active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {lockedApps.map(app => (
              <motion.div 
                key={app.id}
                whileHover={{ y: -4 }}
                className={`p-6 rounded-[32px] border transition-all ${
                  app.isLocked 
                  ? 'bg-[#151518] border-[#1C1C1F] hover:border-red-500/30' 
                  : 'bg-green-500/5 border-green-500/20 shadow-lg shadow-green-500/5'
                }`}
              >
                <div className="flex items-center justify-between mb-6">
                   <div className={`p-4 rounded-2xl ${app.isLocked ? 'bg-[#0C0C0E] text-[#8E9299]' : 'bg-green-500/10 text-green-400'}`}>
                     <Smartphone className="w-6 h-6" />
                   </div>
                   {app.isLocked ? (
                     <button 
                      onClick={() => generateOTP(app.id)}
                      className="text-xs font-mono uppercase tracking-[0.2em] text-[#F27D26] hover:text-[#FF4444] transition-colors"
                     >
                       Request Unlock
                     </button>
                   ) : (
                     <span className="text-xs font-mono uppercase tracking-[0.2em] text-green-400">Status: Free</span>
                   )}
                </div>
                <h4 className="text-xl font-bold text-white mb-1">{app.name}</h4>
                <p className="text-sm text-[#8E9299] mb-4">Locked until {app.unlockTime}</p>
                <div className="h-1 w-full bg-[#0C0C0E] rounded-full overflow-hidden">
                   <div className={`h-full ${app.isLocked ? 'bg-red-500' : 'bg-green-500'}`} style={{ width: app.isLocked ? '70%' : '100%' }} />
                </div>
              </motion.div>
            ))}
          </div>

          <div className="bg-[#151518] border border-[#1C1C1F] p-8 rounded-[40px] flex items-center justify-between gap-8 group">
            <div className="space-y-2">
              <h4 className="text-xl font-bold text-white">Daily Discipline Streak</h4>
              <p className="text-[#8E9299]">You have honored 12/14 focus windows this week.</p>
              <div className="flex gap-2 pt-2">
                 {[1,2,3,4,5,6,7].map(d => (
                   <div key={d} className={`w-8 h-1.5 rounded-full ${d < 6 ? 'bg-[#F27D26]' : 'bg-[#1C1C1F]'}`} />
                 ))}
              </div>
            </div>
            <div className="w-24 h-24 rounded-full border-4 border-[#1C1C1F] border-t-[#F27D26] flex items-center justify-center relative group-hover:rotate-12 transition-transform">
               <span className="text-2xl font-bold text-white">84%</span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-[#151518] border border-[#1C1C1F] p-8 rounded-[40px] shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#F27D26] to-[#FF4444]" />
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-[#F27D26]/10 rounded-full flex items-center justify-center">
                <Fingerprint className="w-5 h-5 text-[#F27D26]" />
              </div>
              <h3 className="text-lg font-bold text-white">OTP Terminal</h3>
            </div>

            {otp ? (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                <div className="text-center">
                   <p className="text-[10px] font-mono text-[#8E9299] uppercase tracking-widest mb-4">Verification Code Required</p>
                   <div className="flex gap-2 justify-center mb-8">
                      {otp.code.split('').map((char, i) => (
                        <div key={i} className="w-10 h-12 bg-[#0C0C0E] border border-[#1C1C1F] rounded-xl flex items-center justify-center text-xl font-bold text-white shadow-inner">
                           {typedOtp[i] || '•'}
                        </div>
                      ))}
                   </div>
                </div>

                <input 
                  type="text" 
                  autoFocus
                  maxLength={6}
                  value={typedOtp}
                  onChange={(e) => setTypedOtp(e.target.value.replace(/\D/g, ''))}
                  className="w-full bg-[#0C0C0E] border border-[#1C1C1F] rounded-2xl py-4 px-6 text-white text-center text-2xl font-mono tracking-[0.5em] focus:outline-none focus:border-[#F27D26]/50 mb-4"
                  placeholder="000000"
                />

                <button 
                  onClick={handleVerify}
                  disabled={typedOtp.length < 6 || isVerifying}
                  className="w-full bg-white text-black py-4 rounded-2xl font-bold hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:grayscale"
                >
                  {isVerifying ? 'Verifying Neural ID...' : 'Authorize Temporary Access'}
                </button>
                
                <p className="text-[10px] text-center text-[#8E9299] uppercase tracking-widest font-mono">
                  OTP Expires in 04:59
                </p>
              </div>
            ) : (
              <div className="text-center py-12">
                <Lock className="w-12 h-12 text-[#1C1C1F] mx-auto mb-4" />
                <p className="text-[#8E9299] text-sm">Terminal Idle. Request access from a locked asset to begin verification.</p>
              </div>
            )}
          </div>

          <div className="p-6 bg-gradient-to-br from-[#F27D26]/10 to-[#FF4444]/10 border border-[#F27D26]/20 rounded-[32px] space-y-4">
            <h5 className="font-bold text-white flex items-center gap-2">
              <Brain className="w-4 h-4 text-[#F27D26]" /> Daily Reflection
            </h5>
            <p className="text-xs text-white/70 leading-relaxed uppercase tracking-wide">
              "Action is the foundational key to all success. Digital discipline is the armor of the modern mind."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, color }: { label: string, value: string | number, sub: string, color: string }) {
  return (
    <div className="bg-[#151518] border border-[#1C1C1F] rounded-3xl p-6 hover:border-[#1C1C1F]/80 transition-colors">
      <div className="flex items-center justify-between mb-4">
        <span className="text-[10px] font-mono text-[#8E9299] uppercase tracking-widest">{label}</span>
        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color, boxShadow: `0 0 10px ${color}` }} />
      </div>
      <p className="text-3xl font-bold text-white mb-1">{value}</p>
      <p className="text-xs text-[#8E9299]">{sub}</p>
    </div>
  );
}

function FilterBtn({ label, active, onClick }: { label: string, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${active ? 'bg-[#0C0C0E] text-[#F27D26] shadow-sm' : 'text-[#8E9299] hover:text-white'}`}
    >
      {label}
    </button>
  );
}

interface TaskCardProps {
  key?: React.Key;
  task: Task;
  onToggle: () => void;
  onDelete: () => void;
  index: number;
}

function TaskCard({ task, onToggle, onDelete, index }: TaskCardProps) {
  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2, delay: index * 0.05 }}
      whileHover={{ y: -2 }}
      className={`
        group relative flex items-center gap-4 p-5 md:p-6 bg-[#151518] border border-[#1C1C1F] rounded-3xl transition-all
        hover:bg-[#18181B] hover:border-[#F27D26]/20
        ${task.isCompleted ? 'opacity-60' : ''}
      `}
    >
      <button 
        onClick={onToggle}
        className={`
          flex-shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all
          ${task.isCompleted ? 'bg-[#F27D26] border-[#F27D26]' : 'border-[#1C1C1F] text-transparent hover:border-[#F27D26]'}
        `}
      >
        <CheckCircle2 className={`w-4 h-4 text-white ${task.isCompleted ? 'scale-100' : 'scale-0'} transition-transform`} />
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className={`text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded bg-white/5 ${
            task.priority === 'high' ? 'text-red-400' : task.priority === 'medium' ? 'text-orange-400' : 'text-blue-400'
          }`}>
            {task.priority}
          </span>
          {task.dueDate && (
            <span className="flex items-center gap-1 text-[10px] font-mono text-[#8E9299] uppercase tracking-widest">
              <Clock className="w-3 h-3" />
              {new Date(task.dueDate).toLocaleDateString([], { month: 'short', day: 'numeric' })} {' '}
              {new Date(task.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
          {task.recurrence && task.recurrence !== 'none' && (
            <span className="flex items-center gap-1 text-[10px] font-mono text-[#F27D26] uppercase tracking-widest ml-2">
              <Repeat className="w-3 h-3" />
              {task.recurrence}
            </span>
          )}
        </div>
        <h3 className={`text-lg font-medium text-white truncate transition-all ${task.isCompleted ? 'line-through opacity-50' : ''}`}>
          {task.title}
        </h3>
      </div>

      <div className="flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={onDelete} className="p-2 text-[#8E9299] hover:text-red-500 transition-colors">
          <Trash2 className="w-5 h-5" />
        </button>
        <div className="text-[#8E9299] hover:text-white cursor-pointer p-2">
          <MoreVertical className="w-5 h-5" />
        </div>
      </div>
    </motion.div>
  );
}

function TaskForm({ onSubmit }: { onSubmit: (title: string, priority: Task['priority'], dueDate: string, recurrence: Task['recurrence']) => void }) {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<Task['priority']>('medium');
  const [recurrence, setRecurrence] = useState<Task['recurrence']>('none');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('12:00');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    
    const dueDateTime = new Date(`${date}T${time}`).toISOString();
    onSubmit(title, priority, dueDateTime, recurrence);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label className="text-xs font-mono uppercase tracking-widest text-[#8E9299]">Objective Name</label>
        <input 
          autoFocus
          className="w-full bg-[#0C0C0E] border border-[#1C1C1F] rounded-2xl py-4 px-6 text-white text-lg focus:outline-none focus:border-[#F27D26]/50 transition-colors"
          placeholder="What's the mission?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-xs font-mono uppercase tracking-widest text-[#8E9299]">Priority</label>
          <select 
            className="w-full bg-[#0C0C0E] border border-[#1C1C1F] rounded-2xl py-3 px-4 text-white focus:outline-none focus:border-[#F27D26]/50 appearance-none"
            value={priority}
            onChange={(e) => setPriority(e.target.value as any)}
          >
            <option value="low">Low Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="high">High Priority</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-mono uppercase tracking-widest text-[#8E9299]">Target Date</label>
          <input 
            type="date"
            className="w-full bg-[#0C0C0E] border border-[#1C1C1F] rounded-2xl py-3 px-4 text-white focus:outline-none focus:border-[#F27D26]/50"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-mono uppercase tracking-widest text-[#8E9299]">Completion Time</label>
        <input 
          type="time"
          className="w-full bg-[#0C0C0E] border border-[#1C1C1F] rounded-2xl py-3 px-4 text-white focus:outline-none focus:border-[#F27D26]/50"
          value={time}
          onChange={(e) => setTime(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <label className="text-xs font-mono uppercase tracking-widest text-[#8E9299]">Recurrence</label>
        <select 
          className="w-full bg-[#0C0C0E] border border-[#1C1C1F] rounded-2xl py-3 px-4 text-white focus:outline-none focus:border-[#F27D26]/50 appearance-none"
          value={recurrence}
          onChange={(e) => setRecurrence(e.target.value as any)}
        >
          <option value="none">One-time</option>
          <option value="daily">Daily Pulse</option>
          <option value="alternate">Alternate Days</option>
        </select>
      </div>

      <button 
        type="submit"
        disabled={!title}
        className="w-full bg-[#F27D26] text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-[#F27D26]/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:hover:scale-100"
      >
        Initialize Task
      </button>
    </form>
  );
}

interface AiSuggestionItemProps {
  key?: React.Key;
  suggestion: TaskSuggestion;
  onAccept: () => void;
}

function AiSuggestionItem({ suggestion, onAccept }: AiSuggestionItemProps) {
  return (
    <div className="group bg-[#151518] border border-[#1C1C1F] rounded-[32px] p-6 hover:border-[#F27D26]/30 transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded bg-white/5 ${
            suggestion.priority === 'high' ? 'text-red-400' : 'text-orange-400'
          }`}>
            {suggestion.priority}
          </span>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-[#F27D26] font-mono uppercase tracking-widest">
           <Sparkles className="w-3 h-3" /> Recommended
        </div>
      </div>
      
      <h3 className="text-xl font-medium text-white mb-2 group-hover:text-[#F27D26] transition-colors">{suggestion.title}</h3>
      <p className="text-sm text-[#8E9299] mb-6 leading-relaxed bg-[#0C0C0E]/50 p-4 rounded-2xl italic">
        "{suggestion.reason}"
      </p>

      <div className="flex items-center gap-3">
        <button 
          onClick={onAccept}
          className="flex-1 bg-white text-black py-3 rounded-2xl font-bold text-sm hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          Add to Focus List
        </button>
        <button className="px-6 py-3 border border-[#1C1C1F] text-[#8E9299] rounded-2xl font-bold text-sm hover:text-white hover:border-white transition-all">
          Dismiss
        </button>
      </div>
    </div>
  );
}
