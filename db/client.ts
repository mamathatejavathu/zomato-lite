import { neon } from "@neondatabase/serverless";

// The one doorway every file uses to talk to the database.
// DATABASE_URL comes from .env.local — it never gets committed to Git.
export const sql = neon(process.env.DATABASE_URL!);
