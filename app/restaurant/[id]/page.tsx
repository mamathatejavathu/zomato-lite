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
    return <Main>Loading…</Main>;
  }

  if (status === "missing" || !data) {
    return <Main>Restaurant not found.</Main>;
  }

  return (
    <Main>
      {/* Hero photo with the restaurant name overlaid, Zomato-style */}
      <div className="relative h-48 w-full overflow-hidden rounded-2xl border border-[#2a2a2e]">
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
          <p className="mt-1 text-sm text-white/75">
            {data.cuisine} · {data.area}
          </p>
        </div>
      </div>

      {/* Photo strip, like Zomato's gallery row */}
      <div className="mt-3 grid grid-cols-3 gap-2">
        {STRIP.map((p) => (
          <div
            key={p.src}
            className="relative h-24 overflow-hidden rounded-xl border border-[#2a2a2e]"
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
        // Empty state that invites the first review
        <div className="mt-6 rounded-2xl border border-[#2a2a2e] bg-[#1e1e21] p-8 text-center shadow-sm">
          <p className="text-[#a1a1a3]">No reviews yet.</p>
          <p className="mt-1 font-semibold">Be the first to review {data.name}</p>
        </div>
      ) : (
        <>
          {/* The average rating, large — the biggest thing on the page.
              The line that prints the average is simply {data.averageRating}.
              There is no calculation anywhere in this file. */}
          <div className="mt-6 rounded-2xl border border-[#2a2a2e] bg-[#1e1e21] p-5 shadow-sm">
            <div className="flex items-end gap-2">
              <span className="text-6xl font-extrabold leading-none tracking-tight text-white">
                {data.averageRating}
              </span>
              <Star filled className="mb-1.5 h-7 w-7 text-[#E23744]" />
            </div>
            <p className="mt-2 text-sm text-[#a1a1a3]">
              Based on {data.totalReviews}{" "}
              {data.totalReviews === 1 ? "review" : "reviews"}
            </p>
          </div>

          <h2 className="mt-8 text-lg font-bold tracking-tight">Reviews</h2>

          {/* The latest review, highlighted with the brand-red chip */}
          {data.latestReview && (
            <article className="mt-3 rounded-2xl border border-[#E23744]/45 bg-[#1e1e21] p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-[#E23744] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                  Latest
                </span>
                <span className="text-xs text-[#a1a1a3]">
                  {formatDate(data.latestReview.createdAt)}
                </span>
              </div>
              <div className="mt-3 flex gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Star
                    key={n}
                    filled={n <= data.latestReview!.rating}
                    className="h-4 w-4 text-[#E23744]"
                  />
                ))}
              </div>
              <p className="mt-2 text-lg">{data.latestReview.comment}</p>
            </article>
          )}

          {/* The older reviews, plain dark cards */}
          {data.reviews.length > 0 && (
            <div className="mt-3 space-y-3">
              {data.reviews.map((review) => (
                <article
                  key={review.id}
                  className="rounded-2xl border border-[#2a2a2e] bg-[#1e1e21] p-4 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <Star
                          key={n}
                          filled={n <= review.rating}
                          className="h-4 w-4 text-[#E23744]"
                        />
                      ))}
                    </div>
                    <span className="text-xs text-[#a1a1a3]">
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

      {/* Sticky, Zomato-red call to action pinned to the bottom of the screen */}
      <div className="sticky bottom-0 mt-10 border-t border-[#26262a] bg-[#141414]/95 backdrop-blur">
        <div className="mx-auto max-w-[512px] py-3">
          <a
            href={`/review/${id}`}
            className="block rounded-xl bg-[#E23744] px-5 py-3 text-center font-semibold text-white shadow-sm transition-colors hover:bg-[#c92a37]"
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
