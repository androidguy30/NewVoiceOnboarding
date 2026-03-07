import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { PROFILE_EXTRACTION_PROMPT } from "@/lib/system-prompt";

function getOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OpenAI API key is not configured");
  }
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();
    const openai = getOpenAIClient();

    const conversationText = messages
      .map(
        (m: { role: string; content: string }) =>
          `${m.role === "assistant" ? "Assistant" : "User"}: ${m.content}`
      )
      .join("\n");

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: PROFILE_EXTRACTION_PROMPT },
        {
          role: "user",
          content: `Extract the learner profile from this conversation:\n\n${conversationText}`,
        },
      ],
      temperature: 0,
      response_format: { type: "json_object" },
    });

    const profileData = JSON.parse(
      completion.choices[0]?.message?.content ?? "{}"
    );

    return NextResponse.json({ profile: profileData });
  } catch (error: unknown) {
    console.error("Profile extraction error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to extract profile";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
