export function Wordmark({ tone = "dark" }: { tone?: "dark" | "light" }) {
  const onDark = tone === "light";
  return (
    <span className="flex items-center gap-2.5">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-400 to-aqua-400 text-ocean shadow-md">
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M3 7h11v9H3zM14 10h4l3 3v3h-7z" />
          <circle cx="7" cy="17.5" r="1.8" />
          <circle cx="17" cy="17.5" r="1.8" />
        </svg>
      </span>
      <span className="font-display leading-none">
        <span className={`block text-[1.05rem] font-extrabold tracking-tight ${onDark ? "text-white" : "text-ocean"}`}>Whitsunday</span>
        <span className={`mt-0.5 block text-[10.5px] font-bold uppercase tracking-[0.2em] ${onDark ? "text-teal-300" : "text-teal-700"}`}>Junk Removal</span>
      </span>
    </span>
  );
}
