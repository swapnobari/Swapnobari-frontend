export default function Marquee({ text }: { text: string }) {
  return (
    <div className="overflow-hidden border-y border-line py-6" aria-hidden="true">
      <div className="marquee-track flex w-max whitespace-nowrap">
        {[0, 1].map((k) => (
          <div key={k} className="flex shrink-0">
            {Array.from({ length: 6 }).map((_, i) => (
              <span
                key={i}
                className="px-8 font-accent text-6xl italic text-brand/20 md:text-8xl"
              >
                {text}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}