
import React, { useState, useEffect, useRef } from 'react';
import { UserMoodInput, MovieRecommendation, RecommendationResponse, Language, SystemSettings, SavedMovie, UserSession, MoodType } from './types.ts';
import { MOODS, TRANSLATIONS, INTENSITIES, MODES } from './constants.tsx';
import { getAiRecommendations } from './services/ai.ts';
import { getLocalRecommendations } from './services/localDb.ts';

const FAMOUS_POSTERS = [
  "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_.jpg", // Inception
  "https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_.jpg", // Dark Knight
  "https://m.media-amazon.com/images/M/MV5BZjdkOTU3MDktN2ExOS00NGExLWFmODItM2FiMWMyNTE1Njg2XkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_.jpg", // Interstellar
  "https://m.media-amazon.com/images/M/MV5BMGUwZjliMTAtNzAxZi00MWNiLWFkM2UtZDA4ZjAyZGYyZGRhXkEyXkFqcGdeQXVyMTA0MTM5NjI2._V1_.jpg", // Parasite
  "https://m.media-amazon.com/images/M/MV5BNGVjNWI4ZGUtNzE0MS00YTJmLWE0ZDctN2ZiY2I1NzAxOTU1XkEyXkFqcGdeQXVyMTkxNjUyNQ@@._V1_.jpg", // Joker
  "https://m.media-amazon.com/images/M/MV5BMTc5MDE2ODcwNV5BMl5BanBnXkFtZTgwMzI2NzQ2NzM@._V1_.jpg", // Avengers
  "https://m.media-amazon.com/images/M/MV5BNGNhMDIzZTUtNTBlZi00MTRlLWFjM2ItYzViMjE3YzI5MjI4XkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_.jpg", // Pulp Fiction
  "https://m.media-amazon.com/images/M/MV5BNDE4OTMxMTctMjRhS00ZWYzLTg3YzctOTkzMmQ5ODZjMGJuXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_.jpg", // Schindler's List
  "https://m.media-amazon.com/images/M/MV5BM2MyNjYxNmUtYTAwZC00MTYxLWJmNWYtYzZlODY3ZTk3OTFlXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_.jpg", // Godfather
  "https://m.media-amazon.com/images/M/MV5BNzA5ZDNlZWMtM2NhNS00NDJjLTk4NDItYTRmY2EwMWZlMTY3XkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_.jpg", // Lord of the Rings
  "https://m.media-amazon.com/images/M/MV5BMjIyNTQ5NjQ1OV5BMl5BanBnXkFtZTcwNjM1MzgxMQ@@._V1_.jpg", // Matrix
  "https://m.media-amazon.com/images/M/MV5BYmU1NDRjNDgtMzhiMi00NjZmLWI3M2ItMTEwOTFkNGQzNWRlXkEyXkFqcGdeQXVyMzE1NzUxMTM@._V1_.jpg", // Seven
];

