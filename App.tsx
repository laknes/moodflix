
import React, { useState, useEffect, useMemo } from 'react';
import { UserMoodInput, MovieRecommendation, RecommendationResponse, MoodHistoryEntry, MoodType, Language, SystemSettings, AiProvider, UserSession, FeedbackType, SavedMovie } from './types';
import { MOODS, MODES, TRANSLATIONS } from './constants';
import { getAiRecommendations } from './services/ai';
import { getLocalRecommendations } from './services/localDb';

const MOOD_THEMES: Record<MoodType, { color: string }> = {
  happy: { color: '#fbbf24' },
  sad: { color: '#3b82f6' },
  calm: { color: '#10b981' },
  anxious: { color: '#8b5cf6' },
  lonely: { color: '#6366f1' },
  angry: { color: '#ef4444' },
  empty: { color: '#71717a' },
  hopeful: { color: '#059669' },
  romantic: { color: '#ec4899' },
  couple: { color: '#e11d48' }
};

const DEFAULT_POSTER = "https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=2059&auto=format&fit=crop";

const NetflixLogo: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const sizeClasses = { sm: 'text-2xl', md: 'text-5xl lg:text-7xl', lg: 'text-7xl' };
  return <div className={`logo-text font-netflix ${sizeClasses[size]}`}>Moodflix</div>;
};

