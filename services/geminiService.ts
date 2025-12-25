
import { GoogleGenAI, Type } from "@google/genai";
import { Thought, AIReflection } from "../types";

// Always initialize with the direct process.env.API_KEY named parameter as per library rules
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeThoughts = async (thoughts: Thought[]): Promise<AIReflection | null> => {
  if (thoughts.length === 0) return null;

  const prompt = `
    Analyze the following collection of random thoughts and provide a reflection.
    Thoughts:
    ${thoughts.map(t => `- ${t.content}`).join('\n')}
  `;

  try {
    // Generate content using the recommended pattern and model for general text tasks
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: "You are a poetic, philosophical observer. Your goal is to synthesize random thoughts into a meaningful reflection. Be concise, empathetic, and slightly mysterious.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING, description: "A high-level synthesis of what's on the user's mind." },
            themes: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Recurring motifs or themes found in the thoughts." },
            sentiment: { type: Type.STRING, description: "The overall emotional landscape (e.g., Restless, Melancholic, Inspired)." },
            zenQuote: { type: Type.STRING, description: "A short, zen-like quote generated specifically for this state of mind." }
          },
          required: ["summary", "themes", "sentiment", "zenQuote"]
        }
      }
    });

    // Access the text property directly (it's a getter, not a method)
    const text = response.text?.trim();
    if (!text) return null;
    return JSON.parse(text) as AIReflection;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return null;
  }
};
