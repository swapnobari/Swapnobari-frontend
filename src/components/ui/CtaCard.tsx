import Reveal from "@/components/motion/Reveal";
import ButtonLink from "./ButtonLink";

type Action = { href: string; label: string; variant?: "solid" | "outline" };

export default function CtaCard({
  heading,
  text,
  actions,
  children,
}: {
  heading: string;
  text?: string;
  actions: Action[];
  children?: React.ReactNode;
}) {
  return (
    <aside className="lg:sticky lg:top-28 lg:self-start">
      <Reveal>
        <div className="border border-line bg-white/60 p-8">
          <p className="font-display text-3xl text-brand">{heading}</p>
          {text && <p className="mt-3 text-muted">{text}</p>}
          {children}
          <div className="mt-8 flex flex-col gap-3">
            {actions.map((a) => (
              <ButtonLink
                key={a.label}
                href={a.href}
                variant={a.variant ?? "solid"}
                className="justify-center"
              >
                {a.label}
              </ButtonLink>
            ))}
          </div>
        </div>
      </Reveal>
    </aside>
  );
}