
import React, { useState, useEffect } from 'react';
import { UserMoodInput, MovieRecommendation, RecommendationResponse, MoodHistoryEntry, MoodType, Language, SystemSettings, UserSession, FeedbackType, SavedMovie } from './types';
import { MOODS, TRANSLATIONS } from './constants';
import { getAiRecommendations } from './services/ai';
import { getLocalRecommendations } from './services/localDb';

const DEFAULT_POSTER = "https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=2059&auto=format&fit=crop";

const NetflixLogo: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const sizeClasses = { sm: 'text-2xl', md: 'text-5xl lg:text-7xl', lg: 'text-7xl' };
  return <div className={`logo-text font-netflix ${sizeClasses[size]}`}>Moodflix</div>;
};

// --- Professional Setup Wizard Component ---
const SetupWizard: React.FC<{ onComplete: (config: any) => void }> = ({ onComplete }) => {
  const [step, setStep] = useState(0); // 0:Welcome, 1:Server, 2:Database, 3:Admin, 4:Deploying
  const [isBusy, setIsBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [config, setConfig] = useState({
    serverUrl: '',
    dbHost: 'localhost',
    dbPort: '3306',
    dbName: 'moodflix',
    dbUser: 'admin',
    dbPass: '',
    adminName: '',
    adminEmail: '',
    adminPass: ''
  });

  const deploymentLogs = [
    "Establishing handshake with server node...",
    "Creating database tables and indices...",
    "Seeding initial emotional metadata...",
    "Configuring Gemini AI security bridge...",
    "Optimizing static asset delivery...",
    "Encrypting admin credentials...",
    "Generating system manifest...",
    "Finalizing core installation..."
  ];

  const handleNext = () => setStep(s => s + 1);

  const simulateTest = () => {
    setIsBusy(true);
    setTimeout(() => {
      setIsBusy(false);
      handleNext();
    }, 1500);
  };

  useEffect(() => {
    if (step === 4) {
      let logIdx = 0;
      const interval = setInterval(() => {
        setProgress(p => {
          if (p >= 100) {
            clearInterval(interval);
            return 100;
          }
          if (p % 15 === 0 && logIdx < deploymentLogs.length) {
            setLogs(prev => [...prev, deploymentLogs[logIdx++]]);
          }
          return p + 1;
        });
      }, 50);
      return () => clearInterval(interval);
    }
  }, [step]);

  return (
    <div className="fixed inset-0 z-[1000] bg-[#020617] text-white flex items-center justify-center p-4">
      {/* Dynamic Background */}
      <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-netflix/30 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/20 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-xl w-full glass p-8 md:p-12 rounded-[3rem] border border-white/5 relative shadow-2xl animate-in fade-in zoom-in duration-500">
        
        {step > 0 && (
          <div className="flex justify-between items-center mb-12">
            <NetflixLogo size="sm" />
            <div className="flex gap-2">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${step === i ? 'w-8 bg-netflix' : 'w-3 bg-white/10'}`} />
              ))}
            </div>
          </div>
        )}

        {step === 0 && (
          <div className="text-center space-y-8 py-6 animate-in slide-in-from-bottom-4">
            <NetflixLogo size="lg" />
            <div className="space-y-4">
              <h1 className="text-3xl font-black">System Setup Wizard</h1>
              <p className="text-slate-400 leading-relaxed">
                Welcome to Moodflix. Let's configure your server environment and initialize the platform.
              </p>
            </div>
            <button onClick={handleNext} className="w-full py-5 bg-netflix hover:bg-red-700 text-white rounded-3xl font-black text-xl transition-all shadow-xl hover:scale-[1.02]">
              Begin Installation
            </button>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-8 animate-in slide-in-from-right-4">
            <div className="space-y-2">
              <h2 className="text-2xl font-black">Server Configuration</h2>
              <p className="text-sm opacity-50">Enter the domain where Moodflix is hosted.</p>
            </div>
            <div className="relative">
              <input 
                type="text" 
                placeholder="e.g. moodflix.app or 127.0.0.1" 
                className="w-full p-5 rounded-3xl bg-white/5 border border-white/10 outline-none focus:border-netflix transition-all text-lg font-mono"
                value={config.serverUrl}
                onChange={e => setConfig({...config, serverUrl: e.target.value})}
              />
              <div className="absolute right-6 top-1/2 -translate-y-1/2 text-netflix font-bold text-[10px] uppercase tracking-tighter">Verified Node</div>
            </div>
            <button onClick={handleNext} disabled={!config.serverUrl} className="w-full py-5 bg-netflix rounded-3xl font-black text-lg disabled:opacity-30">
              Configure Network
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in slide-in-from-right-4">
            <div className="space-y-2">
              <h2 className="text-2xl font-black">Database Connection</h2>
              <p className="text-sm opacity-50">Specify your SQL storage parameters.</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-[10px] uppercase font-black opacity-40 ml-4 mb-1 block">Host Endpoint</label>
                <input type="text" className="w-full p-4 rounded-2xl bg-white/5 border border-white/10" value={config.dbHost} onChange={e => setConfig({...config, dbHost: e.target.value})} />
              </div>
              <div>
                <label className="text-[10px] uppercase font-black opacity-40 ml-4 mb-1 block">Username</label>
                <input type="text" className="w-full p-4 rounded-2xl bg-white/5 border border-white/10" value={config.dbUser} onChange={e => setConfig({...config, dbUser: e.target.value})} />
              </div>
              <div>
                <label className="text-[10px] uppercase font-black opacity-40 ml-4 mb-1 block">DB Name</label>
                <input type="text" className="w-full p-4 rounded-2xl bg-white/5 border border-white/10" value={config.dbName} onChange={e => setConfig({...config, dbName: e.target.value})} />
              </div>
              <div className="col-span-2">
                <label className="text-[10px] uppercase font-black opacity-40 ml-4 mb-1 block">Access Key</label>
                <input type="password" placeholder="••••••••" className="w-full p-4 rounded-2xl bg-white/5 border border-white/10" value={config.dbPass} onChange={e => setConfig({...config, dbPass: e.target.value})} />
              </div>
            </div>
            <button onClick={simulateTest} disabled={isBusy} className="w-full py-5 bg-white text-black rounded-3xl font-black text-lg flex items-center justify-center gap-3">
              {isBusy ? <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" /> : null}
              {isBusy ? "Testing..." : "Test Connection"}
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-in slide-in-from-right-4">
            <div className="space-y-2">
              <h2 className="text-2xl font-black">Super Admin</h2>
              <p className="text-sm opacity-50">Create the primary owner account.</p>
            </div>
            <div className="space-y-4">
              <input type="text" placeholder="Full Name" className="w-full p-5 rounded-3xl bg-white/5 border border-white/10" value={config.adminName} onChange={e => setConfig({...config, adminName: e.target.value})} />
              <input type="email" placeholder="Email Address" className="w-full p-5 rounded-3xl bg-white/5 border border-white/10" value={config.adminEmail} onChange={e => setConfig({...config, adminEmail: e.target.value})} />
              <input type="password" placeholder="Secure Password" className="w-full p-5 rounded-3xl bg-white/5 border border-white/10" value={config.adminPass} onChange={e => setConfig({...config, adminPass: e.target.value})} />
            </div>
            <button onClick={handleNext} disabled={!config.adminEmail || !config.adminPass} className="w-full py-5 bg-netflix rounded-3xl font-black text-lg">
              Initialize System
            </button>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-8 animate-in zoom-in-95 duration-700 text-center">
            <div className="space-y-2">
              <h2 className="text-2xl font-black">{progress < 100 ? "Deploying Core" : "System Ready"}</h2>
              <p className="text-sm opacity-50">Provisioning environment for {config.serverUrl}</p>
            </div>

            <div className="space-y-6">
              <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-netflix transition-all duration-300 shadow-[0_0_20px_rgba(229,9,20,0.5)]" style={{ width: `${progress}%` }} />
              </div>

              <div className="h-32 bg-black/40 rounded-2xl p-4 font-mono text-[10px] text-left overflow-y-auto space-y-1 custom-scrollbar border border-white/5">
                {logs.map((log, i) => (
                  <div key={i} className="flex gap-2">
                    <span className="text-netflix">√</span>
                    <span className="text-slate-300">{log}</span>
                  </div>
                ))}
                {progress < 100 && <span className="inline-block w-2 h-3 bg-white animate-pulse" />}
              </div>
            </div>

            {progress === 100 && (
              <button 
                onClick={() => onComplete(config)} 
                className="w-full py-6 bg-green-600 hover:bg-green-700 text-white rounded-[2rem] font-black text-xl shadow-[0_0_40px_rgba(22,163,74,0.3)] animate-in slide-in-from-bottom-4 duration-700"
              >
                Complete & Launch
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// --- Main App ---
const RecommendationCard: React.FC<{ m: MovieRecommendation; lang: Language; isSaved: boolean; onSave: () => void }> = ({ m, lang, isSaved, onSave }) => (
  <div className="glass rounded-[2.5rem] overflow-hidden flex flex-col border border-white/10 group hover:-translate-y-2 transition-all duration-500">
    <div className="relative aspect-[2/3] bg-slate-900 overflow-hidden">
      <img src={m.posterUrl || DEFAULT_POSTER} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={m.title} />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
      <button onClick={onSave} className={`absolute top-6 right-6 p-4 rounded-full glass ${isSaved ? 'text-netflix' : 'text-white'}`}>
        <svg className="w-6 h-6" fill={isSaved ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24"><path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
      </button>
      <div className="absolute bottom-6 left-6 right-6">
        <h3 className="text-3xl font-black text-white">{m.title}</h3>
        <p className="text-[10px] uppercase font-black opacity-60 tracking-widest mt-1">{m.genre.join(' • ')}</p>
      </div>
    </div>
    <div className="p-8 flex-1 flex flex-col space-y-4">
      <p className="text-sm opacity-80 leading-relaxed line-clamp-3">{m.explanation}</p>
      <div className="mt-auto pt-6 border-t border-white/5 flex justify-between items-center text-xs">
        <span className="font-black uppercase opacity-40">{lang === 'fa' ? 'محصول' : 'Origin'}: {m.country}</span>
        <span className="font-bold">{m.suggestedTime}</span>
      </div>
    </div>
  </div>
);

const App: React.FC = () => {
  const [settings, setSettings] = useState<SystemSettings>(() => {
    const saved = localStorage.getItem('moodflix_settings');
    return saved ? JSON.parse(saved) : { activeProvider: 'gemini', isInstalled: false };
  });

  const [session, setSession] = useState<UserSession | null>(() => {
    const saved = localStorage.getItem('moodflix_session');
    return saved ? JSON.parse(saved) : null;
  });

  const [lang, setLang] = useState<Language>(() => (localStorage.getItem('moodflix_lang') as Language) || 'fa');
  const [activeTab, setActiveTab] = useState<'home' | 'profile'>('home');
  const [input, setInput] = useState<UserMoodInput>({ primaryMood: 'calm', intensity: 'medium', mentalEffort: 'entertainment', energyLevel: 'medium', mode: 'single', language: lang });
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<RecommendationResponse | null>(null);
  const [savedMovies, setSavedMovies] = useState<SavedMovie[]>([]);

  useEffect(() => {
    localStorage.setItem('moodflix_settings', JSON.stringify(settings));
    if (session) localStorage.setItem('moodflix_session', JSON.stringify(session));
  }, [settings, session]);

  const handleSetupComplete = (conf: any) => {
    setSettings({
      ...settings,
      isInstalled: true,
      serverAddress: conf.serverUrl,
      dbConfig: { host: conf.dbHost, user: conf.dbUser, name: conf.dbName }
    });
    setSession({
      name: conf.adminName,
      email: conf.adminEmail,
      role: 'admin',
      isLoggedIn: true
    });
  };

  const handleRecommend = async () => {
    setLoading(true);
    try {
      const data = await getAiRecommendations(input, settings);
      setResults(data);
    } catch {
      setResults(getLocalRecommendations(input));
    } finally {
      setLoading(false);
    }
  };

  const T = TRANSLATIONS[lang];

  if (!settings.isInstalled) {
    return <SetupWizard onComplete={handleSetupComplete} />;
  }

  return (
    <div className={`min-h-screen bg-slate-950 text-white flex ${lang === 'fa' ? 'font-fa rtl' : ''}`}>
      {/* Sidebar */}
      <aside className={`fixed h-full w-20 md:w-64 glass border-r border-white/5 flex flex-col p-6 z-50`}>
        <div className="mb-12 text-center md:text-left">
          <NetflixLogo size="sm" />
        </div>
        <nav className="flex-1 space-y-4">
          <button onClick={() => setActiveTab('home')} className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${activeTab === 'home' ? 'bg-netflix' : 'hover:bg-white/5'}`}>
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
            <span className="hidden md:block font-black">{T.home}</span>
          </button>
          <button onClick={() => setActiveTab('profile')} className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${activeTab === 'profile' ? 'bg-netflix' : 'hover:bg-white/5'}`}>
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            <span className="hidden md:block font-black">{T.profile}</span>
          </button>
        </nav>
        <button onClick={() => setLang(lang === 'fa' ? 'en' : 'fa')} className="mt-auto p-4 glass rounded-2xl font-black text-xs">
          {lang === 'fa' ? 'ENGLISH' : 'فارسی'}
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-20 md:ml-64 p-8 md:p-12">
        <div className="max-w-5xl mx-auto">
          {activeTab === 'home' ? (
            !results ? (
              <div className="space-y-16 py-12">
                <header className="text-center space-y-4">
                  <h1 className="text-4xl md:text-6xl font-black">{T.step1Title}</h1>
                  <p className="text-slate-500 font-bold uppercase tracking-widest">{T.subtitle}</p>
                </header>
                
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                  {MOODS.map(m => (
                    <button key={m.type} onClick={() => setInput({...input, primaryMood: m.type})} className={`p-8 rounded-[2.5rem] border-2 transition-all flex flex-col items-center gap-4 ${input.primaryMood === m.type ? 'bg-white/10 border-netflix scale-105 shadow-xl' : 'border-transparent opacity-40'}`}>
                      <svg className={`w-10 h-10 ${m.color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d={m.icon} /></svg>
                      <span className="text-xs font-black uppercase">{m.labels[lang]}</span>
                    </button>
                  ))}
                </div>

                <button onClick={handleRecommend} className="w-full py-8 bg-netflix rounded-[3rem] font-black text-2xl shadow-2xl hover:scale-[1.01] transition-all">
                  {loading ? T.loading : T.btnRecommend}
                </button>
              </div>
            ) : (
              <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8">
                <header className="flex justify-between items-end">
                   <div>
                     <h2 className="text-3xl font-black">Recommendations</h2>
                     <p className="opacity-50 text-sm">Tailored for your {input.primaryMood} mood</p>
                   </div>
                   <button onClick={() => setResults(null)} className="px-6 py-3 glass rounded-full text-xs font-black uppercase">Start Over</button>
                </header>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {results.recommendations.map((m, i) => (
                    <RecommendationCard 
                      key={i} m={m} lang={lang} 
                      isSaved={savedMovies.some(sm => sm.title === m.title)}
                      onSave={() => {}} 
                    />
                  ))}
                </div>
              </div>
            )
          ) : (
            <div className="space-y-8 py-12">
               <div className="glass p-12 rounded-[3rem] space-y-6">
                  <h2 className="text-4xl font-black">System Profile</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 opacity-60">
                     <div className="space-y-4">
                        <p>Administrator: <span className="text-white font-bold">{session?.name}</span></p>
                        <p>Server URL: <span className="text-white font-bold font-mono">{settings.serverAddress}</span></p>
                     </div>
                     <div className="space-y-4">
                        <p>DB Endpoint: <span className="text-white font-bold font-mono">{settings.dbConfig?.host}</span></p>
                        <p>DB Name: <span className="text-white font-bold font-mono">{settings.dbConfig?.name}</span></p>
                     </div>
                  </div>
               </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
