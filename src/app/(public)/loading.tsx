/** Route-level skeleton so navigation paints something immediately. */
export default function PublicLoading() {
  return (
    <>
      <div className="hero -mt-[var(--nav-h)] pt-[var(--nav-h)]">
        <div className="mx-auto max-w-[1140px] px-6 py-10 sm:py-16">
          <div className="h-9 w-40 rounded-[6px] bg-white/15 sm:h-12 sm:w-52" />
          <div className="mt-6 h-3 w-32 rounded-full bg-white/10" />
          <div className="mt-3 h-8 w-3/4 max-w-lg rounded-[8px] bg-white/15 sm:h-12" />
          <div className="mt-4 h-4 w-full max-w-xl rounded-full bg-white/10" />
        </div>
      </div>
      <div className="mx-auto max-w-[1140px] px-6 py-10">
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton h-40 rounded-[18px]" />
          ))}
        </div>
      </div>
    </>
  );
}
