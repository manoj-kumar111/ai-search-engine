import { generateText } from 'ai';
import { SearchResults } from "@/utils/sharedTypes";
import { google } from '@/utils/clients';
import { env } from "@/utils/env";

export const maxDuration = 45;

export async function POST(request: Request) {
  try {
    const { question, sources } = await request.json();

    if (!sources || !Array.isArray(sources)) {
      return new Response(JSON.stringify({ error: 'Invalid sources format' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const finalResults: SearchResults[] = sources;

    const mainAnswerPrompt = `
    Given a user question and some context, please write a clean, concise and accurate answer to the question based on the context. You will be given a set of related contexts to the question, each starting with a reference number like [[citation:x]], where x is a number. Please use the context when crafting your answer.

    Your answer must be correct, accurate and written by an expert using an unbiased and professional tone. Please limit to 1024 tokens. Do not give any information that is not related to the question, and do not repeat. Say "information is missing on" followed by the related topic, if the given context do not provide sufficient information.

    Here are the set of contexts:

    <contexts>
    ${finalResults.map(
      (result, index) => `[[citation:${index}]] ${result.content.slice(0, 10_000)} \n\n`,
    )}
    </contexts>

    Remember, don't blindly repeat the contexts verbatim and don't tell the user how you used the citations – just respond with the answer. It is very important for my career that you follow these instructions. Here is the user question:
   
    IMPORTANT: Return the answer as properly structured HTML with these specific requirements:
    - Use h2 for main headings (e.g., <h2>How Photosynthesis Works</h2>)
    - Use h3 for subheadings (e.g., <h3>Light-dependent reactions</h3>)
    - Use numbered lists for steps (e.g., <ol><li>Step 1</li><li>Step 2</li></ol>)
    - Use bullet points for lists (e.g., <ul><li>Point 1</li><li>Point 2</li></ul>)
    - Use <p> tags for paragraphs
    - Use <strong> for emphasis
    - For mathematical equations, use <code> tags (e.g., <code>6 CO₂ + 6 H₂O + light energy → C₆H₁₂O₆ + 6 O₂</code>)
    - Do NOT include body, head, or html tags
    - Do NOT use markdown
    - Do NOT include citations or references

    Example structure:
    <h2>Main Topic</h2>
    <p>Introduction paragraph explaining the topic.</p>

    <h3>Subsection</h3>
    <ul>
    <li>First point</li>
    <li>Second point</li>
    </ul>

    <p>Additional explanation.</p>

    Never output References or citations!
    `;

    try {
      const { text } = await generateText({
        model: google('gemini-2.5-flash'),
        system: mainAnswerPrompt,
        messages: [
          {
            role: 'user',
            content: question,
          },
        ],
      });
      return new Response(text, {
        status: 200,
        headers: { 'Content-Type': 'text/plain; charset=utf-8', ...corsHeaders() },
      });
    } catch (modelError: any) {
      const message = String(modelError?.message || '');
      const isQuota =
        message.includes('quota') ||
        message.includes('RESOURCE_EXHAUSTED') ||
        message.includes('429');

      if (isQuota) {
        const html = `
          <h2>${question}</h2>
          <p><strong>Note:</strong> The AI model quota is temporarily exceeded. Showing a synthesized answer from available sources.</p>
          <h3>Summary</h3>
          <ul>
            ${finalResults
              .slice(0, 6)
              .map(
                (r) =>
                  `<li><strong>${r.title}</strong>: ${r.content}</li>`
              )
              .join('')}
          </ul>
          <h3>Steps to explore further</h3>
          <ol>
            <li>Open the most relevant sources and verify details.</li>
            <li>Refine the query with specific terms or subtopics.</li>
            <li>Retry later when model quota resets.</li>
          </ol>
        `.trim();
        return new Response(html, {
          status: 200,
          headers: { 'Content-Type': 'text/plain; charset=utf-8', ...corsHeaders() },
        });
      }
      throw modelError;
    }
  } catch (error) {
    console.error('Error in getAnswer:', error);
    return new Response(
      JSON.stringify({ error: 'An error occurred while processing your request' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders() },
      }
    );
  }
}

export async function OPTIONS() {
  return new Response(null, { headers: corsHeaders() });
}

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": env.ALLOWED_ORIGIN,
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}
