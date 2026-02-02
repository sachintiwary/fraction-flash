import { GoogleGenAI, Type } from "@google/genai";
import { Question } from "../types";
import { formatPercent, generateDistractors, shuffleArray } from "./gameLogic";

// Initialize Gemini Client safely
// If process.env.API_KEY is undefined (e.g. during build or misconfiguration), 
// we use a placeholder to prevent the app from crashing immediately on load.
// The actual API call will fail gracefully later if the key is invalid.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

export const generateAIQuestions = async (count: number = 10): Promise<Question[]> => {
  // Simple check before making request
  if (!process.env.API_KEY) {
    console.warn("API Key is missing. Returning fallback data.");
    // Fallthrough to catch block logic which generates fallback data
    return generateFallbackQuestions(count);
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `Generate ${count} distinct fraction problems for mental math practice. 
      Rules:
      1. Denominators between 7 and 25 (e.g., 13, 17, 19, 23).
      2. Numerators should be greater than 1 (no unit fractions like 1/13).
      3. Return ONLY a JSON array of objects with "num" and "den".`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            problems: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  num: { type: Type.INTEGER },
                  den: { type: Type.INTEGER }
                },
                required: ["num", "den"]
              }
            }
          },
          required: ["problems"]
        }
      }
    });

    if (response.text) {
      const data = JSON.parse(response.text);
      if (data.problems && Array.isArray(data.problems)) {
        return data.problems.map((p: { num: number, den: number }) => {
          const percentStr = formatPercent(p.num, p.den);
          const distractors = generateDistractors(p.num, p.den, percentStr);
          const options = shuffleArray([percentStr, ...distractors]);

          return {
            fraction: `\\frac{${p.num}}{${p.den}}`,
            percent: percentStr,
            options: options
          };
        });
      }
    }
    throw new Error("Invalid response structure");
  } catch (error) {
    console.error("AI Generation Error:", error);
    return generateFallbackQuestions(count);
  }
};

const generateFallbackQuestions = (count: number): Question[] => {
    const fallback: Question[] = [];
    for(let i=0; i<count; i++) {
        const num = Math.floor(Math.random() * 5) + 2;
        const den = Math.floor(Math.random() * 10) + 11;
        const percentStr = formatPercent(num, den);
        const distractors = generateDistractors(num, den, percentStr);
        fallback.push({
            fraction: `\\frac{${num}}{${den}}`,
            percent: percentStr,
            options: shuffleArray([percentStr, ...distractors])
        });
    }
    return fallback;
}