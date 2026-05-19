/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI } from "@google/genai";
import { TaskSuggestion } from "./types";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

export async function getTaskSuggestions(currentTasks: string[]): Promise<TaskSuggestion[]> {
  if (!process.env.GEMINI_API_KEY) {
    // Return high-quality mock suggestions if no API key is provided
    return [
      {
        title: "Focus Block: Deep Strategic Work",
        category: "work",
        priority: "high",
        reason: "Based on your 90% morning productivity peak."
      },
      {
        title: "Hydration & Mobility Drill",
        category: "health",
        priority: "medium",
        reason: "You've been in Focus Mode for a while."
      }
    ];
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `
        You are a discipline and productivity expert. Given the current tasks: [${currentTasks.join(', ')}].
        Suggest 3 new tasks or disciplinary insights that would help improve focus, reduce digital addiction, or balance work/life.
        Return the response as a JSON array of objects with the following structure:
        [
          {
            "title": "Insight/Task title",
            "category": "work" | "personal" | "health" | "other",
            "priority": "low" | "medium" | "high",
            "reason": "Expert reason for the suggestion"
          }
        ]
        ONLY return the JSON.
      `,
      config: {
        responseMimeType: "application/json"
      }
    });

    const text = response.text || "[]";
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Suggestion Error:", error);
    return [];
  }
}
