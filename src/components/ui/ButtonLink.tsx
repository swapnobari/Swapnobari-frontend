import Link from "next/link";

type Props = {
  href: string;
  children: React.ReactNode;
  variant?: "solid" | "outline" | "light";
  className?: string;
};

const styles = {
  solid: "bg-accent text-white hover:bg-accent-bright",
  outline: "border border-current hover:bg-fg hover:text-bg",
  light: "border border-white/60 text-white hover:bg-white hover:text-brand-deep",
};

export default function ButtonLink({ href, children, variant = "solid", className = "" }: Props) {
  const cls = `inline-flex cursor-pointer items-center gap-3 rounded-full px-8 py-4 text-sm font-medium transition ${styles[variant]} ${className}`;
  const external = /^https?:\/\//.test(href);

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
        {children} <span aria-hidden>↗</span>
      </a>
    );
  }
  return (
    <Link href={href} className={cls}>
      {children} <span aria-hidden>→</span>
    </Link>
  );
}