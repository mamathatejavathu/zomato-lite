import { NextResponse } from "next/server";
import { sql } from "@/db/client";

// POST /api/reviews — save a review.
// Contract: { "restaurantId": 1, "rating": 4, "comment": "..." } -> { "success": true, "reviewId": 104 }
export async function POST(request: Request) {
  // Parse the JSON body. If it is not JSON at all, that is a 400.
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Request body must be valid JSON." },
      { status: 400 }
    );
  }

  const { restaurantId, rating, comment } = (body ?? {}) as {
    restaurantId?: unknown;
    rating?: unknown;
    comment?: unknown;
  };

  // Check 1: rating must be a whole number from 1 to 5.
  // The frontend star picker limits this, but the frontend is just one polite
  // visitor — anyone with a terminal can call this API directly.
  if (
    typeof rating !== "number" ||
    !Number.isInteger(rating) ||
    rating < 1 ||
    rating > 5
  ) {
    return NextResponse.json(
      { error: "Rating must be a whole number from 1 to 5." },
      { status: 400 }
    );
  }

  // Check 2: comment must be a non-empty string after trimming whitespace.
  if (typeof comment !== "string" || comment.trim().length === 0) {
    return NextResponse.json(
      { error: "Comment must not be empty." },
      { status: 400 }
    );
  }

  // Check 3: the restaurant must actually exist. This one is a database lookup.
  if (typeof restaurantId !== "number" || !Number.isInteger(restaurantId)) {
    return NextResponse.json(
      { error: "That restaurant does not exist." },
      { status: 400 }
    );
  }
  const [restaurant] =
    await sql`SELECT id FROM restaurants WHERE id = ${restaurantId}`;
  if (!restaurant) {
    return NextResponse.json(
      { error: "That restaurant does not exist." },
      { status: 400 }
    );
  }

  // All checks passed. Insert exactly one row. Nothing else changes.
  // (The database itself also refuses rating < 1 or > 5 — defence in depth.)
  const [inserted] = await sql`
    INSERT INTO reviews (restaurant_id, rating, comment)
    VALUES (${restaurantId}, ${rating}, ${comment})
    RETURNING id
  `;

  return NextResponse.json(
    { success: true, reviewId: inserted.id },
    { status: 201 }
  );
}
