import Image from "next/image";

export default function Home() {
  return (
    <main className="mx-auto max-w-[560px] px-6 py-4">
      <div className="relative h-72 w-full overflow-hidden rounded-2xl border border-line">
        <Image
          src="/images/hero.jpg"
          alt="Tacos at Ludhiana Burrito"
          fill
          priority
          sizes="(max-width: 640px) 100vw, 560px"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/10" />
        <div className="absolute bottom-0 left-0 p-6">
          <p className="text-3xl font-extrabold lowercase tracking-tight text-white">
            zomato lite
          </p>
          <p className="mt-1 text-sm text-overlay-soft">
            Discover. Review. Repeat.
          </p>
        </div>
      </div>
    </main>
  );
}