const BackgroundCinematic: React.FC = () => (
  <>
    <div className="poster-grid-bg">
      {[...FAMOUS_POSTERS, ...FAMOUS_POSTERS].map((url, i) => (
        <div key={i} className="poster-item" style={{ backgroundImage: `url(${url})` }} />
      ))}
    </div>
    <div className="movie-bg-overlay" />
  </>
);

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>(() => (localStorage.getItem('moodflix_lang') as Language) || 'fa');
  const [theme, setTheme] = useState<'dark' | 'light'>(() => (localStorage.getItem('moodflix_theme') as 'dark' | 'light') || 'dark');
  const [activeTab, setActiveTab] = useState<'home' | 'saved' | 'profile' | 'admin'>('home');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const logEndRef = useRef<HTMLDivElement>(null);
  
  const [installStep, setInstallStep] = useState(1);
  const [apkBuildState, setApkBuildState] = useState({ isExporting: false, progress: 0, stepIndex: -1, logs: [] as string[] });
  const [aiLoadingState, setAiLoadingState] = useState({ isLoading: false, stepIndex: 0 });
  
  const [user, setUser] = useState<UserSession | null>(() => {
    const saved = localStorage.getItem('moodflix_user');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authData, setAuthData] = useState({ email: '', password: '', name: '' });

  const [settings, setSettings] = useState<SystemSettings>(() => {
    const saved = localStorage.getItem('moodflix_settings');
    return saved ? JSON.parse(saved) : {
      activeProvider: 'gemini', geminiKey: '', openaiKey: '', temperature: 0.7, maxTokens: 1000, 
      isInstalled: false,
      dbConfig: { host: 'localhost', user: 'root', pass: '', name: 'moodflix_db' },
      sslConfig: { cloudflareToken: '', zoneId: '', sslMode: 'flexible', proxyStatus: true },
      adminSetup: { user: 'admin', pass: '' }
    };
  });

  const [input, setInput] = useState<UserMoodInput>({ 
    primaryMood: 'calm', intensity: 'medium', mentalEffort: 'entertainment', 
    energyLevel: 'medium', mode: 'single', language: lang, description: ''
  });
  const [results, setResults] = useState<RecommendationResponse | null>(null);
  const [savedMovies, setSavedMovies] = useState<SavedMovie[]>(() => {
    const saved = localStorage.getItem('moodflix_saved_movies');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('moodflix_lang', lang);
    localStorage.setItem('moodflix_theme', theme);
    localStorage.setItem('moodflix_saved_movies', JSON.stringify(savedMovies));
    localStorage.setItem('moodflix_settings', JSON.stringify(settings));
    if (user) localStorage.setItem('moodflix_user', JSON.stringify(user));
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [lang, theme, savedMovies, settings, user]);

  useEffect(() => {
    if (apkBuildState.isExporting) logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [apkBuildState.logs]);

  const T = TRANSLATIONS[lang];
  const isRtl = lang === 'fa';

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    const isAdmin = authData.email === settings.adminSetup?.user || authData.email === 'admin';
    setUser({ 
      email: authData.email, 
      name: authData.name || (isAdmin ? 'مدیر سیستم' : 'کاربر مهمان'), 
      role: isAdmin ? 'admin' : 'user', 
      isLoggedIn: true,
      joinDate: new Date().toLocaleDateString(lang === 'fa' ? 'fa-IR' : 'en-US'),
      preferences: ['Drama', 'Sci-Fi', 'Psychological', 'Mystery'],
      lastMoods: ['happy', 'calm', 'romantic', 'anxious'] as MoodType[]
    });
  };

  const handleInstall = (e: React.FormEvent) => {
    e.preventDefault();
    if (installStep < 2) setInstallStep(2);
    else {
      setSettings(prev => ({ ...prev, isInstalled: true }));
      setAuthMode('login');
    }
  };

  const handleRecommend = async () => {
    setAiLoadingState({ isLoading: true, stepIndex: 0 });
    const stepInterval = setInterval(() => {
      setAiLoadingState(prev => ({
        ...prev,
        stepIndex: Math.min(prev.stepIndex + 1, T.loadingSteps.length - 1)
      }));
    }, 2000);

    try {
      const data = await getAiRecommendations(input, settings);
      setResults(data);
    } catch (err) {
      setResults(getLocalRecommendations(input));
    } finally {
      clearInterval(stepInterval);
      setAiLoadingState({ isLoading: false, stepIndex: 0 });
    }
  };

  const handleExportApk = async () => {
    setApkBuildState({ 
      isExporting: true, progress: 0, stepIndex: 0, 
      logs: [isRtl ? "> شروع فرآیند بیلد..." : "> Initializing build process..."] 
    });
    
    const steps = T.apkSteps;
    for (let i = 0; i < steps.length; i++) {
      setApkBuildState(prev => ({ ...prev, stepIndex: i, logs: [...prev.logs, `>>> ${steps[i]}`] }));
      for (let p = 0; p < 3; p++) {
        await new Promise(r => setTimeout(r, 600));
        setApkBuildState(prev => ({
          ...prev,
          progress: Math.min(prev.progress + 5, 99),
          logs: [...prev.logs, `> Process chunk ${p+1} complete...`]
        }));
      }
    }
    setApkBuildState(prev => ({ ...prev, progress: 100, logs: [...prev.logs, "✓ SUCCESS"] }));
    setTimeout(() => setApkBuildState({ isExporting: false, progress: 0, stepIndex: -1, logs: [] }), 2000);
  };

  if (!settings.isInstalled) {
    return (
      <div className={`auth-overlay min-h-screen flex items-center justify-center p-4 lg:p-10 ${isRtl ? 'font-fa' : 'ltr'}`}>
        <BackgroundCinematic />
        <div className="glass w-full max-w-2xl rounded-[3rem] p-10 lg:p-16 space-y-12 animate-in zoom-in-95 duration-700">
          <div className="text-center space-y-4">
            <h1 className="logo-text text-7xl tracking-tighter">Moodflix</h1>
            <p className="text-accent font-black uppercase text-xs tracking-[0.5em]">{T.installTitle}</p>
          </div>
          <div className="flex justify-between px-10 relative">
             <div className="absolute top-1/2 left-10 right-10 h-1 bg-white/10 -translate-y-1/2" />
             <div className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center font-black transition-all duration-500 ${installStep >= 1 ? 'bg-accent text-white scale-125 shadow-2xl shadow-accent/50' : 'bg-white/10 opacity-30'}`}>1</div>
             <div className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center font-black transition-all duration-500 ${installStep >= 2 ? 'bg-accent text-white scale-125 shadow-2xl shadow-accent/50' : 'bg-white/10 opacity-30'}`}>2</div>
          </div>
          <form className="space-y-10" onSubmit={handleInstall}>
            {installStep === 1 ? (
              <div className="space-y-6 animate-in slide-in-from-left-6">
                <h3 className="font-black text-2xl border-r-4 border-accent pr-4">{T.installDb}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <input type="text" placeholder={T.dbHost} className="input-field" required value={settings.dbConfig?.host} onChange={e => setSettings({...settings, dbConfig: {...settings.dbConfig!, host: e.target.value}})} />
                  <input type="text" placeholder={T.dbName} className="input-field" required value={settings.dbConfig?.name} onChange={e => setSettings({...settings, dbConfig: {...settings.dbConfig!, name: e.target.value}})} />
                  <input type="text" placeholder={T.dbUser} className="input-field" required value={settings.dbConfig?.user} onChange={e => setSettings({...settings, dbConfig: {...settings.dbConfig!, user: e.target.value}})} />
                  <input type="password" placeholder={T.dbPass} className="input-field" value={settings.dbConfig?.pass} onChange={e => setSettings({...settings, dbConfig: {...settings.dbConfig!, pass: e.target.value}})} />
                </div>
              </div>
            ) : (
              <div className="space-y-6 animate-in slide-in-from-right-6">
                <h3 className="font-black text-2xl border-r-4 border-accent pr-4">{T.installAdmin}</h3>
                <div className="space-y-4">
                  <input type="text" placeholder={T.adminUser} className="input-field" required value={settings.adminSetup?.user} onChange={e => setSettings({...settings, adminSetup: {...settings.adminSetup!, user: e.target.value}})} />
                  <input type="password" placeholder={T.adminPass} className="input-field" required value={settings.adminSetup?.pass} onChange={e => setSettings({...settings, adminSetup: {...settings.adminSetup!, pass: e.target.value}})} />
                </div>
              </div>
            )}
            <div className="flex gap-4">
              {installStep === 2 && <button type="button" onClick={() => setInstallStep(1)} className="flex-1 py-5 border border-white/10 rounded-3xl font-black uppercase text-xs hover:bg-white/5 transition-all">{isRtl ? 'بازگشت' : 'Back'}</button>}
              <button type="submit" className="flex-[2] py-5 bg-accent text-white rounded-3xl font-black uppercase text-sm hover:bg-red-700 transition-all shadow-xl shadow-accent/30">{installStep === 1 ? (isRtl ? 'مرحله بعد' : 'Next Step') : T.finishSetup}</button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={`auth-overlay min-h-screen flex items-center justify-center p-6 ${isRtl ? 'font-fa' : 'ltr'}`}>
        <BackgroundCinematic />
        <div className="glass w-full max-w-md rounded-[4rem] p-12 lg:p-16 space-y-12 animate-in zoom-in-95 duration-1000 shadow-2xl border-white/5">
          <div className="text-center space-y-4">
            <h1 className="logo-text text-8xl tracking-tighter">Moodflix</h1>
            <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.6em]">{authMode === 'login' ? T.loginTitle : T.registerTitle}</p>
          </div>
          <form className="space-y-4" onSubmit={handleAuth}>
            {authMode === 'register' && <input type="text" placeholder={lang === 'fa' ? 'نام کامل' : 'Full Name'} className="input-field" required onChange={e => setAuthData({...authData, name: e.target.value})} />}
            <input type="text" placeholder={T.email} className="input-field" required onChange={e => setAuthData({...authData, email: e.target.value})} />
            <input type="password" placeholder={T.password} className="input-field" required onChange={e => setAuthData({...authData, password: e.target.value})} />
            <button type="submit" className="w-full py-6 bg-accent text-white rounded-3xl font-black uppercase text-sm hover:bg-red-700 transition-all shadow-2xl shadow-accent/40">{authMode === 'login' ? T.loginBtn : T.registerBtn}</button>
          </form>
          <button onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')} className="w-full text-white/30 text-[10px] font-black uppercase hover:text-white transition-all tracking-widest leading-relaxed">
            {authMode === 'login' ? T.noAccount : T.hasAccount}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`layout-wrapper min-h-screen bg-[#020617] ${isRtl ? 'font-fa rtl' : 'ltr'}`} dir={isRtl ? 'rtl' : 'ltr'}>
      <BackgroundCinematic />
      
      {aiLoadingState.isLoading && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-3xl flex items-center justify-center p-10 animate-in fade-in duration-500">
           <div className="max-w-md w-full text-center space-y-16">
              <div className="relative w-48 h-48 mx-auto">
                 <div className="absolute inset-0 border-[12px] border-accent/10 rounded-full" />
                 <div className="absolute inset-0 border-[12px] border-accent rounded-full border-t-transparent animate-spin duration-1000" />
                 <div className="absolute inset-0 flex items-center justify-center text-6xl">🎞️</div>
              </div>
              <div className="space-y-6">
                 <h2 className="text-white text-4xl font-black tracking-tight">{T.loading}</h2>
                 <div className="relative h-20 overflow-hidden">
                    {T.loadingSteps.map((s, i) => (
                      <p key={i} className={`absolute w-full text-white/60 text-xl transition-all duration-700 ${i === aiLoadingState.stepIndex ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>{s}</p>
                    ))}
                 </div>
              </div>
              <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/5">
                 <div className="h-full bg-accent transition-all duration-1000 shadow-[0_0_30px_rgba(229,9,20,0.8)]" style={{ width: `${((aiLoadingState.stepIndex + 1) / T.loadingSteps.length) * 100}%` }} />
              </div>
           </div>
        </div>
      )}

      <aside className={`sidebar glass border-none flex flex-col p-10 z-[60] !rounded-none ${isSidebarOpen ? 'open' : ''}`}>
        <div className="flex justify-between items-center mb-20">
          <h1 className="logo-text text-6xl cursor-pointer" onClick={() => { setActiveTab('home'); setResults(null); }}>Moodflix</h1>
          <button className="lg:hidden text-accent p-3 glass rounded-2xl" onClick={() => setIsSidebarOpen(false)}>
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <nav className="flex-1 space-y-4">
          {[
            { id: 'home', label: T.home, icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
            { id: 'saved', label: T.saved, icon: 'M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z' },
            { id: 'profile', label: T.profile, icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
            user.role === 'admin' && { id: 'admin', label: T.admin, icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' }
          ].filter(Boolean).map(item => (
            <button key={item!.id} onClick={() => { setActiveTab(item!.id as any); setIsSidebarOpen(false); }} className={`nav-item w-full transition-all ${activeTab === item!.id ? 'active' : 'hover:bg-white/5 opacity-50 hover:opacity-100'}`}>
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item!.icon} /></svg>
              <span className="font-black text-lg">{item!.label}</span>
            </button>
          ))}
        </nav>
        <div className="mt-auto space-y-4 pt-10 border-t border-white/5">
           <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="w-full flex items-center justify-between p-5 glass rounded-[2rem] text-[10px] font-black uppercase hover:scale-105 transition-all">
             <span>{theme === 'dark' ? T.lightMode : T.darkMode}</span>
             {theme === 'dark' ? '🌙' : '☀️'}
           </button>
           <button onClick={() => setUser(null)} className="w-full py-5 glass border-accent/20 text-accent rounded-[2rem] text-[10px] font-black uppercase hover:bg-accent hover:text-white transition-all">{T.logout}</button>
        </div>
      </aside>

      <main className="main-content">
        <header className="lg:hidden p-8 glass border-none flex justify-between items-center sticky top-0 z-50">
           <h1 className="logo-text text-4xl">Moodflix</h1>
           <button onClick={() => setIsSidebarOpen(true)} className="p-4 bg-accent/10 text-accent rounded-3xl">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>
           </button>
        </header>

        <div className="max-w-7xl mx-auto p-8 lg:p-20">
          {activeTab === 'home' && (
            !results ? (
              <div className="space-y-24 animate-in fade-in duration-1000">
                <div className="text-center lg:text-right space-y-8">
                  <h2 className="text-7xl lg:text-[10rem] font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-white/10 leading-[1] tracking-tighter drop-shadow-2xl">{T.step1Title}</h2>
                  <p className="text-text-secondary text-2xl lg:text-3xl font-medium opacity-50 max-w-3xl leading-relaxed">{T.subtitle}</p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-6">
                   {MOODS.map(m => (
                     <button key={m.type} onClick={() => setInput({ ...input, primaryMood: m.type })} className={`group relative p-10 rounded-[3rem] border-2 transition-all flex flex-col items-center gap-6 overflow-hidden ${input.primaryMood === m.type ? 'border-accent bg-accent/10 scale-110 shadow-2xl shadow-accent/30' : 'border-white/5 opacity-30 hover:opacity-100 hover:bg-white/5'}`}>
                        <svg className={`w-16 h-16 relative z-10 ${m.color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d={m.icon} strokeWidth={2} /></svg>
                        <span className="text-xs font-black uppercase relative z-10 tracking-[0.2em]">{m.labels[lang]}</span>
                     </button>
                   ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                   <div className="lg:col-span-2 glass p-12 rounded-[4rem] space-y-8 border-white/5">
                      <h4 className="font-black text-sm uppercase tracking-[0.4em] opacity-40">{T.step1More}</h4>
                      <textarea className="w-full bg-transparent border-none text-3xl lg:text-4xl font-bold placeholder:opacity-5 focus:ring-0 resize-none h-48" placeholder={isRtl ? "مثلاً: دلم یه فیلم کلاسیک می‌خواد که آخرش غافلگیر بشم..." : "e.g., I want a classic movie with a twist ending..."} value={input.description} onChange={(e) => setInput({...input, description: e.target.value})} />
                   </div>
                   <div className="glass p-12 rounded-[4rem] flex flex-col justify-center gap-10 border-white/5">
                      <div className="space-y-6">
                        <label className="text-xs font-black uppercase tracking-widest opacity-40">Intensity Level</label>
                        <div className="flex gap-4">
                          {INTENSITIES.map(i => (
                            <button key={i.value} onClick={() => setInput({...input, intensity: i.value})} className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase transition-all ${input.intensity === i.value ? 'bg-accent text-white shadow-lg' : 'bg-white/5 opacity-30 hover:opacity-100'}`}>{i.labels[lang]}</button>
                          ))}
                        </div>
                      </div>
                      <button onClick={handleRecommend} className="w-full py-10 bg-accent text-white rounded-[2.5rem] font-black text-2xl shadow-2xl shadow-accent/50 hover:scale-105 active:scale-95 transition-all">
                        {T.btnRecommend}
                      </button>
                   </div>
                </div>
              </div>
            ) : (
              <div className="space-y-20 animate-in slide-in-from-bottom-20 duration-1000">
                <header className="flex flex-col md:flex-row justify-between items-center gap-12 border-b border-white/5 pb-16">
                   <div className="text-center md:text-right space-y-6">
                      <h2 className="text-6xl lg:text-9xl font-black tracking-tighter">{isRtl ? 'نسخه سینمایی شما' : 'Your Movie Script'}</h2>
                      <p className="text-text-secondary text-2xl max-w-3xl leading-relaxed italic opacity-70">"{results.emotionalMessage}"</p>
                   </div>
                   <button onClick={() => setResults(null)} className="px-16 py-6 glass rounded-full text-sm font-black uppercase tracking-widest border border-accent/30 hover:bg-accent/10 transition-all">{T.tryAgain}</button>
                </header>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                   {results.recommendations.map((m, i) => (
                     <article key={i} className="group relative glass p-0 rounded-[4.5rem] overflow-hidden flex flex-col h-full border-white/5 hover:scale-[1.05] transition-all duration-700 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)]">
                        <div className="relative aspect-[2/3] overflow-hidden">
                           <img src={m.posterUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt={m.title} />
                           <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent" />
                           <div className="absolute bottom-10 left-10 right-10 space-y-4">
                              <div className="flex gap-3">
                                 <span className="bg-accent px-4 py-2 rounded-xl text-[10px] font-black uppercase shadow-xl">IMDB {m.imdbScore || '8.5'}</span>
                                 <span className="bg-white/10 backdrop-blur-xl px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/5">{m.country}</span>
                              </div>
                              <h4 className="text-4xl font-black text-white drop-shadow-2xl">{m.title}</h4>
                           </div>
                        </div>
                        <div className="p-12 space-y-8 flex-1 flex flex-col">
                           <p className="text-white/50 text-lg leading-relaxed line-clamp-4 flex-1">{m.explanation}</p>
                           <div className="flex flex-wrap gap-3 pt-8 border-t border-white/5">
                              {m.genre.map((g, idx) => (
                                <span key={idx} className="text-[10px] font-bold uppercase opacity-30 border border-white/10 px-4 py-2 rounded-full">{g}</span>
                              ))}
                           </div>
                        </div>
                     </article>
                   ))}
                </div>
              </div>
            )
          )}

          {activeTab === 'profile' && (
            <div className="max-w-5xl mx-auto space-y-16 animate-in slide-in-from-top-12 duration-1000">
               <div className="relative glass p-16 lg:p-24 rounded-[5rem] border-white/5 overflow-hidden flex flex-col md:flex-row items-center gap-16">
                  <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-accent/10 blur-[150px] -translate-y-1/2 translate-x-1/2" />
                  <div className="relative group animate-float">
                    <div className="w-56 h-56 bg-accent/5 rounded-full flex items-center justify-center text-accent text-8xl shadow-[0_30px_60px_-15px_rgba(229,9,20,0.4)] border-4 border-white/10 group-hover:scale-110 transition-all">👤</div>
                    <div className="absolute bottom-6 right-6 w-14 h-14 bg-green-500 border-8 border-[#020617] rounded-full flex items-center justify-center text-white text-xl shadow-2xl">✓</div>
                  </div>
                  <div className="text-center md:text-right space-y-6 flex-1">
                    <h2 className="text-8xl lg:text-[9rem] font-black tracking-tighter leading-none">{user.name}</h2>
                    <div className="flex flex-wrap justify-center md:justify-start gap-6 text-accent uppercase text-xs font-black tracking-[0.4em]">
                       <span className="glass px-6 py-3 border-white/10 rounded-2xl shadow-xl">{user.role} Status</span>
                       <span className="glass px-6 py-3 border-white/10 rounded-2xl shadow-xl">{user.email}</span>
                    </div>
                    <p className="text-text-secondary font-medium opacity-50 text-xl">{T.joinedAt}: {user.joinDate}</p>
                  </div>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  <div className="glass p-10 rounded-[3.5rem] border-white/5 space-y-4 hover:bg-accent/5 transition-all">
                     <p className="text-xs font-black uppercase opacity-40 tracking-widest">{T.saved}</p>
                     <h4 className="text-7xl font-black text-accent">{savedMovies.length}</h4>
                  </div>
                  <div className="glass p-10 rounded-[3.5rem] border-white/5 space-y-4 hover:bg-blue-500/5 transition-all">
                     <p className="text-xs font-black uppercase opacity-40 tracking-widest">{T.moodStability}</p>
                     <h4 className="text-7xl font-black text-blue-500">92%</h4>
                  </div>
                  <div className="glass p-10 rounded-[3.5rem] border-white/5 space-y-4 hover:bg-green-500/5 transition-all">
                     <p className="text-xs font-black uppercase opacity-40 tracking-widest">{T.activityLevel}</p>
                     <h4 className="text-7xl font-black text-green-500">High</h4>
                  </div>
                  <div className="glass p-10 rounded-[3.5rem] border-white/5 space-y-4 hover:bg-purple-500/5 transition-all">
                     <p className="text-xs font-black uppercase opacity-40 tracking-widest">Global Rank</p>
                     <h4 className="text-7xl font-black text-purple-500">#42</h4>
                  </div>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                  <div className="md:col-span-2 glass p-16 rounded-[4.5rem] border-white/5 space-y-12">
                     <h4 className="font-black text-2xl flex items-center gap-6">
                        <span className="w-2 h-8 bg-accent rounded-full" />
                        {T.favGenres}
                     </h4>
                     <div className="flex flex-wrap gap-6">
                        {user.preferences.map((p, i) => (
                          <div key={i} className="glass px-8 py-5 border-white/5 rounded-3xl text-lg font-bold flex items-center gap-4 hover:bg-white/10 transition-all group">
                             <div className="w-3 h-3 rounded-full bg-accent group-hover:scale-150 transition-all" />
                             {p}
                          </div>
                        ))}
                     </div>
                  </div>
                  <div className="glass p-16 rounded-[4.5rem] border-white/5 space-y-12">
                     <h4 className="font-black text-2xl flex items-center gap-6">
                        <span className="w-2 h-8 bg-blue-500 rounded-full" />
                        Mood Pulse
                     </h4>
                     <div className="h-48 flex items-end gap-3 px-6">
                        {[40, 70, 45, 90, 65, 85, 30].map((h, i) => (
                          <div key={i} className="flex-1 bg-white/5 rounded-t-2xl relative group">
                             <div className="absolute bottom-0 left-0 right-0 bg-accent rounded-t-2xl transition-all duration-1000 group-hover:bg-blue-500" style={{ height: `${h}%` }} />
                          </div>
                        ))}
                     </div>
                     <p className="text-xs font-bold text-center opacity-30 uppercase tracking-[0.3em]">Engagement Metrics</p>
                  </div>
               </div>
            </div>
          )}

          {activeTab === 'admin' && (
            <div className="space-y-16 animate-in fade-in duration-1000">
               <header className="border-b border-white/5 pb-12 space-y-4">
                  <h2 className="text-8xl font-black tracking-tighter leading-none">{T.admin}</h2>
                  <p className="text-text-secondary text-2xl opacity-60">Moodflix Enterprise Control Center</p>
               </header>
               <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                  <div className="lg:col-span-2 space-y-12">
                     <div className="glass p-12 lg:p-16 rounded-[4.5rem] border-white/5 space-y-10">
                        <h3 className="font-black text-3xl flex items-center gap-6">🛠 {T.adminSettings}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                           <div className="space-y-4">
                             <label className="text-xs font-black opacity-40 uppercase tracking-widest">Gemini API Primary Key</label>
                             <input type="password" value={settings.geminiKey} onChange={(e) => setSettings({...settings, geminiKey: e.target.value})} className="input-field" placeholder="sk-..." />
                           </div>
                           <div className="space-y-4">
                             <label className="text-xs font-black opacity-40 uppercase tracking-widest">AI Reasoning Temperature</label>
                             <input type="range" min="0" max="1" step="0.1" value={settings.temperature} onChange={(e) => setSettings({...settings, temperature: parseFloat(e.target.value)})} className="w-full accent-accent mt-6" />
                           </div>
                        </div>
                        <div className="pt-12 border-t border-white/5 space-y-10">
                           <h4 className="font-black text-2xl text-accent flex items-center gap-4">🌐 {T.sslSettings}</h4>
                           <div className="space-y-8">
                              <div className="space-y-4">
                                 <label className="text-xs font-black opacity-40 uppercase tracking-widest">{T.cfToken}</label>
                                 <input type="password" placeholder="Cloudflare Global API Key / Token" className="input-field" value={settings.sslConfig?.cloudflareToken} onChange={e => setSettings({...settings, sslConfig: {...settings.sslConfig!, cloudflareToken: e.target.value}})} />
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                 <div className="space-y-4">
                                    <label className="text-xs font-black opacity-40 uppercase tracking-widest">{T.cfZone}</label>
                                    <input type="text" placeholder="e.g. 8a2b3c4d..." className="input-field" value={settings.sslConfig?.zoneId} onChange={e => setSettings({...settings, sslConfig: {...settings.sslConfig!, zoneId: e.target.value}})} />
                                 </div>
                                 <div className="space-y-4">
                                    <label className="text-xs font-black opacity-40 uppercase tracking-widest">{T.sslMode}</label>
                                    <select className="input-field bg-[#020617]" value={settings.sslConfig?.sslMode} onChange={e => setSettings({...settings, sslConfig: {...settings.sslConfig!, sslMode: e.target.value as any}})}>
                                       <option value="flexible">Flexible SSL</option>
                                       <option value="full">Full SSL (Strict)</option>
                                       <option value="strict">Strict (Authenticated Origin)</option>
                                    </select>
                                 </div>
                              </div>
                              <div className="flex items-center justify-between glass p-10 rounded-[3rem] border-white/10">
                                 <div className="space-y-2">
                                    <p className="text-xl font-black uppercase tracking-tight">Cloudflare Proxy (CDN)</p>
                                    <p className="text-sm opacity-40">Enable global caching and DDoS protection</p>
                                 </div>
                                 <button onClick={() => setSettings({...settings, sslConfig: {...settings.sslConfig!, proxyStatus: !settings.sslConfig?.proxyStatus}})} className={`relative w-24 h-12 rounded-full transition-all duration-500 shadow-2xl ${settings.sslConfig?.proxyStatus ? 'bg-accent' : 'bg-white/10'}`}>
                                   <div className={`absolute top-2 w-8 h-8 rounded-full bg-white transition-all shadow-lg ${isRtl ? (settings.sslConfig?.proxyStatus ? '-translate-x-14' : '-translate-x-2') : (settings.sslConfig?.proxyStatus ? 'translate-x-14' : 'translate-x-2')}`} />
                                 </button>
                              </div>
                           </div>
                        </div>
                     </div>
                     <div className="glass p-12 lg:p-16 rounded-[4.5rem] border-accent/20 bg-accent/5 overflow-hidden">
                        <header className="mb-12 flex justify-between items-start">
                           <div className="space-y-4">
                             <h3 className="font-black text-3xl flex items-center gap-6">📱 {T.adminMobile}</h3>
                             <p className="text-lg opacity-60 max-w-xl leading-relaxed">{T.apkInstructions}</p>
                           </div>
                           <div className="glass px-6 py-3 border-accent/30 rounded-2xl text-[10px] font-black uppercase text-accent shadow-2xl">Android Native (v3.0)</div>
                        </header>
                        {apkBuildState.isExporting ? (
                          <div className="space-y-12 py-6 animate-in zoom-in-95 duration-700">
                             <div className="flex justify-between items-end">
                                <div className="space-y-3">
                                   <p className="text-accent font-black text-sm uppercase tracking-widest">Generating Binary Assets...</p>
                                   <h4 className="text-white text-3xl font-bold">{T.apkSteps[apkBuildState.stepIndex]}</h4>
                                </div>
                                <span className="text-accent font-black text-7xl">{apkBuildState.progress}%</span>
                             </div>
                             <div className="w-full h-6 bg-white/5 rounded-full overflow-hidden p-2 border border-white/10 shadow-inner">
                                <div className="h-full bg-gradient-to-r from-accent to-pink-600 rounded-full transition-all duration-300 shadow-[0_0_20px_rgba(229,9,20,0.5)]" style={{ width: `${apkBuildState.progress}%` }} />
                             </div>
                             <div className="bg-black/60 p-10 rounded-[3rem] font-mono text-[12px] text-green-500/80 overflow-y-auto h-64 border border-white/10 custom-scrollbar shadow-2xl">
                                {apkBuildState.logs.map((log, i) => <p key={i} className={log.startsWith('>>>') ? 'text-white font-black my-4 border-l-4 border-accent pl-4' : 'opacity-60 pl-8 mb-1'}>{log}</p>)}
                                <div ref={logEndRef} />
                             </div>
                          </div>
                        ) : (
                          <button onClick={handleExportApk} className="w-full py-12 bg-accent text-white rounded-[3rem] font-black uppercase text-2xl shadow-[0_30px_60px_-10px_rgba(229,9,20,0.4)] hover:scale-[1.02] active:scale-95 transition-all">
                             {T.exportApk}
                          </button>
                        )}
                     </div>
                  </div>
                  <div className="space-y-12">
                     <div className="glass p-12 rounded-[4.5rem] bg-accent text-white border-none shadow-[0_40px_80px_-20px_rgba(229,9,20,0.5)] space-y-6 animate-float">
                        <p className="text-xs font-black uppercase opacity-60 tracking-widest">{T.totalRequests}</p>
                        <h4 className="text-[6rem] font-black leading-none">12.4k</h4>
                        <div className="pt-8 border-t border-white/10 text-xs font-bold uppercase tracking-widest flex items-center gap-4">
                           <div className="w-3 h-3 rounded-full bg-white animate-pulse shadow-[0_0_10px_white]" />
                           Real-time Activity Active
                        </div>
                     </div>
                     <div className="glass p-12 rounded-[4.5rem] border-white/5 space-y-8">
                        <div className="space-y-4">
                           <p className="text-xs font-black uppercase opacity-40 tracking-widest">{T.aiSuccessRate}</p>
                           <h4 className="text-6xl font-black text-green-500">99.2%</h4>
                        </div>
                        <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden border border-white/5">
                           <div className="w-[99%] h-full bg-green-500 shadow-[0_0_25px_rgba(34,197,94,0.6)]" />
                        </div>
                        <p className="text-xs opacity-40 font-bold uppercase leading-relaxed tracking-tighter">System running on optimized Gemini-3-Pro architecture with sub-2s latency.</p>
                     </div>
                  </div>
               </div>
            </div>
          )}

          {activeTab === 'saved' && (
            <div className="space-y-20 animate-in fade-in duration-1000">
               <header className="border-b border-white/5 pb-12 flex flex-col md:flex-row justify-between items-end gap-10">
                  <div className="space-y-6">
                    <h2 className="text-8xl lg:text-[9rem] font-black tracking-tighter leading-none">{T.saved}</h2>
                    <p className="text-text-secondary text-2xl opacity-50">{savedMovies.length} items in your encrypted cinema vault.</p>
                  </div>
                  <div className="glass px-8 py-4 border-accent/20 rounded-2xl text-xs font-black uppercase text-accent tracking-widest shadow-2xl">High Security Archive</div>
               </header>
               {savedMovies.length > 0 ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16">
                    {savedMovies.map((m, i) => (
                      <article key={i} className="group glass p-0 rounded-[4.5rem] overflow-hidden flex flex-col h-full border-white/5 hover:scale-[1.05] transition-all duration-700 shadow-2xl">
                         <div className="relative aspect-[2/3] overflow-hidden">
                            <img src={m.posterUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" alt={m.title} />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                            <div className="absolute bottom-8 left-8 right-8">
                               <h4 className="font-black text-3xl mb-2">{m.title}</h4>
                               <p className="text-[10px] font-black uppercase opacity-40 tracking-[0.3em]">{m.genre.join(' • ')}</p>
                            </div>
                         </div>
                      </article>
                    ))}
                 </div>
               ) : (
                 <div className="text-center py-60 opacity-10 space-y-10 animate-pulse">
                    <svg className="w-56 h-56 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" strokeWidth={1} /></svg>
                    <p className="text-5xl font-black uppercase tracking-[0.4em]">{T.noSaved}</p>
                 </div>
               )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
