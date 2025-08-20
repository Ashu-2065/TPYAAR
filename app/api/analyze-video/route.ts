import { google } from "@ai-sdk/google";
import { streamText, type CoreMessage, InvalidPromptError, InvalidMessageRoleError } from "ai";
import { NextRequest } from "next/server";

export const runtime = "edge";
export const maxDuration = 60;

// Persona prompt helper
const sysPrompt = (mode: string, lang: string) => {
  let persona = "You are a helpful assistant who explains videos.";
  if (mode === "gf") persona = "You are a supportive girlfriend explaining video content sweetly.";
  else if (mode === "bf") persona = "You are a friendly boyfriend explaining video content clearly.";
  else if (mode === "friend") persona = "You are a fun, understanding best friend analyzing the video.";
  else if (mode === "tutor") persona = "You are a knowledgeable tutor explaining the video content in detail.";

  return `${persona} Always respond in ${lang}.`;
};

// POST handler
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, videoUrl, mode = "normal", language = "english" } = body as {
      messages: CoreMessage[];
      videoUrl?: string;
      mode?: string;
      language?: string;
    };

    if (!messages || messages.length === 0) {
      return new Response(JSON.stringify({ error: "No messages provided." }), { status: 400 });
    }

    if (!videoUrl) {
      return new Response(JSON.stringify({ error: "No video URL provided." }), { status: 400 });
    }

    // Select Gemini video understanding model
    const model = google("gemini-1.5-pro");

    // Stream response
    const response = await streamText({
      model,
      system: sysPrompt(mode, language),
      messages,
      // attaching video reference
      input: [{ video: videoUrl }],
    });

    return response.toDataStreamResponse();

  } catch (error) {
    console.error("Analyze-video error:", error);

    if (error instanceof InvalidPromptError || error instanceof InvalidMessageRoleError) {
      return new Response(JSON.stringify({ error: "Invalid input format." }), { status: 400 });
    }

    return new Response(JSON.stringify({ error: "Something went wrong in analyze-video." }), { status: 500 });
  }
}
