
export type MoodType = 'sad' | 'calm' | 'anxious' | 'lonely' | 'happy' | 'angry' | 'empty' | 'hopeful' | 'romantic' | 'couple';
export type Intensity = 'low' | 'medium' | 'high';
export type MentalEffort = 'none' | 'deep' | 'entertainment';
export type EnergyLevel = 'very-low' | 'low' | 'medium' | 'high';
export type RecommendationMode = 'single' | 'three-options' | 'pack' | 'support' | 'series' | 'iranian' | 'multimedia' | 'couples' | 'mind-bending' | 'nostalgic';
export type MediaType = 'movie' | 'series' | 'book' | 'podcast';
export type Language = 'fa' | 'en';
export type AiProvider = 'gemini' | 'openai' | 'anthropic';
export type FeedbackType = 'like' | 'dislike' | null;

export interface MovieRecommendation {
  title: string;
  mediaType: MediaType;
  explanation: string;
  summary: string;
  whyFits: string;
  suggestedTime: string;
  musicSuggestion?: string;
  beyondMovie?: string;
  beforeAfterActivity?: string;
  shortPlaylist?: string[];
  imdbScore?: number;
  genre: string[];
  emotionalOutcome: string;
  triggerWarnings?: string[];
  country?: string;
  posterUrl?: string;
  feedback?: FeedbackType;
}

export interface SavedMovie extends MovieRecommendation {
  savedAt: number;
}

export interface UserMoodInput {
  primaryMood: MoodType;
  intensity: Intensity;
  mentalEffort: MentalEffort;
  energyLevel: EnergyLevel;
  description?: string;
  mode: RecommendationMode;
  avoidance?: string[];
  language: Language;
  feedbackHistory?: { title: string; type: FeedbackType; genre: string[] }[];
}

export interface RecommendationResponse {
  recommendations: MovieRecommendation[];
  emotionalMessage?: string;
  packTheme?: string;
  packMusicSuggestion?: string;
}

export interface MoodHistoryEntry {
  mood: MoodType;
  timestamp: number;
  movieTitles: string[];
  language: Language;
}

export interface SystemSettings {
  activeProvider: AiProvider;
  geminiKey: string;
  openaiKey: string;
  temperature: number;
  maxTokens: number;
  isInstalled: boolean;
  serverAddress?: string;
  dbConfig?: {
    host: string;
    user: string;
    name: string;
  };
}

export interface UserSession {
  email: string;
  name: string;
  role: 'user' | 'admin';
  isLoggedIn: boolean;
}
