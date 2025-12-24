
import { GoogleGenAI, Type } from "@google/genai";
import { UserMoodInput, RecommendationResponse } from "../types";

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
    posterUrl: { type: Type.STRING, description: "Direct URL to the official high-quality movie poster or high-res film still found via search." },
  },
  required: ["title", "mediaType", "explanation", "summary", "whyFits", "suggestedTime", "genre", "emotionalOutcome", "country", "beyondMovie", "beforeAfterActivity", "shortPlaylist", "posterUrl"],
};

export const getMovieRecommendations = async (input: UserMoodInput): Promise<RecommendationResponse> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const targetLang = input.language === 'fa' ? 'Persian (Farsi)' : 'English';

  const systemPrompt = `You are an empathetic AI therapist and cinema expert. 
IMPORTANT: Your task is to recommend movies/media and FIND REAL, VALID image URLs for their posters.
- Use Google Search to find the actual official poster or a high-quality scene from the movie/book/podcast.
- Provide the image link in the 'posterUrl' field. 
- All text responses (explanation, summary, etc.) must be strictly in ${targetLang}.

SPECIAL MODES:
- 'series': Episodic content.
- 'iranian': Iranian cinema/media only.
- 'multimedia': Books and Podcasts.
- 'couples': Shared viewing experiences.

Context: Mood=${input.primaryMood}, Intensity=${input.intensity}, Effort=${input.mentalEffort}, Energy=${input.energyLevel}, Mode=${input.mode}.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Find ${input.mode} recommendations for my mood and include REAL poster image URLs for each.`,
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
      thinkingConfig: { thinkingBudget: 15000 }
    },
  });

  try {
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Parse Error:", error);
    throw new Error("Failed to parse recommendations.");
  }
};
