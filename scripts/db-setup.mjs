// Applies db/schema.sql to the Neon database, seeds the one restaurant
// and its three reviews, then prints the rows so a human can look at them.
// Run with: npm run db:setup
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { neon } from "@neondatabase/serverless";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set. Is .env.local present?");
  process.exit(1);
}

const sql = neon(url);

// --- 1. Apply the schema (safe to re-run: "already exists" is fine) ---
const file = readFileSync(join(process.cwd(), "db", "schema.sql"), "utf8");
const statements = file
  .split(";")
  .map((s) => s.trim())
  .filter(Boolean);

for (const statement of statements) {
  try {
    await sql.query(statement);
  } catch (err) {
    if (err && err.code === "42P07") {
      // 42P07 = "relation already exists" — the table is there, nothing to do.
      continue;
    }
    throw err;
  }
}
console.log("Schema applied.");

// --- 2. Seed (safe to re-run: only seeds if the restaurant is missing) ---
const existing = await sql`
  SELECT id FROM restaurants WHERE name = 'Ludhiana Burrito'
`;

if (existing.length > 0) {
  console.log("Ludhiana Burrito already seeded — skipping.");
} else {
  const [restaurant] = await sql`
    INSERT INTO restaurants (name, cuisine, area)
    VALUES ('Ludhiana Burrito', 'Indian', 'Sector 32')
    RETURNING id
  `;
  await sql`
    INSERT INTO reviews (restaurant_id, rating, comment, created_at) VALUES
      (${restaurant.id}, 5, 'Paneer burrito is unreal',  NOW() - INTERVAL '8 days'),
      (${restaurant.id}, 4, 'Good, but slow service',    NOW() - INTERVAL '6 days'),
      (${restaurant.id}, 4, 'Solid. Would repeat.',      NOW() - INTERVAL '2 days')
  `;
  console.log("Seeded Ludhiana Burrito with 3 reviews.");
}

// --- 3. Show the rows ---
const restaurants = await sql`SELECT * FROM restaurants ORDER BY id`;
const reviews = await sql`SELECT * FROM reviews ORDER BY id`;

console.log("\nTable: restaurants");
console.table(
  restaurants.map((r) => ({
    id: r.id,
    name: r.name,
    cuisine: r.cuisine,
    area: r.area,
  }))
);

console.log("Table: reviews");
console.table(
  reviews.map((r) => ({
    id: r.id,
    restaurant_id: r.restaurant_id,
    rating: r.rating,
    comment: r.comment,
    created_at: r.created_at.toISOString(),
  }))
);
