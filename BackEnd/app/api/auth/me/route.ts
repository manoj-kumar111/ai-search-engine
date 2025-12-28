import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { env } from "@/utils/env";

export async function GET(request: Request) {
  try {
    const JWT_SECRET = process.env.JWT_SECRET || process.env.SECRET_KEY;
    if (!JWT_SECRET) {
      return NextResponse.json({ error: "Missing JWT_SECRET" }, { status: 500, headers: corsHeaders() });
    }
    const auth = request.headers.get("authorization") || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
    if (!token) {
      return NextResponse.json({ error: "No token" }, { status: 401, headers: corsHeaders() });
    }
    const payload = jwt.verify(token, JWT_SECRET) as { email: string; name: string; iat: number; exp: number };
    return NextResponse.json({ user: { email: payload.email, name: payload.name } }, { headers: corsHeaders() });
  } catch (err: any) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401, headers: corsHeaders() });
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
