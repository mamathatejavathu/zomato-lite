export default function TopBar() {
  return (
    <header className="sticky top-0 z-10 border-b border-line bg-page">
      <div className="mx-auto flex max-w-[560px] items-center gap-2.5 px-6 py-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent pb-0.5 text-xl font-black lowercase leading-none text-white">
          z
        </span>
        <span className="text-lg font-extrabold lowercase tracking-tight text-accent-text">
          zomato lite
        </span>
      </div>
    </header>
  );
}
