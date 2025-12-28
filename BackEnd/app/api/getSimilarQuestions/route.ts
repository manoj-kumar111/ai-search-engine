import { google } from "@/utils/clients";
import { NextResponse } from "next/server";
import { SearchResults } from "@/utils/sharedTypes";
import { generateObject } from 'ai';
import { z } from 'zod';
import { env } from "@/utils/env";

export async function POST(request: Request) {
  let { question, sources } = await request.json();

  // Create context from sources
  const sourcesContext = sources && sources.length > 0
    ? sources.map((source: SearchResults) => `Title: ${source.title}\nContent: ${source.content?.substring(0, 2000)}...`).join('\n\n')
    : '';

  try {
    const { object: similarQuestions } = await generateObject({
      model: google('gemini-2.5-flash'),
      schema: z.object({
        questions: z.array(z.string()).length(3).describe("3 related questions."),
      }),
      prompt: `
      You are a helpful assistant that helps the user to ask related questions, based on user's original question and the search results found for that question. Please identify worthwhile topics that can be follow-ups, and write 3 questions no longer than 20 words each. Please make sure that specifics, like events, names, locations, are included in follow up questions so they can be asked standalone. For example, if the original question asks about "the Manhattan project", in the follow up question, do not just say "the project", but use the full name "the Manhattan project". Your related questions must be in the same language as the original question.
      
      Use the search results below to generate more relevant and specific follow-up questions that dive deeper into the topic or explore related aspects mentioned in the sources.
      
      Do NOT repeat the original question.
      
      Original question: ${question}
      
      ${sourcesContext ? `Search results:\n${sourcesContext}` : ''}
      
      Generate 3 related follow-up questions based on the original question and the search results above.`,
    });

    const questions = similarQuestions.questions || [];
    return NextResponse.json(questions, { headers: corsHeaders() });
  } catch (error) {
    console.error('Error generating similar questions:', error);
    // Fallback: create simple follow-ups from sources and question
    const base: string[] = [];
    if (Array.isArray(sources)) {
      for (const s of (sources as SearchResults[]).slice(0, 3)) {
        const title = (s.title ?? "").trim();
        if (title) {
          base.push(`Tell me more about ${title}`);
        }
      }
    }
    while (base.length < 3) {
      base.push(`What are key subtopics of "${question}"?`);
    }
    return NextResponse.json(base.slice(0, 3), { headers: corsHeaders() });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { headers: corsHeaders() });
}

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": env.ALLOWED_ORIGIN,
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}
