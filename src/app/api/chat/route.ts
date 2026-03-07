import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { ONBOARDING_SYSTEM_PROMPT } from "@/lib/system-prompt";

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

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: ONBOARDING_SYSTEM_PROMPT },
        ...messages,
      ],
      temperature: 0.7,
      max_tokens: 300,
    });

    const reply = completion.choices[0]?.message?.content ?? "";
    const isComplete = reply.includes("[ONBOARDING_COMPLETE]");
    const cleanedReply = reply.replace("[ONBOARDING_COMPLETE]", "").trim();

    return NextResponse.json({
      message: cleanedReply,
      isComplete,
    });
  } catch (error: unknown) {
    console.error("Chat API error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to get response";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
