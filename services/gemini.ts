
import { GoogleGenAI, Type } from "@google/genai";
import { UserMoodInput, RecommendationResponse } from "../types.ts";

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
    posterUrl: { type: Type.STRING, description: "Direct URL to the official high-quality movie poster." },
  },
  required: ["title", "mediaType", "explanation", "summary", "whyFits", "suggestedTime", "genre", "emotionalOutcome", "country", "posterUrl"],
};

export const getMovieRecommendations = async (input: UserMoodInput): Promise<RecommendationResponse> => {
  const apiKey = typeof process !== 'undefined' ? process.env.API_KEY : '';
  const ai = new GoogleGenAI({ apiKey: apiKey as string });
  
  const targetLang = input.language === 'fa' ? 'Persian (Farsi)' : 'English';

  const systemPrompt = `You are an empathetic AI therapist and cinema expert. 
Provide recommendations strictly in ${targetLang}. 
Use Google Search for valid posterUrl.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Find recommendations for mood: ${input.primaryMood}`,
    config: {
      systemInstruction: systemPrompt,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          recommendations: { type: Type.ARRAY, items: MOVIE_SCHEMA },
          emotionalMessage: { type: Type.STRING },
        },
        required: ["recommendations"]
      },
      tools: [{ googleSearch: {} }]
    },
  });

  return JSON.parse(response.text);
};
