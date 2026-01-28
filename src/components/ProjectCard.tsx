import Link from "next/link";
import { Project } from "@/types";
import { ProjectThumbnail } from "./ProjectThumbnail";
import { XIcon, GitHubIcon, DiscordIcon } from "./icons";

interface ProjectCardProps {
  project: Project;
  punkId: number;
  showPunk?: boolean;
}

export function ProjectCard({
  project,
  punkId,
  showPunk = false,
}: ProjectCardProps) {
  const formattedDate = new Date(project.launchDate).toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "short",
    }
  );

  return (
    <article className="pixel-card group flex flex-col overflow-hidden h-full">
      {/* Thumbnail */}
      <Link
        href={`/${punkId}/${project.id}`}
        className="relative aspect-video overflow-hidden bg-punk-blue"
      >
        <ProjectThumbnail
          projectUrl={project.url}
          projectName={project.name}
          thumbnail={project.thumbnail}
        />
      </Link>

      {/* Content */}
      <div className="flex flex-1 flex-col p-3">
        <div className="mb-2 flex items-start justify-between gap-2">
          <h3 className="text-lg font-bold uppercase tracking-wide leading-tight">
            <Link
              href={`/${punkId}/${project.id}`}
              className="hover:text-punk-pink transition-colors"
            >
              {project.name}
            </Link>
          </h3>
          <time
            dateTime={project.launchDate}
            className="shrink-0 text-base font-medium opacity-60 font-mono mt-1"
          >
            {formattedDate}
          </time>
        </div>

        <p className="mb-3 flex-1 text-base opacity-80 line-clamp-2 leading-relaxed">
          {project.description}
        </p>

        {/* Tags */}
        <div className="mb-3 flex flex-wrap gap-1.5">
          {project.tags.slice(0, 3).map((tag, i) => (
            <span
              key={tag}
              className={`pixel-tag ${i % 2 === 0 ? "pixel-tag-blue" : "pixel-tag-pink"}`}
            >
              {tag}
            </span>
          ))}
          {project.tags.length > 3 && (
            <span className="pixel-tag bg-neutral-100 text-neutral-500">
              +{project.tags.length - 3}
            </span>
          )}
        </div>

        {/* Social Links */}
        <div className="flex items-center gap-3 pt-2 mt-auto">
          {showPunk && (
            <Link
              href={`/${punkId}`}
              className="text-base font-bold uppercase tracking-wider hover:text-punk-blue"
            >
              #{punkId}
            </Link>
          )}
          {project.twitter && (
            <a
              href={`https://x.com/${project.twitter}`}
              target="_blank"
              rel="noopener noreferrer"
              className="opacity-60 transition-opacity hover:opacity-100 hover:text-punk-blue"
              aria-label="Twitter"
            >
              <XIcon className="h-4 w-4" />
            </a>
          )}
          {project.github && (
            <a
              href={project.github}
              target="_blank"
              rel="noopener noreferrer"
              className="opacity-60 transition-opacity hover:opacity-100 hover:text-punk-blue"
              aria-label="GitHub"
            >
              <GitHubIcon className="h-4 w-4" />
            </a>
          )}
          {project.discord && (
            <a
              href={project.discord}
              target="_blank"
              rel="noopener noreferrer"
              className="opacity-60 transition-opacity hover:opacity-100 hover:text-punk-blue"
              aria-label="Discord"
            >
              <DiscordIcon className="h-4 w-4" />
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
