
import { GoogleGenAI, Type } from "@google/genai";
import { UserMoodInput, RecommendationResponse, SystemSettings } from "../types";

const MOVIE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    mediaType: { type: Type.STRING },
    explanation: { type: Type.STRING },
    summary: { type: Type.STRING },
    whyFits: { type: Type.STRING },
    suggestedTime: { type: Type.STRING },
    musicSuggestion: { type: Type.STRING },
    beyondMovie: { type: Type.STRING },
    beforeAfterActivity: { type: Type.STRING },
    shortPlaylist: { type: Type.ARRAY, items: { type: Type.STRING } },
    imdbScore: { type: Type.NUMBER },
    genre: { type: Type.ARRAY, items: { type: Type.STRING } },
    emotionalOutcome: { type: Type.STRING },
    triggerWarnings: { type: Type.ARRAY, items: { type: Type.STRING } },
    country: { type: Type.STRING },
    posterUrl: { type: Type.STRING },
  },
  required: ["title", "mediaType", "explanation", "summary", "whyFits", "suggestedTime", "genre", "emotionalOutcome", "country", "posterUrl"],
};

export const getAiRecommendations = async (input: UserMoodInput, settings: SystemSettings): Promise<RecommendationResponse> => {
  if (settings.activeProvider === 'gemini') {
    return callGemini(input, settings);
  } else if (settings.activeProvider === 'openai') {
    throw new Error("OpenAI Provider structure ready, but integration requires server-side or direct API implementation.");
  }
  throw new Error("Selected provider not supported.");
};

const callGemini = async (input: UserMoodInput, settings: SystemSettings): Promise<RecommendationResponse> => {
  // Safe access to process.env to prevent crashes
  const envKey = typeof process !== 'undefined' ? process.env.API_KEY : undefined;
  const apiKey = settings.geminiKey || envKey;
  
  if (!apiKey) {
    throw new Error("API Key not found. Please provide it in settings.");
  }

  const ai = new GoogleGenAI({ apiKey: apiKey as string });
  
  const targetLang = input.language === 'fa' ? 'Persian (Farsi)' : 'English';

  const likes = input.feedbackHistory?.filter(f => f.type === 'like').map(f => `${f.title} (${f.genre.join(', ')})`).join(', ') || 'None';
  const dislikes = input.feedbackHistory?.filter(f => f.type === 'dislike').map(f => `${f.title} (${f.genre.join(', ')})`).join(', ') || 'None';

  const systemPrompt = `You are an empathetic AI therapist and cinema expert. 
Recommend 1 to 3 movies/media for: Mood=${input.primaryMood}, Mode=${input.mode}.
All text responses must be strictly in ${targetLang}.
Use Google Search tool to find REAL official poster URLs.

USER PREFERENCES:
- Liked: ${likes}
- Disliked: ${dislikes}

Return valid JSON matching the provided schema.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Recommend movies for my mood: ${input.primaryMood}. Mode: ${input.mode}. Description: ${input.description || 'None'}.`,
    config: {
      systemInstruction: systemPrompt,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          recommendations: { type: Type.ARRAY, items: MOVIE_SCHEMA },
          emotionalMessage: { type: Type.STRING },
          packTheme: { type: Type.STRING },
        },
        required: ["recommendations"]
      },
      tools: [{ googleSearch: {} }],
      temperature: settings.temperature
    },
  });

  try {
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Parse Error:", error);
    throw new Error("Failed to parse AI response.");
  }
};