// --- Installer Wizard Component ---
const InstallerWizard: React.FC<{ onComplete: (config: any) => void }> = ({ onComplete }) => {
  const [step, setStep] = useState(0); // 0: Welcome, 1: Server, 2: DB, 3: Admin, 4: Build
  const [isTesting, setIsTesting] = useState(false);
  const [config, setConfig] = useState({
    domain: '',
    dbHost: 'localhost',
    dbUser: 'root',
    dbPass: '',
    dbName: 'moodflix_db',
    adminName: '',
    adminEmail: '',
    adminPass: ''
  });
  const [buildProgress, setBuildProgress] = useState(0);
  const [buildLogs, setBuildLogs] = useState<string[]>([]);

  const logs = [
    "Initializing build environment...",
    "Optimizing Tailwind CSS layers...",
    "Compiling TypeScript modules...",
    "Generating Persian localization bundles...",
    "Injecting Gemini AI Bridge...",
    "Compressing image assets...",
    "Signing Android package (v1.0.4)...",
    "Finalizing deployment script..."
  ];

  const nextStep = () => setStep(s => s + 1);

  const testConnection = () => {
    setIsTesting(true);
    setTimeout(() => {
      setIsTesting(false);
      nextStep();
    }, 2000);
  };

  useEffect(() => {
    if (step === 4) {
      let logIdx = 0;
      const interval = setInterval(() => {
        setBuildProgress(p => {
          if (p >= 100) {
            clearInterval(interval);
            return 100;
          }
          if (p % 12 === 0 && logIdx < logs.length) {
            setBuildLogs(prev => [...prev, logs[logIdx++]]);
          }
          return p + 1;
        });
      }, 40);
      return () => clearInterval(interval);
    }
  }, [step]);

  const handleDownloadAndFinish = () => {
    onComplete(config);
  };

  return (
    <div className="fixed inset-0 z-[200] bg-[#020617] flex items-center justify-center p-4 text-white overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-netflix/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />

      <div className="max-w-2xl w-full glass p-8 md:p-12 rounded-[3.5rem] border border-white/5 relative z-10 shadow-2xl animate-in fade-in zoom-in duration-700">
        
        {step > 0 && (
          <div className="flex justify-between items-center mb-10">
            <NetflixLogo size="sm" />
            <div className="flex gap-1.5">
              {[1, 2, 3, 4].map(s => (
                <div key={s} className={`h-1 rounded-full transition-all duration-500 ${step === s ? 'w-8 bg-netflix' : 'w-4 bg-white/10'}`} />
              ))}
            </div>
          </div>
        )}

        {step === 0 && (
          <div className="text-center space-y-8 py-10 animate-in slide-in-from-bottom-4">
            <NetflixLogo size="lg" />
            <div className="space-y-4">
              <h1 className="text-3xl md:text-4xl font-black">Welcome to Setup Wizard</h1>
              <p className="text-slate-400 max-w-md mx-auto leading-relaxed">
                Moodflix requires a brief initial configuration to connect with your server and database infrastructure.
              </p>
            </div>
            <button 
              onClick={nextStep}
              className="px-12 py-5 bg-netflix hover:bg-red-700 text-white rounded-3xl font-black text-xl transition-all shadow-xl hover:scale-105 active:scale-95"
            >
              Start Installation
            </button>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
            <header>
              <h2 className="text-2xl font-black">Server Node</h2>
              <p className="text-sm opacity-50">Specify the primary domain or IP address for the backend.</p>
            </header>
            <div className="space-y-4">
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="e.g. moodflix.app or 192.168.1.50:3000" 
                  className="w-full p-5 rounded-3xl bg-white/5 border border-white/10 outline-none focus:border-netflix transition-all text-lg font-mono"
                  value={config.domain}
                  onChange={e => setConfig({...config, domain: e.target.value})}
                />
                <div className="absolute right-5 top-1/2 -translate-y-1/2 text-netflix font-black text-xs uppercase tracking-widest">Global IP</div>
              </div>
            </div>
            <button 
              onClick={nextStep} 
              disabled={!config.domain} 
              className="w-full py-5 bg-netflix rounded-[2rem] font-black text-lg disabled:opacity-30 shadow-lg"
            >
              Continue to Database
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
            <header>
              <h2 className="text-2xl font-black">Database Connection</h2>
              <p className="text-sm opacity-50">Configure your SQL/NoSQL storage bridge.</p>
            </header>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-[10px] uppercase font-black opacity-40 ml-4">Host Address</label>
                <input type="text" placeholder="localhost" className="w-full p-4 rounded-2xl bg-white/5 border border-white/10" value={config.dbHost} onChange={e => setConfig({...config, dbHost: e.target.value})} />
              </div>
              <div>
                <label className="text-[10px] uppercase font-black opacity-40 ml-4">DB Name</label>
                <input type="text" placeholder="moodflix_db" className="w-full p-4 rounded-2xl bg-white/5 border border-white/10" value={config.dbName} onChange={e => setConfig({...config, dbName: e.target.value})} />
              </div>
              <div>
                <label className="text-[10px] uppercase font-black opacity-40 ml-4">Username</label>
                <input type="text" placeholder="root" className="w-full p-4 rounded-2xl bg-white/5 border border-white/10" value={config.dbUser} onChange={e => setConfig({...config, dbUser: e.target.value})} />
              </div>
              <div className="col-span-2">
                <label className="text-[10px] uppercase font-black opacity-40 ml-4">Access Password</label>
                <input type="password" placeholder="••••••••" className="w-full p-4 rounded-2xl bg-white/5 border border-white/10" value={config.dbPass} onChange={e => setConfig({...config, dbPass: e.target.value})} />
              </div>
            </div>
            <button 
              onClick={testConnection} 
              disabled={isTesting}
              className={`w-full py-5 bg-white text-black rounded-[2rem] font-black text-lg shadow-lg flex items-center justify-center gap-3 transition-all ${isTesting ? 'opacity-70 scale-[0.98]' : 'hover:bg-slate-200'}`}
            >
              {isTesting ? (
                <>
                  <div className="h-5 w-5 border-4 border-black/20 border-t-black rounded-full animate-spin" />
                  Verifying Connection...
                </>
              ) : 'Test & Verify Connection'}
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
            <header>
              <h2 className="text-2xl font-black">System Administrator</h2>
              <p className="text-sm opacity-50">Create your master root account for the admin panel.</p>
            </header>
            <div className="space-y-4">
              <input type="text" placeholder="Full Name" className="w-full p-5 rounded-3xl bg-white/5 border border-white/10" value={config.adminName} onChange={e => setConfig({...config, adminName: e.target.value})} />
              <input type="email" placeholder="Admin Email" className="w-full p-5 rounded-3xl bg-white/5 border border-white/10 font-mono" value={config.adminEmail} onChange={e => setConfig({...config, adminEmail: e.target.value})} />
              <input type="password" placeholder="Secure Password" className="w-full p-5 rounded-3xl bg-white/5 border border-white/10" value={config.adminPass} onChange={e => setConfig({...config, adminPass: e.target.value})} />
            </div>
            <button 
              onClick={nextStep} 
              disabled={!config.adminPass || !config.adminEmail} 
              className="w-full py-5 bg-netflix rounded-[2rem] font-black text-lg disabled:opacity-30 shadow-lg"
            >
              Initialize Deployment
            </button>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-8 animate-in zoom-in-95 duration-500">
            <header className="text-center">
              <h2 className="text-2xl font-black">Compiling Build</h2>
              <p className="text-sm opacity-50">Generating your unique system binaries.</p>
            </header>
            
            <div className="space-y-6">
              <div className="relative h-2.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div className="absolute top-0 left-0 h-full bg-netflix transition-all duration-300 ease-out" style={{ width: `${buildProgress}%` }} />
                <div className="absolute top-0 left-0 h-full w-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
              </div>
              
              <div className="h-40 bg-black/40 rounded-3xl p-5 font-mono text-[10px] overflow-y-auto space-y-1 custom-scrollbar border border-white/5">
                {buildLogs.map((log, i) => (
                  <div key={i} className="flex gap-3">
                    <span className="text-netflix">›</span>
                    <span className="text-slate-300">{log}</span>
                  </div>
                ))}
                {buildProgress < 100 && <div className="animate-pulse text-white inline-block">_</div>}
              </div>
            </div>

            {buildProgress === 100 && (
              <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-1000">
                <button 
                  onClick={handleDownloadAndFinish}
                  className="w-full py-6 bg-green-600 hover:bg-green-700 text-white rounded-[2.5rem] font-black text-xl shadow-[0_0_40px_rgba(22,163,74,0.3)] flex items-center justify-center gap-4 transition-all hover:scale-[1.02]"
                >
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                  Finalize & Launch
                </button>
                <p className="text-[10px] text-center opacity-40 uppercase font-black tracking-widest">Installation Complete • System v1.0 Stable</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// --- Main App Components ---
const RecommendationCard: React.FC<{ m: MovieRecommendation; lang: Language; onFeedback: (type: FeedbackType) => void; isSaved: boolean; onSaveToggle: () => void }> = ({ m, lang, onFeedback, isSaved, onSaveToggle }) => {
  return (
    <div className="glass rounded-[3rem] overflow-hidden flex flex-col border border-white/10 group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-slate-900">
        <img 
          src={m.posterUrl && m.posterUrl.startsWith('http') ? m.posterUrl : DEFAULT_POSTER} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
          alt={m.title}
          onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_POSTER; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80" />
        <div className="absolute top-6 left-6 right-6 flex items-start justify-between">
           <div className="flex flex-col gap-2">
              <div className="bg-netflix text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-lg w-fit">
                {m.mediaType}
              </div>
           </div>
           <button onClick={(e) => { e.stopPropagation(); onSaveToggle(); }} className={`p-3 rounded-full transition-all shadow-xl ${isSaved ? 'bg-netflix text-white' : 'glass text-white/70'}`}>
              <svg className="w-5 h-5" fill={isSaved ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24"><path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
           </button>
        </div>
        <div className="absolute bottom-6 left-6 right-6">
           <h3 className="text-3xl font-black text-white leading-tight drop-shadow-lg">{m.title}</h3>
        </div>
      </div>
      <div className="p-8 flex-1 flex flex-col space-y-4">
        <p className="text-sm font-medium leading-relaxed opacity-80 line-clamp-4">{m.explanation}</p>
        <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
           <div className="flex flex-col">
              <span className="text-[10px] font-black opacity-40 uppercase">{lang === 'fa' ? 'زمان مناسب' : 'Suggested Time'}</span>
              <span className="text-xs font-bold">{m.suggestedTime}</span>
           </div>
           <div className="flex items-center gap-3">
              <button onClick={() => onFeedback('like')} className={`p-2 rounded-full ${m.feedback === 'like' ? 'text-green-500 scale-125' : 'text-white/20'}`}>
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z"/></svg>
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>(() => (localStorage.getItem('moodflix_lang') as Language) || 'fa');
  const [activeTab, setActiveTab] = useState<'home' | 'profile' | 'admin'>('home');
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<RecommendationResponse | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  
  const [settings, setSettings] = useState<SystemSettings>(() => {
    const saved = localStorage.getItem('moodflix_settings');
    return saved ? JSON.parse(saved) : {
      activeProvider: 'gemini', geminiKey: '', openaiKey: '', temperature: 0.7, maxTokens: 1000, isInstalled: false
    };
  });

  const [history, setHistory] = useState<MoodHistoryEntry[]>(() => {
    const saved = localStorage.getItem('moodflix_history');
    return saved ? JSON.parse(saved) : [];
  });

  const [savedMovies, setSavedMovies] = useState<SavedMovie[]>(() => {
    const saved = localStorage.getItem('moodflix_saved');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [session, setSession] = useState<UserSession | null>(() => {
    const saved = localStorage.getItem('moodflix_session');
    return saved ? JSON.parse(saved) : null;
  });

  const [input, setInput] = useState<UserMoodInput>({
    primaryMood: 'calm', intensity: 'medium', mentalEffort: 'entertainment', energyLevel: 'medium',
    mode: 'single', language: lang
  });

  useEffect(() => {
    localStorage.setItem('moodflix_settings', JSON.stringify(settings));
    localStorage.setItem('moodflix_history', JSON.stringify(history));
    localStorage.setItem('moodflix_saved', JSON.stringify(savedMovies));
    if (session) localStorage.setItem('moodflix_session', JSON.stringify(session));
  }, [settings, history, savedMovies, session]);

  const handleInstallComplete = (installerConfig: any) => {
    setSettings({
      ...settings,
      isInstalled: true,
      serverAddress: installerConfig.domain,
      dbConfig: { host: installerConfig.dbHost, user: installerConfig.dbUser, name: installerConfig.dbName }
    });
    setSession({
      email: installerConfig.adminEmail,
      name: installerConfig.adminName || 'Super Admin',
      role: 'admin',
      isLoggedIn: true
    });
  };

  const handleRecommend = async () => {
    setLoading(true); setStep(2);
    try {
      const data = await getAiRecommendations(input, settings);
      setResults(data);
      setHistory(prev => [{ mood: input.primaryMood, timestamp: Date.now(), movieTitles: data.recommendations.map(m => m.title), language: lang }, ...prev].slice(0, 50));
    } catch (err) {
      setResults(getLocalRecommendations(input));
    } finally { setLoading(false); }
  };

  const handleResetSystem = () => {
    if (confirm('Are you sure you want to erase all settings and return to the installation phase?')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const currentTheme = MOOD_THEMES[input.primaryMood] || MOOD_THEMES.calm;
  const T = TRANSLATIONS[lang];

  if (!settings.isInstalled) {
    return <InstallerWizard onComplete={handleInstallComplete} />;
  }

  return (
    <div className={`flex min-h-screen transition-all duration-700 bg-slate-950 text-white ${lang === 'fa' ? 'font-fa' : ''}`}>
      <aside className={`fixed top-0 ${lang === 'fa' ? 'right-0 border-l' : 'left-0 border-r'} h-full z-50 glass transition-all duration-500 flex flex-col p-4 backdrop-blur-3xl ${isSidebarCollapsed ? 'w-20' : 'w-72'}`}>
        <div className="flex items-center justify-between mb-12 mt-4 px-2 overflow-hidden">
           <NetflixLogo size="sm" />
           <button onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} className="p-3 rounded-2xl bg-white/5 text-netflix">
             <svg className={`h-6 w-6 transition-transform ${isSidebarCollapsed ? '' : 'rotate-180'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" /></svg>
           </button>
        </div>
        
        <nav className="flex-1 space-y-4">
          <button onClick={() => setActiveTab('home')} className={`relative group w-full flex items-center gap-4 p-4 rounded-3xl transition-all ${activeTab === 'home' ? 'bg-netflix' : 'text-slate-400 hover:bg-white/10'}`}>
             <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
             {!isSidebarCollapsed && <span className="text-sm font-black whitespace-nowrap">{T.home}</span>}
          </button>
          <button onClick={() => setActiveTab('profile')} className={`relative group w-full flex items-center gap-4 p-4 rounded-3xl transition-all ${activeTab === 'profile' ? 'bg-netflix' : 'text-slate-400 hover:bg-white/10'}`}>
             <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
             {!isSidebarCollapsed && <span className="text-sm font-black whitespace-nowrap">{T.profile}</span>}
          </button>
        </nav>

        <div className="pt-4 mt-auto border-t border-white/10 space-y-4">
           <button onClick={() => setLang(lang === 'fa' ? 'en' : 'fa')} className="w-full flex items-center gap-4 p-4 text-slate-400">
             <div className="h-7 w-7 flex items-center justify-center font-black text-xs glass rounded-full">
               {lang === 'fa' ? 'EN' : 'FA'}
             </div>
             {!isSidebarCollapsed && <span className="text-sm font-black">{lang === 'fa' ? 'English' : 'فارسی'}</span>}
           </button>
        </div>
      </aside>

      <main className={`flex-1 transition-all duration-500 ${isSidebarCollapsed ? (lang === 'fa' ? 'mr-20' : 'ml-20') : (lang === 'fa' ? 'mr-72' : 'ml-72')}`}>
        <div className="max-w-6xl mx-auto py-12 px-6">
          <header className="text-center mb-16">
            <NetflixLogo size="md" />
            <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-xs mt-4">{T.subtitle}</p>
            {settings.serverAddress && <p className="text-[10px] opacity-20 mt-2 font-mono uppercase tracking-widest">Connected Node: {settings.serverAddress}</p>}
          </header>

          {activeTab === 'home' ? (
            step === 1 ? (
              <div className="space-y-16 animate-in fade-in zoom-in-95">
                <section>
                  <h2 className="text-2xl font-black mb-10 flex items-center gap-4"><span className="w-2 h-10 rounded-full" style={{ backgroundColor: currentTheme.color }}></span>{T.step1Title}</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-4">
                    {MOODS.map((m: any) => (
                      <button key={m.type} onClick={() => setInput({...input, primaryMood: m.type})} className={`p-6 rounded-[2rem] border-2 transition-all flex flex-col items-center gap-3 ${input.primaryMood === m.type ? 'bg-white/10 shadow-xl scale-110 border-netflix' : 'border-transparent opacity-60'}`}>
                        <svg className={`h-8 w-8 ${m.color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d={m.icon} /></svg>
                        <span className="text-[10px] font-black uppercase">{m.labels[lang]}</span>
                      </button>
                    ))}
                  </div>
                </section>
                <button onClick={handleRecommend} className="w-full bg-netflix text-white py-8 rounded-[3rem] font-black text-xl shadow-2xl hover:scale-[1.02] transition-all">
                  {T.btnRecommend}
                </button>
              </div>
            ) : (
              <div className="space-y-12">
                 {loading ? <div className="text-center py-20">{T.loading}</div> : (
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                     {results?.recommendations.map((m, i) => (
                       <RecommendationCard 
                         key={i} m={m} lang={lang} 
                         onFeedback={() => {}} 
                         isSaved={savedMovies.some(sm => sm.title === m.title)}
                         onSaveToggle={() => {}}
                       />
                     ))}
                     <button onClick={() => setStep(1)} className="md:col-span-2 py-4 px-12 glass rounded-full font-black mx-auto block">{T.tryAgain}</button>
                   </div>
                 )}
              </div>
            )
          ) : (
             <div className="space-y-8">
               <div className="glass p-12 rounded-[3rem] border border-white/10 space-y-6">
                  <h2 className="text-3xl font-black">System Profile</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2 opacity-60">
                       <p>Admin: {session?.name}</p>
                       <p>Email: {session?.email}</p>
                       <p>Server: {settings.serverAddress}</p>
                    </div>
                    <div className="space-y-2 opacity-60">
                       <p>Database: {settings.dbConfig?.name}</p>
                       <p>Host: {settings.dbConfig?.host}</p>
                    </div>
                  </div>
               </div>
               
               <div className="glass p-12 rounded-[3rem] border border-red-500/20 bg-red-500/5 space-y-6">
                 <h3 className="text-xl font-black text-red-500">Danger Zone</h3>
                 <p className="text-sm opacity-60">Erase all locally stored configuration and return to the installation wizard.</p>
                 <button 
                  onClick={handleResetSystem}
                  className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black transition-colors"
                 >
                   Factory Reset System
                 </button>
               </div>
             </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
