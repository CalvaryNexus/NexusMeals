export default function AdminLoading() {
  return (
    <div className="space-y-4">
      <div className="skeleton h-8 w-52" />
      <div className="grid gap-3 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="skeleton h-24 rounded-[18px]" />
        ))}
      </div>
      <div className="skeleton h-40 rounded-[18px]" />
      <div className="skeleton h-40 rounded-[18px]" />
    </div>
  );
}
