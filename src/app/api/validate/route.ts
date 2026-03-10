import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

function getOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OpenAI API key is not configured");
  }
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

const VALIDATION_PROMPTS: Record<string, string> = {
  location: `You are a validation assistant. The user was asked for their city and state/country location.
Determine if the input is a valid, real location (city, state/country).

Rules:
- Must contain a recognizable city name or city + state/region/country
- Reject gibberish, random words, names of people, or non-location text
- Accept common abbreviations (e.g. "NYC", "LA", "SF", "New York, NY")
- Accept international locations (e.g. "London, UK", "Mumbai, India")
- Be lenient with minor spelling mistakes — if it's clearly a location, accept it

Respond with ONLY a JSON object:
{
  "valid": true or false,
  "corrected": "The properly formatted location if valid, or empty string if invalid",
  "message": "A short friendly message if invalid, explaining what's needed. Empty if valid."
}`,

  school: `You are a validation assistant. The user was asked for the name of their school (high school, college, or university).
Determine if the input is a plausible real school or university name.

Rules:
- Must sound like a real educational institution name
- Accept high schools (e.g. "Lincoln High School", "Stuyvesant")
- Accept colleges/universities (e.g. "MIT", "Stanford", "UCLA", "University of Michigan")
- Accept abbreviated or informal names (e.g. "Penn State", "Cal Tech")
- Reject gibberish, random words, or clearly non-school text
- Be lenient with minor spelling mistakes — if it's clearly a school name, accept it
- If you recognize the school even with a misspelling, correct it

Respond with ONLY a JSON object:
{
  "valid": true or false,
  "corrected": "The properly formatted school name if valid, or empty string if invalid",
  "message": "A short friendly message if invalid, explaining what's needed. Empty if valid."
}`,
};

export async function POST(request: NextRequest) {
  try {
    const { field, value } = await request.json();

    const systemPrompt = VALIDATION_PROMPTS[field];
    if (!systemPrompt) {
      return NextResponse.json({ valid: true, corrected: value, message: "" });
    }

    const openai = getOpenAIClient();

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `User input: "${value}"` },
      ],
      temperature: 0,
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(
      completion.choices[0]?.message?.content ?? '{"valid":true,"corrected":"","message":""}'
    );

    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error("Validation error:", error);
    // On error, let the user through rather than blocking
    return NextResponse.json({ valid: true, corrected: "", message: "" });
  }
}
