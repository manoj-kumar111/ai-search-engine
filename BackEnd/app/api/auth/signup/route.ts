import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/utils/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "@/utils/env";

const SignupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, name } = SignupSchema.parse(body);

    const JWT_SECRET = process.env.JWT_SECRET || process.env.SECRET_KEY;
    if (!JWT_SECRET) {
      return NextResponse.json({ error: "Missing JWT_SECRET" }, { status: 500, headers: corsHeaders() });
    }

    const db = await getDb();
    const users = db.collection("users");

    const existing = await users.findOne({ email });
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409, headers: corsHeaders() });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userDoc = { email, name, passwordHash, createdAt: new Date() };
    await users.insertOne(userDoc);

    const token = jwt.sign({ email, name }, JWT_SECRET, { expiresIn: "7d" });
    return NextResponse.json({ token, user: { email, name } }, { headers: corsHeaders() });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input", details: err.errors }, { status: 400, headers: corsHeaders() });
    }
    const message = String(err?.message || err);
    const status = message.includes("MONGODB_URI") ? 500 : 500;
    return NextResponse.json({ error: "Signup failed", message }, { status, headers: corsHeaders() });
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
