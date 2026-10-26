"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type Review = {
  id: number;
  rating: number;
  comment: string;
  createdAt: string;
};

type RestaurantData = {
  name: string;
  cuisine: string;
  area: string;
  averageRating: number | null;
  totalReviews: number;
  latestReview: Review | null;
  reviews: Review[];
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

export default function RestaurantPage() {
  const { id } = useParams<{ id: string }>();
  const [status, setStatus] = useState<"loading" | "missing" | "ready">("loading");
  const [data, setData] = useState<RestaurantData | null>(null);

  useEffect(() => {
    let alive = true;
    fetch(`/api/restaurants/${id}`)
      .then(async (res) => {
        if (!res.ok) {
          if (alive) setStatus("missing");
          return null;
        }
        const json = (await res.json()) as RestaurantData;
        if (alive) {
          setData(json);
          setStatus("ready");
        }
        return json;
      })
      .catch(() => {
        if (alive) setStatus("missing");
      });
    return () => {
      alive = false;
    };
  }, [id]);

  if (status === "loading") {
    return <Main>Loading…</Main>;
  }

  if (status === "missing" || !data) {
    return <Main>Restaurant not found.</Main>;
  }

  return (
    <Main>
      {/* 1. Restaurant name, with cuisine and area underneath in muted text */}
      <h1 className="text-3xl font-semibold tracking-tight">{data.name}</h1>
      <p className="mt-1 text-sm text-stone-500">
        {data.cuisine} · {data.area}
      </p>

      {data.totalReviews === 0 ? (
        // 6. Empty state that invites the first review
        <div className="mt-16 rounded-xl border border-stone-200 p-6 text-center">
          <p className="text-stone-500">No reviews yet.</p>
          <a
            href={`/review/${id}`}
            className="mt-2 inline-block font-medium text-amber-700 underline-offset-4 hover:underline"
          >
            Be the first to review {data.name}
          </a>
        </div>
      ) : (
        <>
          {/* 2. The average rating, large — the biggest thing on the page —
              with the review count next to it in small text.
              The line that prints the average is simply {data.averageRating}.
              There is no calculation anywhere in this file. */}
          <div className="mt-10 flex items-baseline gap-3">
            <span className="text-6xl font-semibold tracking-tight">
              {data.averageRating}
            </span>
            <span className="text-sm text-stone-500">
              {data.totalReviews} {data.totalReviews === 1 ? "review" : "reviews"}
            </span>
          </div>

          {/* 3. The latest review, visually highlighted, set apart from the rest */}
          {data.latestReview && (
            <div className="mt-8 rounded-xl border border-amber-200/70 bg-amber-50/60 p-5">
              <p className="text-xs font-medium tracking-wide text-amber-700 uppercase">
                Latest
              </p>
              <p className="mt-2 text-lg">{data.latestReview.comment}</p>
              <p className="mt-3 text-sm text-stone-500">
                ★ {data.latestReview.rating} · {formatDate(data.latestReview.createdAt)}
              </p>
            </div>
          )}

          {/* 4. The older reviews below, in a plain list */}
          {data.reviews.length > 0 && (
            <ul className="mt-8 divide-y divide-stone-200">
              {data.reviews.map((review) => (
                <li key={review.id} className="py-4">
                  <p>{review.comment}</p>
                  <p className="mt-1 text-sm text-stone-500">
                    ★ {review.rating} · {formatDate(review.createdAt)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      {/* 5. A link to /review/[id] */}
      <div className="mt-12 border-t border-stone-200 pt-6">
        <a
          href={`/review/${id}`}
          className="font-medium text-amber-700 underline-offset-4 hover:underline"
        >
          Write a review
        </a>
      </div>
    </Main>
  );
}

function Main({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto min-h-screen max-w-[560px] px-6 py-10">{children}</main>
  );
}
