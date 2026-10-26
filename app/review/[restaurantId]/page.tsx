"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function ReviewPage() {
  const { restaurantId } = useParams<{ restaurantId: string }>();
  const router = useRouter();

  const [name, setName] = useState<string | null>(null);
  const [missing, setMissing] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // The restaurant name at the top, so I know what I am reviewing.
  // The name comes from the same GET endpoint the restaurant page uses.
  useEffect(() => {
    let alive = true;
    fetch(`/api/restaurants/${restaurantId}`)
      .then(async (res) => {
        if (!res.ok) {
          if (alive) setMissing(true);
          return null;
        }
        const json = await res.json();
        if (alive) setName(json.name);
        return json;
      })
      .catch(() => {
        if (alive) setMissing(true);
      });
    return () => {
      alive = false;
    };
  }, [restaurantId]);

  const canSubmit =
    rating >= 1 && comment.trim().length > 0 && !submitting;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurantId: Number(restaurantId),
          rating,
          comment,
        }),
      });
      const data = await res.json().catch(() => null);
      if (res.ok) {
        // Success: send me to the restaurant page to see the result.
        router.push(`/restaurant/${restaurantId}`);
      } else {
        // If the API returns a 400, show the error message from the response.
        // Do not invent a message — display what the backend said.
        setError(
          data && typeof data.error === "string"
            ? data.error
            : `Request failed (${res.status}).`
        );
        setSubmitting(false);
      }
    } catch {
      setError("Could not reach the server. Try again.");
      setSubmitting(false);
    }
  }

  if (missing) {
    return (
      <Main>
        <p className="text-stone-500">Restaurant not found.</p>
      </Main>
    );
  }

  return (
    <Main>
      <p className="text-sm text-stone-500">Write a review for</p>
      <h1 className="mt-1 text-2xl font-semibold tracking-tight">
        {name ?? "…"}
      </h1>

      <form onSubmit={handleSubmit} className="mt-8">
        {/* A star picker, 1 to 5, clickable, with a clear selected state */}
        <label className="block text-sm font-medium">Your rating</label>
        <div className="mt-2 flex gap-1" role="radiogroup" aria-label="Rating">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={rating === n}
              aria-label={`${n} star${n > 1 ? "s" : ""}`}
              onClick={() => setRating(n)}
              className="p-1 text-3xl leading-none transition-colors"
            >
              <span className={n <= rating ? "text-amber-700" : "text-stone-300 hover:text-stone-400"}>
                ★
              </span>
            </button>
          ))}
        </div>

        {/* A comment box */}
        <label htmlFor="comment" className="mt-6 block text-sm font-medium">
          Your comment
        </label>
        <textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          placeholder="What did you think?"
          className="mt-2 w-full resize-none rounded-lg border border-stone-300 bg-white px-3 py-2 text-base outline-none focus:border-stone-500"
        />

        {error && <p className="mt-3 text-sm text-amber-700">{error}</p>}

        {/* Submit, disabled until a rating is picked and the comment is non-empty */}
        <button
          type="submit"
          disabled={!canSubmit}
          className="mt-6 rounded-lg bg-stone-900 px-5 py-2.5 text-sm font-medium text-stone-50 disabled:opacity-40"
        >
          {submitting ? "Submitting…" : "Submit"}
        </button>
      </form>
    </Main>
  );
}

function Main({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto min-h-screen max-w-[560px] px-6 py-10">{children}</main>
  );
}
