import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function GET(request: Request) {
  try {
    const JWT_SECRET = process.env.JWT_SECRET || process.env.SECRET_KEY;
    if (!JWT_SECRET) {
      return NextResponse.json({ error: "Missing JWT_SECRET" }, { status: 500 });
    }
    const auth = request.headers.get("authorization") || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
    if (!token) {
      return NextResponse.json({ error: "No token" }, { status: 401 });
    }
    const payload = jwt.verify(token, JWT_SECRET) as { email: string; name: string; iat: number; exp: number };
    return NextResponse.json({ user: { email: payload.email, name: payload.name } });
  } catch (err: any) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}
