import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, 
  Moon, 
  Sun, 
  Trash2, 
  History, 
  MessageCircle, 
  Heart, 
  Wind, 
  Coffee, 
  Sparkles,
  AlertCircle,
  Settings,
  Palette,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import Markdown from 'react-markdown';
import { format } from 'date-fns';
import { analyzeSentimentAndRespond } from './services/geminiService';
import { cn } from './lib/utils';
import { Message, MoodEntry } from './types';

const MOOD_EMOJIS: Record<string, string> = {
  Happy: '😊',
  Neutral: '😐',
  Stressed: '😟',
  Sad: '😢',
  Anxious: '😰',
  Angry: '😠',
};

const MOOD_VALUES: Record<string, number> = {
  Happy: 5,
  Neutral: 3,
  Stressed: 2,
  Sad: 1,
  Anxious: 1.5,
  Angry: 1,
};

const THEMES = {
  emerald: {
    primary: 'emerald',
    bg: 'bg-emerald-600',
    text: 'text-emerald-500',
    shadow: 'shadow-emerald-600/20',
    border: 'border-emerald-500/50',
    glow: 'bg-emerald-500/10'
  },
  indigo: {
    primary: 'indigo',
    bg: 'bg-indigo-600',
    text: 'text-indigo-500',
    shadow: 'shadow-indigo-600/20',
    border: 'border-indigo-500/50',
    glow: 'bg-indigo-500/10'
  },
  rose: {
    primary: 'rose',
    bg: 'bg-rose-600',
    text: 'text-rose-500',
    shadow: 'shadow-rose-600/20',
    border: 'border-rose-500/50',
    glow: 'bg-rose-500/10'
  },
  amber: {
    primary: 'amber',
    bg: 'bg-amber-600',
    text: 'text-amber-500',
    shadow: 'shadow-amber-600/20',
    border: 'border-amber-500/50',
    glow: 'bg-amber-500/10'
  }
};

const BUBBLE_STYLES = {
  rounded: 'rounded-3xl',
  sharp: 'rounded-lg',
  playful: 'rounded-[2rem]'
};

const MeditationSession = ({ onClose }: { onClose: () => void }) => {
  const [step, setStep] = useState(0);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [isActive, setIsActive] = useState(false);

  const steps = [
    "Find a comfortable position and gently close your eyes.",
    "Take a deep breath in through your nose, and out through your mouth.",
    "Notice the weight of your body against the chair or floor.",
    "If your mind wanders, gently bring it back to your breath.",
    "Feel the air entering your lungs and leaving your body.",
    "You are safe, you are present, and you are enough.",
    "When you're ready, slowly open your eyes."
  ];

  useEffect(() => {
    let interval: any;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
        if (timeLeft % 45 === 0 && step < steps.length - 1) {
          setStep(s => s + 1);
        }
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, step]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-xl p-6"
    >
      <div className="max-w-xl w-full text-center">
        <div className="mb-12">
          <div className="text-6xl font-serif font-bold text-amber-500 mb-4">{formatTime(timeLeft)}</div>
          <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: "0%" }}
              animate={{ width: `${((300 - timeLeft) / 300) * 100}%` }}
              className="h-full bg-amber-500"
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="min-h-[120px] flex items-center justify-center"
          >
            <p className="text-2xl font-serif italic text-slate-200 leading-relaxed">
              "{steps[step]}"
            </p>
          </motion.div>
        </AnimatePresence>

        <div className="flex items-center justify-center gap-6 mt-12">
          <button 
            onClick={() => setIsActive(!isActive)}
            className="w-16 h-16 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center hover:scale-110 transition-transform"
          >
            {isActive ? <Pause size={32} /> : <Play size={32} className="ml-1" />}
          </button>
          <button 
            onClick={() => { setTimeLeft(300); setStep(0); setIsActive(false); }}
            className="w-12 h-12 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-all"
          >
            <RotateCcw size={20} />
          </button>
        </div>

        <button 
          onClick={onClose}
          className="mt-12 px-8 py-3 text-slate-400 hover:text-white transition-colors"
        >
          Close Meditation
        </button>
      </div>
    </motion.div>
  );
};

