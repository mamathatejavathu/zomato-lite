"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Star from "@/components/Star";

const RATING_CAPTIONS = ["", "Terrible", "Bad", "Okay", "Good", "Excellent"];

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
        <p className="text-[#a1a1a3]">Restaurant not found.</p>
      </Main>
    );
  }

  return (
    <Main>
      {/* Small ambience photo header */}
      <div className="relative h-28 w-full overflow-hidden rounded-2xl border border-[#2a2a2e]">
        <Image
          src="/images/interior.jpg"
          alt="Restaurant ambience"
          fill
          priority
          sizes="(max-width: 640px) 100vw, 560px"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
      </div>

      <p className="mt-4 text-sm text-[#a1a1a3]">Write a review for</p>
      <h1 className="mt-1 text-2xl font-bold tracking-tight text-white">
        {name ?? "…"}
      </h1>

      <form onSubmit={handleSubmit} className="mt-7">
        {/* A star picker, 1 to 5, clickable, with a clear selected state
            and a Zomato-style caption that describes the chosen rating */}
        <label className="block text-sm font-semibold">Your rating</label>
        <div className="mt-3 flex gap-1.5" role="radiogroup" aria-label="Rating">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={rating === n}
              aria-label={`${n} star${n > 1 ? "s" : ""}`}
              onClick={() => setRating(n)}
              className="rounded-lg p-1 transition-transform hover:scale-110"
            >
              <Star
                filled={n <= rating}
                className="h-9 w-9 text-[#E23744]"
              />
            </button>
          ))}
        </div>
        <p
          className={`mt-2 h-5 text-sm font-semibold ${
            rating > 0 ? "text-[#E23744]" : "text-transparent"
          }`}
          aria-live="polite"
        >
          {RATING_CAPTIONS[rating]}
        </p>

        {/* A comment box */}
        <label htmlFor="comment" className="mt-4 block text-sm font-semibold">
          Your comment
        </label>
        <textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          placeholder="Share your experience…"
          className="mt-2 w-full resize-none rounded-xl border border-[#34343a] bg-[#232327] px-4 py-3 text-base text-[#f4f4f5] shadow-sm outline-none placeholder:text-[#6b6b70] focus:border-[#E23744]"
        />

        {error && <p className="mt-3 text-sm font-medium text-[#E23744]">{error}</p>}

        {/* Submit, disabled until a rating is picked and the comment is non-empty */}
        <button
          type="submit"
          disabled={!canSubmit}
          className="mt-5 w-full rounded-xl bg-[#E23744] px-5 py-3.5 font-semibold text-white shadow-sm transition-colors hover:bg-[#c92a37] disabled:opacity-40"
        >
          {submitting ? "Submitting…" : "Submit Review"}
        </button>
      </form>
    </Main>
  );
}

function Main({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto max-w-[560px] px-6 py-4">{children}</main>
  );
}
