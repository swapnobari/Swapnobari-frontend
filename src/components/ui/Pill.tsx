import Link from "next/link";

export default function Pill({
  to,
  active,
  children,
}: {
  to: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={to}
      scroll={false}
      aria-current={active ? "true" : undefined}
      className={`cursor-pointer rounded-full border px-5 py-2 text-sm transition ${
        active
          ? "border-brand bg-brand text-white"
          : "border-line text-fg hover:border-brand hover:text-brand"
      }`}
    >
      {children}
    </Link>
  );
}