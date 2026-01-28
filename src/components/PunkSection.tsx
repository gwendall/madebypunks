import { Punk, Project } from "@/types";
import { PunkBadge } from "./PunkBadge";
import { ProjectCard } from "./ProjectCard";

interface PunkSectionProps {
  punks: Punk[];
  projects: Project[];
}

export function PunkSection({ punks, projects }: PunkSectionProps) {
  return (
    <section className="py-8">
      {/* Punk Header */}
      <div className="mb-6 flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-4 flex-wrap">
          {punks.map((punk, i) => (
            <div key={punk.id} className="flex items-center gap-4">
              {i > 0 && (
                <span className="text-2xl font-bold opacity-30">+</span>
              )}
              <PunkBadge punk={punk} size="lg" showTwitter />
            </div>
          ))}
        </div>
        <div className="ml-auto">
          <span className="pixel-tag bg-neutral-100 text-neutral-500">
            {projects.length} project
            {projects.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </section>
  );
}