const BreathingExercise = ({ onClose }: { onClose: () => void }) => {
  const [phase, setPhase] = useState<'Inhale' | 'Hold' | 'Exhale'>('Inhale');
  const [count, setCount] = useState(4);

  useEffect(() => {
    const timer = setInterval(() => {
      setCount((prev) => {
        if (prev === 1) {
          if (phase === 'Inhale') {
            setPhase('Hold');
            return 7;
          } else if (phase === 'Hold') {
            setPhase('Exhale');
            return 8;
          } else {
            setPhase('Inhale');
            return 4;
          }
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [phase]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-6"
    >
      <div className="max-w-md w-full text-center">
        <motion.div
          animate={{ 
            scale: phase === 'Inhale' ? [1, 1.5] : phase === 'Hold' ? 1.5 : [1.5, 1],
          }}
          transition={{ 
            duration: phase === 'Inhale' ? 4 : phase === 'Hold' ? 7 : 8,
            ease: "easeInOut"
          }}
          className="w-48 h-48 rounded-full bg-emerald-500/20 border-2 border-emerald-500/50 mx-auto flex items-center justify-center mb-12 relative"
        >
          <div className="absolute inset-0 rounded-full bg-emerald-500/10 animate-ping" />
          <span className="text-6xl font-serif font-bold text-emerald-500">{count}</span>
        </motion.div>
        
        <h2 className="text-4xl font-serif font-bold mb-2">{phase}</h2>
        <p className="text-slate-400 mb-12">Focus on your breath. Let everything else fade away.</p>
        
        <button 
          onClick={onClose}
          className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all border border-white/10"
        >
          End Session
        </button>
      </div>
    </motion.div>
  );
};

export default function App() {
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'chat' | 'history'>('chat');
  const [darkMode, setDarkMode] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [moodHistory, setMoodHistory] = useState<MoodEntry[]>([]);
  const [showBreathing, setShowBreathing] = useState(false);
  const [showMeditation, setShowMeditation] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [themeColor, setThemeColor] = useState<keyof typeof THEMES>('emerald');
  const [bubbleStyle, setBubbleStyle] = useState<keyof typeof BUBBLE_STYLES>('playful');
  const [historyFilter, setHistoryFilter] = useState<'all' | 'week' | 'month'>('all');

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchData();
    const savedTheme = localStorage.getItem('theme');
    const savedColor = localStorage.getItem('themeColor') as keyof typeof THEMES;
    const savedBubble = localStorage.getItem('bubbleStyle') as keyof typeof BUBBLE_STYLES;
    
    if (savedTheme === 'dark') setDarkMode(true);
    if (savedColor && THEMES[savedColor]) setThemeColor(savedColor);
    if (savedBubble && BUBBLE_STYLES[savedBubble]) setBubbleStyle(savedBubble);
    
    setLoading(false);
  }, []);

  useEffect(() => {
    localStorage.setItem('themeColor', themeColor);
  }, [themeColor]);

  useEffect(() => {
    localStorage.setItem('bubbleStyle', bubbleStyle);
  }, [bubbleStyle]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, isTyping]);

  const fetchData = async () => {
    try {
      const [chatRes, moodRes] = await Promise.all([
        fetch('/api/chats'),
        fetch('/api/moods')
      ]);
      if (chatRes.ok) setMessages(await chatRes.json());
      if (moodRes.ok) setMoodHistory(await moodRes.json());
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    fetch('/api/chats', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userMessage),
    });

    const response = await analyzeSentimentAndRespond(input, messages.map(m => ({ role: m.role, content: m.content })));
    
    const botMessage: Message = {
      role: 'bot',
      content: response.response,
      timestamp: new Date().toISOString(),
      mood: response.mood
    };

    setMessages(prev => [...prev, botMessage]);
    setIsTyping(false);

    fetch('/api/chats', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(botMessage),
    });

    fetch('/api/moods', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mood: response.mood }),
    }).then(() => fetchData());
  };

  const clearChat = async () => {
    if (confirm('Are you sure you want to clear your chat history?')) {
      await fetch('/api/chats', { method: 'DELETE' });
      setMessages([]);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-mesh">
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-16 h-16 rounded-3xl bg-emerald-500/20 flex items-center justify-center text-emerald-500"
        >
          <Heart size={32} fill="currentColor" />
        </motion.div>
      </div>
    );
  }

  const currentTheme = THEMES[themeColor];

  const filteredMoodHistory = moodHistory.filter(entry => {
    if (historyFilter === 'all') return true;
    const date = new Date(entry.timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = diff / (1000 * 60 * 60 * 24);
    if (historyFilter === 'week') return days <= 7;
    if (historyFilter === 'month') return days <= 30;
    return true;
  });

  const averageMoodScore = filteredMoodHistory.length > 0
    ? (filteredMoodHistory.reduce((acc, curr) => acc + (MOOD_VALUES[curr.mood] || 3), 0) / filteredMoodHistory.length).toFixed(1)
    : '0.0';

  const chartData = filteredMoodHistory.map(entry => ({
    time: format(new Date(entry.timestamp), 'MMM d'),
    value: MOOD_VALUES[entry.mood] || 3,
    mood: entry.mood
  }));

  return (
    <div className="min-h-screen bg-mesh text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-500">
      {/* Header */}
      <header className="glass px-6 py-4 flex items-center justify-between sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-4">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20"
          >
            <Heart size={24} fill="currentColor" />
          </motion.div>
          <div>
            <h1 className="font-serif font-bold text-2xl tracking-tight leading-none">MindfulMate</h1>
            <p className="text-[10px] uppercase tracking-[0.2em] font-semibold text-slate-500 dark:text-slate-400 mt-1">Student Companion</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all text-slate-600 dark:text-slate-400 border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
            title="Appearance Settings"
          >
            <Palette size={20} />
          </button>
          <button 
            onClick={() => setView(view === 'chat' ? 'history' : 'chat')}
            className="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all text-slate-600 dark:text-slate-400 border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
            title={view === 'chat' ? 'Mood History' : 'Back to Chat'}
          >
            {view === 'chat' ? <History size={20} /> : <MessageCircle size={20} />}
          </button>
          <button 
            onClick={() => setDarkMode(!darkMode)}
            className="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all text-slate-600 dark:text-slate-400 border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>

        {/* Settings Overlay */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-20 right-6 w-72 glass rounded-3xl p-6 shadow-2xl z-50 border border-white/20"
            >
              <h3 className="font-serif font-bold text-lg mb-4 flex items-center gap-2">
                <Settings size={18} />
                Appearance
              </h3>
              
              <div className="space-y-6">
                <div>
                  <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-3">Theme Color</p>
                  <div className="flex gap-3">
                    {Object.entries(THEMES).map(([key, theme]) => (
                      <button
                        key={key}
                        onClick={() => setThemeColor(key as any)}
                        className={cn(
                          "w-8 h-8 rounded-full border-2 transition-all",
                          theme.bg,
                          themeColor === key ? "border-slate-900 dark:border-white scale-110" : "border-transparent opacity-60 hover:opacity-100"
                        )}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-3">Bubble Style</p>
                  <div className="grid grid-cols-3 gap-2">
                    {Object.entries(BUBBLE_STYLES).map(([key, style]) => (
                      <button
                        key={key}
                        onClick={() => setBubbleStyle(key as any)}
                        className={cn(
                          "px-2 py-2 text-[10px] font-bold uppercase tracking-tighter border rounded-xl transition-all",
                          bubbleStyle === key 
                            ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-transparent" 
                            : "border-slate-200 dark:border-slate-700 text-slate-500"
                        )}
                      >
                        {key}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto p-4 md:p-8 flex flex-col overflow-hidden relative">
        <AnimatePresence mode="wait">
          {view === 'chat' ? (
            <motion.div 
              key="chat"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              className="flex-1 flex flex-col overflow-hidden"
            >
              {/* Chat Window */}
              <div 
                ref={scrollRef}
                className="flex-1 overflow-y-auto space-y-8 pr-4 custom-scrollbar pb-8"
              >
                {messages.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-center p-12">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-6 mx-auto">
                        <Sparkles size={40} />
                      </div>
                      <h2 className="text-3xl font-serif font-medium mb-4">Hello, friend.</h2>
                      <p className="max-w-md text-slate-500 dark:text-slate-400 leading-relaxed">
                        I'm here to listen, support, and help you navigate through student life stress. 
                        How are you feeling in this moment?
                      </p>
                    </motion.div>
                  </div>
                )}
                
                <AnimatePresence initial={false}>
                  {messages.map((msg, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      className={cn(
                        "flex flex-col max-w-[80%]",
                        msg.role === 'user' ? "ml-auto items-end" : "items-start"
                      )}
                    >
                      <div className={cn(
                        "px-6 py-4 shadow-sm text-sm md:text-base leading-relaxed",
                        BUBBLE_STYLES[bubbleStyle],
                        msg.role === 'user' 
                          ? `${currentTheme.bg} text-white rounded-tr-none ${currentTheme.shadow}` 
                          : "glass rounded-tl-none shadow-slate-200/50 dark:shadow-none"
                      )}>
                        <div className="prose dark:prose-invert max-w-none">
                          <Markdown>{msg.content}</Markdown>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 mt-2 px-2">
                        <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                          {format(new Date(msg.timestamp), 'HH:mm')}
                        </span>
                        {msg.mood && (
                          <span className="text-[10px] uppercase tracking-wider font-bold bg-white/50 dark:bg-slate-800/50 px-3 py-1 rounded-full flex items-center gap-1.5 border border-slate-200/50 dark:border-slate-700/50">
                            <span className="text-sm">{MOOD_EMOJIS[msg.mood]}</span>
                            {msg.mood}
                          </span>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {isTyping && (
                  <div className="flex items-center gap-3 text-slate-400 ml-2">
                    <div className="w-10 h-10 rounded-2xl glass flex items-center justify-center">
                      <Sparkles size={18} className="animate-pulse text-emerald-500" />
                    </div>
                    <div className="flex gap-1.5">
                      <span className="w-2 h-2 bg-emerald-500/40 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                      <span className="w-2 h-2 bg-emerald-500/40 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                      <span className="w-2 h-2 bg-emerald-500/40 rounded-full animate-bounce"></span>
                    </div>
                  </div>
                )}
              </div>

              {/* Input Area */}
              <div className="mt-6 glass rounded-[2.5rem] p-3 shadow-2xl shadow-slate-200/50 dark:shadow-none">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <button 
                    type="button"
                    onClick={clearChat}
                    className="p-4 text-slate-400 hover:text-red-500 transition-all hover:bg-red-50 dark:hover:bg-red-900/10 rounded-full"
                    title="Clear Chat"
                  >
                    <Trash2 size={20} />
                  </button>
                  <input 
                    type="text"
                    placeholder="Share what's on your mind..."
                    className="flex-1 bg-transparent border-none outline-none px-4 py-3 text-base placeholder:text-slate-400"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    disabled={isTyping}
                  />
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    disabled={!input.trim() || isTyping}
                    className={cn(
                      "p-4 text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg",
                      currentTheme.bg,
                      currentTheme.shadow
                    )}
                  >
                    <Send size={20} />
                  </motion.button>
                </form>
              </div>
              
              <p className="text-[10px] text-center mt-4 text-slate-400 uppercase tracking-widest font-bold flex items-center justify-center gap-2">
                <AlertCircle size={12} />
                Support only • Not a replacement for professional care
              </p>
            </motion.div>
          ) : (
            <motion.div 
              key="history"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex-1 flex flex-col gap-8 overflow-y-auto pr-2 custom-scrollbar"
            >
              <div className="flex items-end justify-between">
                <div>
                  <h2 className="text-4xl font-serif font-bold">Your Journey</h2>
                  <p className="text-slate-500 dark:text-slate-400 mt-2">Visualizing your emotional landscape over time.</p>
                </div>
                <div className="flex flex-col items-end gap-3">
                  <div className="flex gap-2 bg-white/30 dark:bg-slate-800/30 p-1 rounded-2xl border border-white/20">
                    {(['all', 'week', 'month'] as const).map((f) => (
                      <button
                        key={f}
                        onClick={() => setHistoryFilter(f)}
                        className={cn(
                          "px-4 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all",
                          historyFilter === f 
                            ? "bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white" 
                            : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                        )}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-xs uppercase tracking-widest font-bold text-slate-400 bg-white/50 dark:bg-slate-800/50 px-4 py-2 rounded-full border border-slate-200/50 dark:border-slate-700/50">
                      Avg Mood: <span className={cn("ml-1", currentTheme.text)}>{averageMoodScore}</span>
                    </div>
                    <div className="text-xs uppercase tracking-widest font-bold text-slate-400 bg-white/50 dark:bg-slate-800/50 px-4 py-2 rounded-full border border-slate-200/50 dark:border-slate-700/50">
                      {filteredMoodHistory.length} Check-ins
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Chart Card */}
                <div className="lg:col-span-2 glass rounded-[2.5rem] p-8 shadow-sm h-[400px] flex flex-col">
                  <h3 className="text-xl font-serif font-semibold mb-6 flex items-center gap-2">
                    <History size={20} className="text-emerald-500" />
                    Mood Trends
                  </h3>
                  <div className="flex-1">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="colorMood" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.1)" />
                        <XAxis 
                          dataKey="time" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }}
                        />
                        <YAxis 
                          domain={[0, 6]} 
                          ticks={[1, 2, 3, 4, 5]}
                          axisLine={false} 
                          tickLine={false}
                          tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }}
                          tickFormatter={(val) => {
                            if (val === 5) return 'Happy';
                            if (val === 3) return 'Neutral';
                            if (val === 1) return 'Sad';
                            return '';
                          }}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'rgba(255, 255, 255, 0.8)', 
                            backdropFilter: 'blur(10px)',
                            borderRadius: '20px', 
                            border: '1px solid rgba(255, 255, 255, 0.2)', 
                            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)' 
                          }}
                          itemStyle={{ color: '#10b981', fontWeight: 'bold' }}
                          labelStyle={{ fontWeight: 'bold', color: '#1e293b', marginBottom: '4px' }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="value" 
                          stroke="#10b981" 
                          strokeWidth={4}
                          fillOpacity={1} 
                          fill="url(#colorMood)" 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Quick Stats / Tips Column */}
                <div className="flex flex-col gap-6">
                  <motion.div 
                    whileHover={{ y: -5 }}
                    onClick={() => setShowBreathing(true)}
                    className="glass rounded-[2rem] p-6 flex items-center gap-5 border-l-4 border-l-blue-500 shadow-sm cursor-pointer"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-inner">
                      <Wind size={28} />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Exercise</p>
                      <p className="font-serif text-lg font-bold">4-7-8 Breathing</p>
                    </div>
                  </motion.div>

                  <motion.div 
                    whileHover={{ y: -5 }}
                    onClick={() => setShowMeditation(true)}
                    className="glass rounded-[2rem] p-6 flex items-center gap-5 border-l-4 border-l-amber-500 shadow-sm cursor-pointer"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-inner">
                      <Coffee size={28} />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Relaxation</p>
                      <p className="font-serif text-lg font-bold">5m Meditation</p>
                    </div>
                  </motion.div>

                  <motion.div 
                    whileHover={{ y: -5 }}
                    className="glass rounded-[2rem] p-6 flex items-center gap-5 border-l-4 border-l-purple-500 shadow-sm"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center shadow-inner">
                      <Sparkles size={28} />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Motivation</p>
                      <p className="font-serif text-lg font-bold">Daily Affirmations</p>
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* Recent Moods Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {moodHistory.slice(-6).reverse().map((entry, i) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className="glass rounded-3xl p-4 text-center flex flex-col items-center justify-center gap-2 shadow-sm"
                  >
                    <span className="text-3xl">{MOOD_EMOJIS[entry.mood]}</span>
                    <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400">{format(new Date(entry.timestamp), 'MMM d')}</p>
                    <p className="font-bold text-xs">{entry.mood}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        <AnimatePresence>
          {showBreathing && <BreathingExercise onClose={() => setShowBreathing(false)} />}
        </AnimatePresence>

        <AnimatePresence>
          {showMeditation && <MeditationSession onClose={() => setShowMeditation(false)} />}
        </AnimatePresence>
      </main>



      <footer className="text-center py-4 text-sm border-t border-slate-200 dark:border-slate-800">

        <div className="text-slate-500 dark:text-white">
          © 2026 Aditya Nanaware 
          | 
          <span className="text-emerald-400 font-semibold mx-1">
            MindfulMate AI
          </span>
          | All Rights Reserved
        </div>

        <div className="text-xs text-slate-400 mt-1">
          Developed with ❤️ by Aditya Nanaware
        </div>

      </footer>

    </div>
  );
}
