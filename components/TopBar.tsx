export default function TopBar() {
  return (
    <header className="sticky top-0 z-10 border-b border-[#ececec] bg-white">
      <div className="mx-auto flex max-w-[560px] items-center gap-2.5 px-6 py-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#E23744] pb-0.5 text-xl font-black lowercase leading-none text-white">
          z
        </span>
        <span className="text-lg font-extrabold lowercase tracking-tight text-[#E23744]">
          zomato lite
        </span>
      </div>
    </header>
  );
}
