import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "../config/env";

const SYSTEM_PROMPT = `You are a friendly and helpful office assistant bot for a small company called Smart Office.
Your job is to relay information about the office's lights and fans to staff in a warm, conversational tone.
Keep your replies to 1-3 sentences. Be helpful, slightly casual, and avoid robotic data dumps.
Never use markdown formatting like bold, italics, or bullet points — plain text only.
If the data shows no problems, be reassuring. If there is an alert, be appropriately concerned but not alarmist.`;

let client: GoogleGenerativeAI | null = null;

function getClient(): GoogleGenerativeAI | null {
  if (!env.geminiApiKey) {
    return null;
  }
  if (!client) {
    client = new GoogleGenerativeAI(env.geminiApiKey);
  }
  return client;
}

/**
 * Formats raw office data into a conversational reply using Gemini 1.5 Flash.
 * Falls back to the provided raw string if GEMINI_API_KEY is not set or if the
 * API call fails.
 *
 * @param command  The bot command that was invoked (e.g. "status", "usage")
 * @param rawData  Structured data object describing the current state
 * @param fallback The pre-formatted plain-text fallback string
 */
export async function formatResponse(
  command: string,
  rawData: object,
  fallback: string,
): Promise<string> {
  const gemini = getClient();
  if (!gemini) {
    return fallback;
  }

  try {
    const model = gemini.getGenerativeModel({ model: "gemini-1.5-flash" });

    const userMessage = `Command: ${command}\nData: ${JSON.stringify(rawData, null, 2)}\n\nPlease write a friendly reply based on this data.`;

    const result = await model.generateContent({
      systemInstruction: SYSTEM_PROMPT,
      contents: [{ role: "user", parts: [{ text: userMessage }] }],
      generationConfig: {
        maxOutputTokens: 120,
        temperature: 0.7,
      },
    });

    const text = result.response.text().trim();
    return text || fallback;
  } catch (error) {
    console.error("[LlmFormatter] Gemini API error — using fallback:", error);
    return fallback;
  }
}
