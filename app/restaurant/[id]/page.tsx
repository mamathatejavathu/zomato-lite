"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Star from "@/components/Star";

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

const STRIP = [
  { src: "/images/dishes.jpg", alt: "Signature dishes" },
  { src: "/images/interior.jpg", alt: "Restaurant ambience" },
  { src: "/images/cocktails.jpg", alt: "Drinks" },
];

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
    return <Main><p className="text-ink-soft">Loading…</p></Main>;
  }

  if (status === "missing" || !data) {
    return <Main><p className="text-ink-soft">Restaurant not found.</p></Main>;
  }

  return (
    <Main>
      {/* Hero photo with the restaurant name overlaid, Zomato-style.
          Text on a photo sits on a dark gradient in both themes, so it
          always uses solid white/light-grey — it never inherits the theme. */}
      <div className="relative h-48 w-full overflow-hidden rounded-2xl border border-line">
        <Image
          src="/images/hero.jpg"
          alt={data.name}
          fill
          priority
          sizes="(max-width: 640px) 100vw, 560px"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent" />
        <div className="absolute bottom-0 left-0 p-4">
          <h1 className="text-3xl font-bold tracking-tight text-white drop-shadow">
            {data.name}
          </h1>
          <p className="mt-1 text-sm text-overlay-soft">
            {data.cuisine} · {data.area}
          </p>
        </div>
      </div>

      {/* Photo strip, like Zomato's gallery row */}
      <div className="mt-3 grid grid-cols-3 gap-2">
        {STRIP.map((p) => (
          <div
            key={p.src}
            className="relative h-24 overflow-hidden rounded-xl border border-line"
          >
            <Image
              src={p.src}
              alt={p.alt}
              fill
              sizes="180px"
              className="object-cover transition-transform duration-300 hover:scale-105"
            />
          </div>
        ))}
      </div>

      {data.totalReviews === 0 ? (
        // Empty state — background and text set together on the card.
        <div className="mt-6 rounded-2xl border border-line bg-card p-8 text-center text-ink shadow-sm">
          <p className="text-ink-soft">No reviews yet.</p>
          <p className="mt-1 font-semibold">Be the first to review {data.name}</p>
        </div>
      ) : (
        <>
          {/* The average rating, large — the biggest thing on the page.
              The line that prints the average is simply {data.averageRating}.
              There is no calculation anywhere in this file.
              The number uses the primary text colour — never faded grey. */}
          <div className="mt-6 rounded-2xl border border-line bg-card p-5 text-ink shadow-sm">
            <div className="flex items-end gap-2">
              <span className="text-6xl font-extrabold leading-none tracking-tight">
                {data.averageRating}
              </span>
              <Star filled className="mb-1.5 h-7 w-7 text-accent" />
            </div>
            <p className="mt-2 text-sm text-ink-soft">
              Based on {data.totalReviews}{" "}
              {data.totalReviews === 1 ? "review" : "reviews"}
            </p>
          </div>

          <h2 className="mt-8 text-lg font-bold tracking-tight text-ink">Reviews</h2>

          {/* The latest review, highlighted with the brand-red chip.
              Every card: bg-card + text-ink travel together. */}
          {data.latestReview && (
            <article className="mt-3 rounded-2xl border border-accent/40 bg-card p-4 text-ink shadow-sm">
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-accent px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                  Latest
                </span>
                <span className="text-xs text-ink-soft">
                  {formatDate(data.latestReview.createdAt)}
                </span>
              </div>
              <div className="mt-3 flex gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Star
                    key={n}
                    filled={n <= data.latestReview!.rating}
                    className="h-4 w-4 text-accent"
                  />
                ))}
              </div>
              {/* Comment text: primary colour, full opacity — no fading. */}
              <p className="mt-2 text-lg">{data.latestReview.comment}</p>
            </article>
          )}

          {/* The older reviews, plain cards */}
          {data.reviews.length > 0 && (
            <div className="mt-3 space-y-3">
              {data.reviews.map((review) => (
                <article
                  key={review.id}
                  className="rounded-2xl border border-line bg-card p-4 text-ink shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <Star
                          key={n}
                          filled={n <= review.rating}
                          className="h-4 w-4 text-accent"
                        />
                      ))}
                    </div>
                    <span className="text-xs text-ink-soft">
                      {formatDate(review.createdAt)}
                    </span>
                  </div>
                  <p className="mt-2">{review.comment}</p>
                </article>
              ))}
            </div>
          )}
        </>
      )}

      {/* Sticky, brand-red call to action on an opaque themed bar */}
      <div className="sticky bottom-0 mt-10 border-t border-line bg-page">
        <div className="mx-auto max-w-[512px] py-3">
          <a
            href={`/review/${id}`}
            className="block rounded-xl bg-accent px-5 py-3 text-center font-semibold text-white shadow-sm transition-colors hover:bg-accent-strong"
          >
            Write a Review
          </a>
        </div>
      </div>
    </Main>
  );
}

function Main({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto max-w-[560px] px-6 py-4">{children}</main>
  );
}
