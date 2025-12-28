import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/utils/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "@/utils/env";

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = LoginSchema.parse(body);

    const JWT_SECRET = process.env.JWT_SECRET || process.env.SECRET_KEY;
    if (!JWT_SECRET) {
      return NextResponse.json({ error: "Missing JWT_SECRET" }, { status: 500, headers: corsHeaders() });
    }

    const db = await getDb();
    const users = db.collection("users");

    const user = await users.findOne<{ email: string; name: string; passwordHash: string }>({ email });
    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401, headers: corsHeaders() });
    }
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401, headers: corsHeaders() });
    }

    const token = jwt.sign({ email: user.email, name: user.name }, JWT_SECRET, { expiresIn: "7d" });
    return NextResponse.json({ token, user: { email: user.email, name: user.name } }, { headers: corsHeaders() });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input", details: err.errors }, { status: 400, headers: corsHeaders() });
    }
    const message = String(err?.message || err);
    const status = message.includes("MONGODB_URI") ? 500 : 500;
    return NextResponse.json({ error: "Login failed", message }, { status, headers: corsHeaders() });
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
