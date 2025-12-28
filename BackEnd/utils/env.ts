const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const GOOGLE_CSE_ID = process.env.GOOGLE_CSE_ID;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI || process.env.DATABASE_URL;
const JWT_SECRET = process.env.JWT_SECRET || process.env.SECRET_KEY;

if (!GOOGLE_API_KEY) {
  throw new Error("GOOGLE_API_KEY is not set in the environment variables.");
}
if (!GOOGLE_CSE_ID) {
  throw new Error("GOOGLE_CSE_ID is not set in the environment variables.");
}
if (!GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is not set in the environment variables.");
}

export const env = { GOOGLE_API_KEY, GOOGLE_CSE_ID, GEMINI_API_KEY, MONGODB_URI, JWT_SECRET };
