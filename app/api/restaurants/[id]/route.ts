import { NextResponse } from "next/server";
import { sql } from "@/db/client";

// GET /api/restaurants/[id] — everything the restaurant page needs,
// in exactly the shape the screen will show it. The frontend does zero maths.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const restaurantId = Number(id);

  if (!Number.isInteger(restaurantId)) {
    return NextResponse.json(
      { error: "Restaurant not found." },
      { status: 404 }
    );
  }

  const [restaurant] = await sql`
    SELECT name, cuisine, area FROM restaurants WHERE id = ${restaurantId}
  `;
  if (!restaurant) {
    return NextResponse.json({ error: "Restaurant not found." }, { status: 404 });
  }

  // The facts: every review for this restaurant, newest first.
  // (id DESC as a tie-breaker when two reviews share the same timestamp.)
  type DbReview = {
    id: number;
    rating: number;
    comment: string;
    created_at: string | Date;
  };
  const allReviews = (await sql`
    SELECT id, rating, comment, created_at
    FROM reviews
    WHERE restaurant_id = ${restaurantId}
    ORDER BY created_at DESC, id DESC
  `) as DbReview[];

  // The answers: computed fresh, right now, from the facts. Nothing stored.
  // COUNT(*) — how many facts exist. AVG(rating) — the average of those facts,
  // rounded to one decimal place here in the backend.
  const [stats] = await sql`
    SELECT COUNT(*)::int AS total, AVG(rating) AS average
    FROM reviews
    WHERE restaurant_id = ${restaurantId}
  `;
  const averageRating =
    stats.total === 0 ? null : Math.round(Number(stats.average) * 10) / 10;

  // latestReview is the newest review; reviews is every OTHER review, newest
  // first — the page shows the latest one separately and must not print it twice.
  const toReview = (r: { id: number; rating: number; comment: string; created_at: string | Date }) => ({
    id: r.id,
    rating: r.rating,
    comment: r.comment,
    createdAt: new Date(r.created_at).toISOString(),
  });
  const latestReview = allReviews.length > 0 ? toReview(allReviews[0]) : null;
  const olderReviews = allReviews.slice(1).map(toReview);

  return NextResponse.json({
    name: restaurant.name,
    cuisine: restaurant.cuisine,
    area: restaurant.area,
    averageRating,
    totalReviews: stats.total,
    latestReview,
    reviews: olderReviews,
  });
}
