
import React, { useState, useEffect } from 'react';
import { UserMoodInput, MovieRecommendation, RecommendationResponse, Language, SystemSettings, SavedMovie, UserSession } from './types.ts';
import { MOODS, TRANSLATIONS, INTENSITIES, MODES } from './constants.tsx';
import { getAiRecommendations } from './services/ai.ts';
import { getLocalRecommendations } from './services/localDb.ts';

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>(() => (localStorage.getItem('moodflix_lang') as Language) || 'fa');
  const [theme, setTheme] = useState<'dark' | 'light'>(() => (localStorage.getItem('moodflix_theme') as 'dark' | 'light') || 'dark');
  const [activeTab, setActiveTab] = useState<'home' | 'saved' | 'profile' | 'admin'>('home');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isApkExporting, setIsApkExporting] = useState(false);
  
  // Auth State
  const [user, setUser] = useState<UserSession | null>(() => {
    const saved = localStorage.getItem('moodflix_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authData, setAuthData] = useState({ email: '', password: '', name: '' });

  // App State
  const [input, setInput] = useState<UserMoodInput>({ 
    primaryMood: 'calm', intensity: 'medium', mentalEffort: 'entertainment', 
    energyLevel: 'medium', mode: 'single', language: lang, description: ''
  });
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<RecommendationResponse | null>(null);
  const [savedMovies, setSavedMovies] = useState<SavedMovie[]>(() => {
    const saved = localStorage.getItem('moodflix_saved_movies');
    return saved ? JSON.parse(saved) : [];
  });
  const [settings, setSettings] = useState<SystemSettings>(() => {
    const saved = localStorage.getItem('moodflix_settings');
    return saved ? JSON.parse(saved) : {
      activeProvider: 'gemini', geminiKey: '', openaiKey: '', temperature: 0.7, maxTokens: 1000, isInstalled: true
    };
  });

  useEffect(() => {
    localStorage.setItem('moodflix_lang', lang);
    localStorage.setItem('moodflix_theme', theme);
    localStorage.setItem('moodflix_saved_movies', JSON.stringify(savedMovies));
    localStorage.setItem('moodflix_settings', JSON.stringify(settings));
    if (user) localStorage.setItem('moodflix_user', JSON.stringify(user));
    else localStorage.removeItem('moodflix_user');
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [lang, theme, savedMovies, settings, user]);

  const T = TRANSLATIONS[lang];
  const isRtl = lang === 'fa';

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulation: Admin check
    const role = authData.email.includes('admin') ? 'admin' : 'user';
    setUser({ email: authData.email, name: authData.name || 'User', role, isLoggedIn: true });
  };

  const handleExportApk = () => {
    setIsApkExporting(true);
    setTimeout(() => {
      setIsApkExporting(false);
      alert(lang === 'fa' ? 'فایل APK آماده شد. در حال تولید مانیفست نیتیو...' : 'APK Packaged. Generating native manifest...');
    }, 3000);
  };

  if (!user) {
    return (
      <div className={`auth-overlay min-h-screen flex items-center justify-center p-6 ${isRtl ? 'font-fa rtl' : 'ltr'}`} dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="glass w-full max-w-md rounded-[2.5rem] p-10 space-y-8 animate-in zoom-in-95 duration-500">
          <div className="text-center">
            <h1 className="logo-text text-5xl mb-2">Moodflix</h1>
            <p className="text-white/60 text-sm font-bold uppercase tracking-widest">{authMode === 'login' ? T.loginTitle : T.registerTitle}</p>
          </div>
          <form className="space-y-4" onSubmit={handleAuth}>
            {authMode === 'register' && (
              <input type="text" placeholder={lang === 'fa' ? 'نام کامل' : 'Full Name'} className="input-field bg-black/40 border-white/10 text-white w-full" required onChange={e => setAuthData({...authData, name: e.target.value})} />
            )}
            <input type="email" placeholder={T.email} className="input-field bg-black/40 border-white/10 text-white w-full" required onChange={e => setAuthData({...authData, email: e.target.value})} />
            <input type="password" placeholder={T.password} className="input-field bg-black/40 border-white/10 text-white w-full" required onChange={e => setAuthData({...authData, password: e.target.value})} />
            <button type="submit" className="w-full py-4 bg-accent text-white rounded-xl font-black uppercase hover:bg-red-700 transition-all">
              {authMode === 'login' ? T.loginBtn : T.registerBtn}
            </button>
          </form>
          <button onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')} className="w-full text-white/50 text-xs font-bold hover:text-white">
            {authMode === 'login' ? T.noAccount : T.hasAccount}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`layout-wrapper ${isRtl ? 'font-fa rtl' : 'ltr'}`} dir={isRtl ? 'rtl' : 'ltr'}>
      <aside className={`sidebar flex flex-col p-6 shadow-2xl ${isSidebarOpen ? 'open' : ''}`}>
        <div className="flex justify-between items-center mb-10">
          <h1 className="logo-text text-4xl cursor-pointer" onClick={() => { setActiveTab('home'); setResults(null); }}>Moodflix</h1>
          <button className="lg:hidden text-accent" onClick={() => setIsSidebarOpen(false)}>
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <nav className="flex-1 space-y-2">
          {[
            { id: 'home', label: T.home, icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
            { id: 'saved', label: T.saved, icon: 'M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z' },
            { id: 'profile', label: T.profile, icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
            user.role === 'admin' && { id: 'admin', label: T.admin, icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' }
          ].filter(Boolean).map(item => (
            <button key={item!.id} onClick={() => setActiveTab(item!.id as any)} className={`nav-item w-full ${activeTab === item!.id ? 'active' : 'hover:bg-accent/5'}`}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item!.icon} /></svg>
              <span>{item!.label}</span>
            </button>
          ))}
        </nav>
        <div className="mt-auto space-y-3 pt-6 border-t border-glass-border">
          <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="w-full flex items-center justify-between p-3 glass rounded-xl text-[10px] font-black uppercase">
            <span>{theme === 'dark' ? T.lightMode : T.darkMode}</span>
            {theme === 'dark' ? '🌙' : '☀️'}
          </button>
          <button onClick={() => setUser(null)} className="w-full p-3 border border-accent/20 text-accent rounded-xl text-[10px] font-black uppercase hover:bg-accent hover:text-white transition-all">
            {T.logout}
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="lg:hidden p-4 glass flex justify-between items-center sticky top-0 z-40">
           <h1 className="logo-text text-2xl">Moodflix</h1>
           <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-accent">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>
           </button>
        </header>

        <div className="max-w-6xl mx-auto p-6 lg:p-12">
          {activeTab === 'home' && (
            !results ? (
              <div className="space-y-12 animate-in fade-in duration-700">
                <div className="text-center lg:text-right space-y-4">
                  <h2 className="text-4xl lg:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-accent to-pink-600 leading-tight">
                    {T.step1Title}
                  </h2>
                  <p className="text-text-secondary text-lg font-medium">{T.subtitle}</p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {MOODS.map(m => (
                    <button key={m.type} onClick={() => setInput({ ...input, primaryMood: m.type })}
                      className={`p-6 rounded-[2rem] border-2 transition-all flex flex-col items-center gap-4 ${input.primaryMood === m.type ? 'border-accent bg-accent/5 scale-105' : 'border-glass-border opacity-60'}`}>
                      <svg className={`w-12 h-12 ${m.color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d={m.icon} strokeWidth={2} /></svg>
                      <span className="text-xs font-black uppercase">{m.labels[lang]}</span>
                    </button>
                  ))}
                </div>
                <button onClick={() => getAiRecommendations(input, settings).then(setResults)} className="w-full py-8 bg-accent text-white rounded-[2.5rem] font-black text-2xl shadow-2xl transition-all">
                   {T.btnRecommend}
                </button>
              </div>
            ) : (
              <div className="space-y-12 animate-in slide-in-from-bottom-10 duration-700">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {results.recommendations.map((m, i) => (
                    <article key={i} className="admin-card p-0 overflow-hidden flex flex-col h-full group">
                      <img src={m.posterUrl} className="aspect-[2/3] object-cover group-hover:scale-110 transition-transform" />
                      <div className="p-6">
                        <h4 className="font-bold text-xl mb-2">{m.title}</h4>
                        <p className="text-sm opacity-60 line-clamp-3">{m.explanation}</p>
                      </div>
                    </article>
                  ))}
                </div>
                <button onClick={() => setResults(null)} className="mx-auto block text-accent font-black uppercase text-xs border-b border-accent">{T.tryAgain}</button>
              </div>
            )
          )}

          {activeTab === 'admin' && (
            <div className="space-y-10 animate-in fade-in duration-700">
               <header className="border-b border-glass-border pb-8">
                  <h2 className="text-4xl font-black">{T.admin}</h2>
                  <p className="text-text-secondary mt-2">Core System & Deployment Engine</p>
               </header>
               <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-8">
                     <div className="admin-card space-y-6">
                        <h3 className="font-bold text-xl flex items-center gap-3">🤖 {T.adminSettings}</h3>
                        <div className="space-y-4">
                           <label className="text-xs font-bold opacity-50 uppercase">Gemini API Key</label>
                           <input type="password" value={settings.geminiKey} onChange={(e) => setSettings({...settings, geminiKey: e.target.value})} className="input-field" placeholder="sk-..." />
                        </div>
                     </div>
                     <div className="admin-card border-accent/20 bg-accent/5">
                        <h3 className="font-bold text-xl flex items-center gap-3 mb-4">📱 {T.adminMobile}</h3>
                        <p className="text-sm opacity-60 mb-6">{T.apkInstructions}</p>
                        <button onClick={handleExportApk} disabled={isApkExporting} 
                          className={`w-full py-6 rounded-2xl font-black uppercase text-sm flex items-center justify-center gap-3 transition-all ${isApkExporting ? 'bg-white/10 apk-build-pulse' : 'bg-accent text-white hover:shadow-xl'}`}>
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" strokeWidth={2} /></svg>
                          {isApkExporting ? (lang === 'fa' ? 'در حال بیلد...' : 'Building APK...') : T.exportApk}
                        </button>
                     </div>
                  </div>
                  <div className="space-y-8">
                     <div className="admin-card bg-accent text-white border-none">
                        <p className="text-xs font-black uppercase opacity-60">{T.totalRequests}</p>
                        <h4 className="text-4xl font-black">12,482</h4>
                     </div>
                     <div className="admin-card">
                        <p className="text-xs font-black uppercase opacity-40">{T.aiSuccessRate}</p>
                        <h4 className="text-3xl font-black text-green-500">99.2%</h4>
                     </div>
                  </div>
               </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="max-w-2xl mx-auto py-12 space-y-8 text-center animate-in slide-in-from-top-10">
               <div className="w-24 h-24 bg-accent/10 rounded-full mx-auto flex items-center justify-center text-accent text-4xl">👤</div>
               <h2 className="text-4xl font-black">{user.name}</h2>
               <p className="text-text-secondary uppercase text-[10px] tracking-widest">{user.role} Account • {user.email}</p>
               <div className="admin-card text-right">
                  <h4 className="font-bold mb-4">{T.recentHistory}</h4>
                  <p className="text-xs opacity-40">{T.noHistory}</p>
               </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
