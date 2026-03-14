import { GoogleGenAI } from "@google/genai";
import { BatteryState } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function getSmartOptimizationTip(state: BatteryState): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `As a battery health expert, give a short, actionable optimization tip for a phone with these stats: 
      Level: ${state.level * 100}%, 
      Charging: ${state.charging}, 
      Temp: ${state.temperature}°C, 
      Health: ${state.health}%. 
      Keep it under 20 words.`,
    });
    return response.text || "Keep your phone between 20% and 80% for optimal battery longevity.";
  } catch (error) {
    console.error("AI Service Error:", error);
    return "Reducing screen brightness can significantly extend your battery life today.";
  }
}

export async function getHealthAnalysis(state: BatteryState): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze this battery health: ${state.health}%. Cycles: ${state.cycles}. 
      Is it normal? Give a reassuring 1-sentence summary.`,
    });
    return response.text || "Your battery is in excellent condition and performing as expected.";
  } catch (error) {
    console.error("AI Service Error:", error);
    return "Your battery health is good. Continue following care tips to maintain it.";
  }
}
