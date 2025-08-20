import { google } from "@ai-sdk/google";
import { streamText, type CoreMessage, InvalidPromptError, InvalidMessageRoleError } from "ai";
import { NextRequest } from "next/server";

export const runtime = "edge";
export const maxDuration = 60;

// Persona prompt helper
const sysPrompt = (mode: string, lang: string) => {
  let persona = "You are a helpful assistant.";
  if (mode === "gf") persona = "You are a supportive, caring girlfriend.";
  else if (mode === "bf") persona = "You are a friendly, caring boyfriend.";
  else if (mode === "friend") persona = "You are a funny and understanding best friend.";
  else if (mode === "tutor") persona = "You are a patient and knowledgeable tutor.";

  return `${persona} Always respond in ${lang}.`;
};

// POST handler
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, mode = "normal", language = "english" } = body as {
      messages: CoreMessage[];
      mode?: string;
      language?: string;
    };

    if (!messages || messages.length === 0) {
      return new Response(JSON.stringify({ error: "No messages provided." }), { status: 400 });
    }

    // Select Gemini text model
    const model = google("gemini-1.5-flash");

    // Stream response back
    const response = await streamText({
      model,
      system: sysPrompt(mode, language),
      messages,
    });

    return response.toDataStreamResponse();

  } catch (error) {
    console.error("Analyze-text error:", error);

    if (error instanceof InvalidPromptError || error instanceof InvalidMessageRoleError) {
      return new Response(JSON.stringify({ error: "Invalid input format." }), { status: 400 });
    }

    return new Response(JSON.stringify({ error: "Something went wrong in analyze-text." }), { status: 500 });
  }
}
