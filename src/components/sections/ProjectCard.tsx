import Image from "next/image";
import Link from "next/link";
import type { ProjectListItem } from "@/lib/types";
import { mediaUrl } from "@/lib/media";
import { formatArea, formatMonthYear } from "@/lib/format";

const STATUS_STYLE: Record<string, string> = {
  upcoming: "bg-brand text-white",
  ongoing: "bg-accent text-white",
  completed: "bg-white text-brand",
};

export default function ProjectCard({ project }: { project: ProjectListItem }) {
  const img = mediaUrl(project.thumbnail);
  const area = formatArea(project.land_area, project.land_area_unit);
  const handover = formatMonthYear(project.handover_date);

  return (
    <Link href={`/projects/${project.slug}`} className="group block cursor-pointer">
      <div className="relative aspect-4/5 overflow-hidden bg-line">
        {img && (
          <Image
            src={img}
            alt={project.title}
            fill
            sizes="(min-width: 768px) 33vw, 100vw"
            className="object-cover transition-transform duration-1200 ease-out group-hover:scale-105"
          />
        )}
        <span
          className={`absolute left-4 top-4 rounded-full px-4 py-1 text-[11px] font-medium uppercase tracking-[0.2em] ${
            STATUS_STYLE[project.status] ?? "bg-white text-brand"
          }`}
        >
          {project.status_display}
        </span>
      </div>

      <div className="mt-5 flex items-start justify-between gap-4">
        <div>
          <h3 className="font-display text-3xl leading-tight text-brand transition-colors group-hover:text-accent">
            {project.title}
          </h3>
          {project.short_description && (
            <p className="mt-2 text-muted">{project.short_description}</p>
          )}
        </div>
        <span className="mt-2 text-2xl text-accent transition-transform duration-300 group-hover:translate-x-1">
          →
        </span>
      </div>

      <p className="mt-4 flex flex-wrap gap-x-4 gap-y-1 border-t border-line pt-4 text-xs uppercase tracking-[0.2em] text-muted">
        {project.location && <span>{project.location}</span>}
        {area && <span>{area}</span>}
        {handover && <span>Handover {handover}</span>}
      </p>
    </Link>
  );
}