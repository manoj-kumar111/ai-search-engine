import { NextResponse } from "next/server";
import { SearchResults } from "@/utils/sharedTypes";
import { env } from "@/utils/env";

export async function POST(request: Request) {
  let { question } = await request.json();

  try {
    const url = `https://www.googleapis.com/customsearch/v1?key=${env.GOOGLE_API_KEY}&cx=${env.GOOGLE_CSE_ID}&q=${encodeURIComponent(
      question
    )}&num=6`;

    const googleSearchResponse = await fetch(url);
    if (!googleSearchResponse.ok) {
      // Handle non-JSON error responses gracefully
      let errorBody;
      try {
        errorBody = await googleSearchResponse.json();
        console.error("Google Search API responded with an error:", JSON.stringify(errorBody, null, 2));
        const errorMessage = errorBody.error?.message || "Unknown error from Google Search API.";
        throw new Error(`Google Search API request failed with status ${googleSearchResponse.status}: ${errorMessage}`);
      } catch (e) {
        const textError = await googleSearchResponse.text();
        console.error("Google Search API responded with a non-JSON error:", textError);
        throw new Error(`Google Search API request failed with status ${googleSearchResponse.status}.`);
      }
    }
    const searchData = await googleSearchResponse.json();

    if (!searchData.items) {
      return NextResponse.json([]);
    }

    const results: SearchResults[] = searchData.items.map((item: any) => ({
      title: item.title,
      url: item.link,
      content: item.snippet,
    }));

    return NextResponse.json(results);
  } catch (error) {
    console.error("Error in getSources/route.ts:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch search results" }),
      { status: 500 }
    );
  }
}
