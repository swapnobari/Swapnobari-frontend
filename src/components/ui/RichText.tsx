type Props = { value: string; className?: string };

const LEAD = /^(.{3,45}?)\s[–—-]\s(.+)$/;

export default function RichText({ value, className = "" }: Props) {
  if (!value) return null;

  // Real HTML from the API (the backend sanitizes it before saving)
  if (/<\/?(p|h[1-6]|ul|ol|li|br|strong|em|a|div)\b/i.test(value)) {
    return <div className={`rich ${className}`} dangerouslySetInnerHTML={{ __html: value }} />;
  }

  // Plain text: one line = one block
  const lines = value
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  return (
    <div className={className}>
      {lines.map((line, i) => {
        const isHeading = line.length < 70 && !/[.।:]$/.test(line);
        if (isHeading) {
          return (
            <h3 key={i} className="mt-10 font-display text-2xl first:mt-0 md:text-3xl">
              {line}
            </h3>
          );
        }
        const m = line.match(LEAD);
        return (
          <p key={i} className="mt-4 leading-8">
            {m ? (
              <>
                <strong className="font-semibold">{m[1]}</strong> – {m[2]}
              </>
            ) : (
              line
            )}
          </p>
        );
      })}
    </div>
  );
}