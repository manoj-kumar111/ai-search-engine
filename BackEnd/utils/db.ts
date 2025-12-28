import { MongoClient, Db } from "mongodb";

let client: MongoClient | null = null;
let db: Db | null = null;

export async function getDb(): Promise<Db> {
  if (db) return db;

  const uri = process.env.MONGODB_URI || process.env.MONGO_URI || process.env.DATABASE_URL;
  if (!uri) {
    throw new Error("MongoDB connection string is not set (expected MONGODB_URI or MONGO_URI or DATABASE_URL).");
  }

  if (!client) {
    client = new MongoClient(uri);
  }
  if (!db) {
    await client.connect();
    db = client.db(); // use default DB from URI
  }
  return db;
}

