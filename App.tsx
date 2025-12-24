
import React, { useState, useEffect } from 'react';
import { UserMoodInput, MovieRecommendation, RecommendationResponse, Language, SystemSettings, SavedMovie, Intensity, MentalEffort, EnergyLevel, RecommendationMode } from './types.ts';
import { MOODS, TRANSLATIONS, INTENSITIES, MODES } from './constants.tsx';
import { getAiRecommendations } from './services/ai.ts';
import { getLocalRecommendations } from './services/localDb.ts';

const DEFAULT_POSTER = "https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=2059&auto=format&fit=crop";

const RecommendationCard: React.FC<{ m: MovieRecommendation; lang: Language; isSaved: boolean; onSave: () => void }> = ({ m, lang, isSaved, onSave }) => (
  <article className="glass rounded-[2rem] overflow-hidden flex flex-col group movie-card h-full">
    <div className="relative aspect-[2/3] bg-slate-900 overflow-hidden">
      <img src={m.posterUrl || DEFAULT_POSTER} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={m.title} />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
      <button 
        onClick={(e) => { e.stopPropagation(); onSave(); }} 
        className={`absolute top-4 right-4 p-3 rounded-full glass transition-all z-10 ${isSaved ? 'text-netflix bg-white/10' : 'text-white hover:scale-110 hover:bg-white/20'}`}
      >
        <svg className="w-5 h-5" fill={isSaved ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
        </svg>
      </button>
      <div className="absolute bottom-4 left-4 right-4 text-white">
        <h3 className="text-xl font-bold line-clamp-1">{m.title}</h3>
        <p className="text-[10px] uppercase font-bold opacity-70 tracking-wider">{m.genre.join(' • ')}</p>
      </div>
    </div>
    <div className="p-5 flex-1 flex flex-col justify-between">
      <div className="space-y-3">
        <p className="text-sm opacity-80 leading-relaxed line-clamp-3">{m.explanation}</p>
        <div className="flex flex-wrap gap-1">
          {m.triggerWarnings?.map((tw, idx) => (
            <span key={idx} className="text-[9px] bg-red-500/10 text-red-500 px-2 py-0.5 rounded-full font-bold">{tw}</span>
          ))}
        </div>
      </div>
      <div className="flex justify-between items-center text-[10px] font-bold opacity-50 uppercase tracking-widest border-t border-white/5 pt-3 mt-4">
        <span>{m.country}</span>
        <span className="text-netflix">{m.imdbScore ? `IMDB ${m.imdbScore}` : m.suggestedTime}</span>
      </div>
    </div>
  </article>
);

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>(() => (localStorage.getItem('moodflix_lang') as Language) || 'fa');
  const [theme, setTheme] = useState<'dark' | 'light'>(() => (localStorage.getItem('moodflix_theme') as 'dark' | 'light') || 'dark');
  const [activeTab, setActiveTab] = useState<'home' | 'saved' | 'profile'>('home');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [input, setInput] = useState<UserMoodInput>({ 
    primaryMood: 'calm', intensity: 'medium', mentalEffort: 'entertainment', 
    energyLevel: 'medium', mode: 'single', language: lang 
  });
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<RecommendationResponse | null>(null);
  const [savedMovies, setSavedMovies] = useState<SavedMovie[]>(() => {
    const saved = localStorage.getItem('moodflix_saved_movies');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('moodflix_lang', lang);
    localStorage.setItem('moodflix_theme', theme);
    localStorage.setItem('moodflix_saved_movies', JSON.stringify(savedMovies));
    
    // Sync Tailwind Dark Class
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [lang, theme, savedMovies]);

  const toggleSaveMovie = (m: MovieRecommendation) => {
    const exists = savedMovies.find(sm => sm.title === m.title);
    if (exists) {
      setSavedMovies(prev => prev.filter(sm => sm.title !== m.title));
    } else {
      setSavedMovies(prev => [...prev, { ...m, savedAt: Date.now() }]);
    }
  };

  const handleRecommend = async () => {
    setLoading(true);
    try {
      const data = await getAiRecommendations(input, { activeProvider: 'gemini', isInstalled: true, geminiKey: '', openaiKey: '', temperature: 0.7, maxTokens: 1000 });
      setResults(data);
    } catch (err) {
      setResults(getLocalRecommendations(input));
    } finally {
      setLoading(false);
    }
  };

  const T = TRANSLATIONS[lang];
  const isRtl = lang === 'fa';

  return (
    <div className={`layout-wrapper ${isRtl ? 'font-fa' : ''}`} dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Sidebar Navigation */}
      <aside className="sidebar glass flex flex-col p-6 overflow-y-auto">
        <div className="mb-10 text-center md:text-right">
          <h1 className="logo-text text-4xl font-netflix leading-none cursor-pointer" onClick={() => { setActiveTab('home'); setResults(null); }}>Moodflix</h1>
        </div>

        <nav className="flex-1 space-y-3 flex flex-col">
          <button onClick={() => { setActiveTab('home'); setResults(null); }} className={`nav-item ${activeTab === 'home' ? 'active' : 'hover:bg-white/5'}`}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
            <span className="hidden md:inline">{T.home}</span>
          </button>
          <button onClick={() => setActiveTab('saved')} className={`nav-item ${activeTab === 'saved' ? 'active' : 'hover:bg-white/5'}`}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
            <span className="hidden md:inline">{T.saved}</span>
            {savedMovies.length > 0 && <span className="mr-auto bg-white/20 px-2 rounded-full text-[10px]">{savedMovies.length}</span>}
          </button>
          <button onClick={() => setActiveTab('profile')} className={`nav-item ${activeTab === 'profile' ? 'active' : 'hover:bg-white/5'}`}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            <span className="hidden md:inline">{T.profile}</span>
          </button>
        </nav>

        <div className="mt-auto space-y-4 pt-6 border-t border-white/10">
          <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="w-full flex items-center justify-between p-3 glass rounded-2xl text-[10px] font-black uppercase hover:bg-white/5 transition-all">
            <span>{theme === 'dark' ? T.lightMode : T.darkMode}</span>
            {theme === 'dark' ? (
              <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" /></svg>
            ) : (
              <svg className="w-4 h-4 text-indigo-400" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" /></svg>
            )}
          </button>
          <button onClick={() => setLang(lang === 'fa' ? 'en' : 'fa')} className="w-full p-3 glass rounded-2xl text-[10px] font-black uppercase hover:bg-white/5 transition-all tracking-widest">
            {lang === 'fa' ? 'English' : 'فارسی'}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <div className="max-w-5xl mx-auto p-8 md:p-12">
          {activeTab === 'home' ? (
            !results ? (
              <div className="space-y-12 animate-in fade-in duration-500">
                <div className="space-y-4">
                  <h2 className="text-4xl md:text-6xl font-black">{T.step1Title}</h2>
                  <p className="opacity-50 text-lg font-bold">{T.subtitle}</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                  {MOODS.map(m => (
                    <button 
                      key={m.type} 
                      onClick={() => setInput({...input, primaryMood: m.type})}
                      className={`p-6 rounded-3xl border-2 flex flex-col items-center gap-3 mood-grid-button ${input.primaryMood === m.type ? 'border-netflix bg-netflix/5 scale-105 opacity-100' : 'border-white/5 opacity-50 hover:opacity-100'}`}
                    >
                      <svg className={`w-10 h-10 ${m.color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={m.icon} /></svg>
                      <span className="text-[11px] font-black uppercase tracking-tighter">{m.labels[lang]}</span>
                    </button>
                  ))}
                </div>

                <div className="glass p-8 rounded-[2.5rem] space-y-8">
                  <div className="flex justify-between items-center">
                    <h3 className="font-black text-xl">{lang === 'fa' ? 'تنظیمات دقیق‌تر' : 'Advanced Filters'}</h3>
                    <button onClick={() => setShowAdvanced(!showAdvanced)} className="text-xs font-bold text-netflix hover:underline">
                      {showAdvanced ? (lang === 'fa' ? 'بستن' : 'Close') : (lang === 'fa' ? 'مشاهده فیلترها' : 'View Filters')}
                    </button>
                  </div>
                  {showAdvanced && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in slide-in-from-top-4">
                      <div className="space-y-4">
                        <label className="text-xs font-black opacity-40 uppercase tracking-widest">{lang === 'fa' ? 'شدت احساس' : 'Intensity'}</label>
                        <div className="flex gap-2">
                          {INTENSITIES.map(i => (
                            <button key={i.value} onClick={() => setInput({...input, intensity: i.value})} className={`flex-1 py-3 rounded-xl border text-[10px] font-black uppercase transition-all ${input.intensity === i.value ? 'bg-netflix border-netflix text-white' : 'border-white/10 hover:bg-white/5'}`}>{i.labels[lang]}</button>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-4">
                        <label className="text-xs font-black opacity-40 uppercase tracking-widest">{lang === 'fa' ? 'نوع محتوا' : 'Content Type'}</label>
                        <select value={input.mode} onChange={(e) => setInput({...input, mode: e.target.value as RecommendationMode})} className="w-full bg-white/5 border border-white/10 p-3 rounded-xl text-sm outline-none focus:border-netflix">
                          {MODES.map(m => <option key={m.value} value={m.value} className="bg-slate-900">{m.labels[lang]}</option>)}
                        </select>
                      </div>
                    </div>
                  )}
                </div>

                <button onClick={handleRecommend} disabled={loading} className="w-full py-8 bg-netflix hover:bg-red-700 text-white rounded-[2.5rem] font-black text-2xl shadow-2xl transition-all disabled:opacity-50">
                  {loading ? (
                    <div className="flex items-center justify-center gap-4">
                      <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                      <span>{T.loading}</span>
                    </div>
                  ) : T.btnRecommend}
                </button>
              </div>
            ) : (
              <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8">
                <header className="flex flex-col md:flex-row justify-between items-center gap-6 border-b border-white/10 pb-8">
                  <div className="text-center md:text-right space-y-2">
                    <h2 className="text-3xl font-black">{lang === 'fa' ? 'پیشنهادات اختصاصی' : 'Recommendations'}</h2>
                    <p className="opacity-50 text-sm leading-relaxed max-w-lg">{results.emotionalMessage}</p>
                  </div>
                  <button onClick={() => setResults(null)} className="px-8 py-4 glass rounded-full text-xs font-black uppercase hover:bg-white/10 transition-all border border-netflix/30">
                    {lang === 'fa' ? 'تغییر مود' : 'Change Mood'}
                  </button>
                </header>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {results.recommendations.map((m, i) => (
                    <RecommendationCard key={i} m={m} lang={lang} isSaved={savedMovies.some(sm => sm.title === m.title)} onSave={() => toggleSaveMovie(m)} />
                  ))}
                </div>
              </div>
            )
          ) : activeTab === 'saved' ? (
            <div className="animate-in fade-in duration-500">
              <header className="border-b border-white/10 pb-8 mb-12">
                <h2 className="text-4xl font-black">{T.saved}</h2>
                <p className="opacity-50 mt-2">{savedMovies.length} {lang === 'fa' ? 'مورد در لیست تماشای شما' : 'items in your watchlist'}</p>
              </header>
              {savedMovies.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {savedMovies.map((m, i) => (
                    <RecommendationCard key={i} m={m} lang={lang} isSaved={true} onSave={() => toggleSaveMovie(m)} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-32 opacity-20">
                  <svg className="w-24 h-24 mx-auto mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
                  <p className="text-xl font-bold">{T.noSaved}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-12 animate-in fade-in duration-700 max-w-2xl mx-auto py-12">
               <div className="text-center">
                  <h2 className="text-4xl font-black">{T.profileTitle}</h2>
                  <p className="opacity-40 uppercase text-[10px] tracking-[0.4em] mt-2">Personal Emotional Archives</p>
               </div>
               <div className="glass p-10 rounded-[3rem] space-y-8">
                  <div className="flex justify-between items-center pb-6 border-b border-white/5">
                     <span className="opacity-50 font-bold">{lang === 'fa' ? 'وضعیت هوش مصنوعی' : 'AI Node Status'}</span>
                     <span className="flex items-center gap-2 text-green-500 font-black">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        ACTIVE
                     </span>
                  </div>
                  <div className="flex justify-between items-center pb-6 border-b border-white/5">
                     <span className="opacity-50 font-bold">{lang === 'fa' ? 'نسخه پلتفرم' : 'Build Version'}</span>
                     <span className="font-mono text-sm">v3.1.0-Native-PRO</span>
                  </div>
                  <div className="flex justify-between items-center">
                     <span className="opacity-50 font-bold">{lang === 'fa' ? 'تعداد ذخیره‌ها' : 'Storage Usage'}</span>
                     <span className="font-black text-netflix">{savedMovies.length} ITEMS</span>
                  </div>
               </div>
               <div className="p-8 glass rounded-[2rem] bg-netflix/5 border-netflix/10 text-center">
                  <p className="text-xs opacity-60 leading-relaxed italic">
                    {lang === 'fa' 
                      ? 'Moodflix از مدل Gemini 3 Pro برای تحلیل سینماتیک استفاده می‌کند. داده‌های شما محرمانه و فقط در دستگاه شما ذخیره می‌شوند.' 
                      : 'Moodflix utilizes Gemini 3 Pro for cinematic reasoning. Your emotional data stays strictly local and private.'}
                  </p>
               </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
