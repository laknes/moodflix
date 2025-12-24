
import React, { useState, useEffect } from 'react';
import { UserMoodInput, MovieRecommendation, RecommendationResponse, Language, SystemSettings, SavedMovie } from './types.ts';
import { MOODS, TRANSLATIONS } from './constants.tsx';
import { getAiRecommendations } from './services/ai.ts';
import { getLocalRecommendations } from './services/localDb.ts';

const DEFAULT_POSTER = "https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=2059&auto=format&fit=crop";

const RecommendationCard: React.FC<{ m: MovieRecommendation; lang: Language; isSaved: boolean; onSave: () => void }> = ({ m, lang, isSaved, onSave }) => (
  <article className="glass rounded-[2rem] overflow-hidden flex flex-col group movie-card">
    <div className="relative aspect-[2/3] bg-slate-900 overflow-hidden">
      <img src={m.posterUrl || DEFAULT_POSTER} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={m.title} />
      <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent" />
      <button 
        onClick={(e) => { e.stopPropagation(); onSave(); }} 
        className={`absolute top-4 right-4 p-3 rounded-full glass transition-all ${isSaved ? 'text-netflix bg-white/10' : 'text-white hover:scale-110'}`}
      >
        <svg className="w-5 h-5" fill={isSaved ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
        </svg>
      </button>
      <div className="absolute bottom-4 left-4 right-4">
        <h3 className="text-xl font-bold text-white line-clamp-1">{m.title}</h3>
        <p className="text-[10px] uppercase font-bold opacity-70 tracking-wider">{m.genre.join(' • ')}</p>
      </div>
    </div>
    <div className="p-5 flex-1 flex flex-col justify-between">
      <p className="text-sm opacity-80 leading-relaxed line-clamp-3 mb-4">{m.explanation}</p>
      <div className="flex justify-between items-center text-[10px] font-bold opacity-50 uppercase tracking-widest border-t border-white/5 pt-3">
        <span>{m.country}</span>
        <span>{m.suggestedTime}</span>
      </div>
    </div>
  </article>
);

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>(() => (localStorage.getItem('moodflix_lang') as Language) || 'fa');
  const [activeTab, setActiveTab] = useState<'home' | 'saved'>('home');
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

  // Settings are now auto-handled, we use default API key or user can provide in a simpler setting later
  const settings: SystemSettings = {
    activeProvider: 'gemini',
    geminiKey: '', // Will use process.env.API_KEY in the service
    openaiKey: '',
    temperature: 0.7,
    maxTokens: 1000,
    isInstalled: true
  };

  useEffect(() => {
    localStorage.setItem('moodflix_lang', lang);
    localStorage.setItem('moodflix_saved_movies', JSON.stringify(savedMovies));
  }, [lang, savedMovies]);

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
      const data = await getAiRecommendations(input, settings);
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
    <div className={`min-h-screen pb-12 ${isRtl ? 'font-fa rtl' : ''}`} dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 glass border-b border-white/5 px-6 py-4 mb-8">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-8">
            <h1 className="logo-text text-3xl font-netflix leading-none">Moodflix</h1>
            <nav className="hidden md:flex gap-6 text-sm font-bold uppercase tracking-wider opacity-60">
              <button onClick={() => { setActiveTab('home'); setResults(null); }} className={`hover:text-netflix ${activeTab === 'home' && 'text-netflix opacity-100'}`}>{T.home}</button>
              <button onClick={() => setActiveTab('saved')} className={`hover:text-netflix ${activeTab === 'saved' && 'text-netflix opacity-100'}`}>{T.saved} ({savedMovies.length})</button>
            </nav>
          </div>
          <div className="flex gap-4">
            <button onClick={() => setLang(lang === 'fa' ? 'en' : 'fa')} className="text-[10px] font-black uppercase opacity-60 border border-white/20 px-3 py-1.5 rounded-md hover:bg-white/5">
              {lang === 'fa' ? 'EN' : 'FA'}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6">
        {activeTab === 'home' ? (
          !results ? (
            <div className="space-y-12 animate-in fade-in duration-500 max-w-4xl mx-auto text-center">
              <div className="space-y-4">
                <h2 className="text-4xl md:text-6xl font-black">{T.step1Title}</h2>
                <p className="opacity-50 text-lg">{T.subtitle}</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {MOODS.map(m => (
                  <button 
                    key={m.type} 
                    onClick={() => setInput({...input, primaryMood: m.type})}
                    className={`p-6 rounded-3xl border-2 flex flex-col items-center gap-3 mood-grid-button ${input.primaryMood === m.type ? 'border-netflix bg-netflix/5 scale-105' : 'border-white/5 opacity-50'}`}
                  >
                    <svg className={`w-8 h-8 ${m.color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d={m.icon} /></svg>
                    <span className="text-[11px] font-black uppercase tracking-tighter">{m.labels[lang]}</span>
                  </button>
                ))}
              </div>

              <button 
                onClick={handleRecommend} 
                disabled={loading}
                className="w-full py-6 md:py-8 bg-netflix hover:bg-red-700 text-white rounded-[2rem] font-black text-xl md:text-2xl shadow-2xl transition-all disabled:opacity-50"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                    <span>{T.loading}</span>
                  </div>
                ) : T.btnRecommend}
              </button>
            </div>
          ) : (
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
              <header className="flex flex-col md:flex-row justify-between items-center gap-6 border-b border-white/5 pb-8">
                 <div className="text-center md:text-right">
                   <h2 className="text-3xl font-black">{lang === 'fa' ? 'پیشنهادات اختصاصی' : 'Recommendations'}</h2>
                   <p className="opacity-50 text-sm">{lang === 'fa' ? `متناسب با حالِ ${input.primaryMood} شما` : `Tailored for your ${input.primaryMood} mood`}</p>
                 </div>
                 <button onClick={() => setResults(null)} className="px-8 py-4 glass rounded-full text-xs font-black uppercase hover:bg-white/10 transition-all border-netflix/30 border">
                   {lang === 'fa' ? 'تغییر مود' : 'Change Mood'}
                 </button>
              </header>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {results.recommendations.map((m, i) => (
                  <RecommendationCard 
                    key={i} m={m} lang={lang} 
                    isSaved={savedMovies.some(sm => sm.title === m.title)}
                    onSave={() => toggleSaveMovie(m)} 
                  />
                ))}
              </div>
            </div>
          )
        ) : (
          <div className="animate-in fade-in duration-500">
            <header className="border-b border-white/5 pb-8 mb-12">
              <h2 className="text-4xl font-black">{T.saved}</h2>
              <p className="opacity-50 mt-2">{savedMovies.length} {lang === 'fa' ? 'مورد در آرشیو آفلاین شما' : 'items in your offline vault'}</p>
            </header>
            
            {savedMovies.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {savedMovies.map((m, i) => (
                  <RecommendationCard 
                    key={i} m={m} lang={lang} 
                    isSaved={true}
                    onSave={() => toggleSaveMovie(m)} 
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-32 opacity-20">
                <svg className="w-24 h-24 mx-auto mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
                <p className="text-xl font-bold">{T.noSaved}</p>
                <button onClick={() => setActiveTab('home')} className="mt-6 text-netflix underline font-bold uppercase text-xs tracking-widest">{T.home}</button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Mobile Nav */}
      <nav className="fixed bottom-0 left-0 w-full md:hidden glass border-t border-white/10 flex justify-around p-4 z-50">
        <button onClick={() => { setActiveTab('home'); setResults(null); }} className={`p-2 ${activeTab === 'home' && !results ? 'text-netflix' : 'opacity-40'}`}>
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
        </button>
        <button onClick={() => setActiveTab('saved')} className={`p-2 ${activeTab === 'saved' ? 'text-netflix' : 'opacity-40'}`}>
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
        </button>
      </nav>
    </div>
  );
};

export default App;
