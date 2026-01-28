import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Markdown from "react-markdown";
import { Header, Footer, PunkAvatar, ProjectCard, Button } from "@/components";
import { getPunkById, getAllPunks, getProjectsByPunk, getProjectCreators } from "@/data/punks";

interface PunkPageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  const punkIds = getAllPunks();
  return punkIds.map((id) => ({ id: String(id) }));
}

export async function generateMetadata({
  params,
}: PunkPageProps): Promise<Metadata> {
  const { id } = await params;
  const punkId = parseInt(id, 10);
  const punk = getPunkById(punkId);

  if (!punk) {
    return {
      title: "Punk Not Found | Made by Punks",
    };
  }

  const projects = getProjectsByPunk(punkId);
  const name = punk.name || `Punk #${punkId}`;
  const description = `Discover ${projects.length} project${projects.length !== 1 ? "s" : ""} inspired by Punk #${punkId}. Made by Punks - a community-curated directory of CryptoPunks projects.`;

  return {
    title: `${name} | Made by Punks`,
    description,
    openGraph: {
      title: `${name} | Made by Punks`,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title: `${name} | Made by Punks`,
      description,
    },
  };
}

export default async function PunkPage({ params }: PunkPageProps) {
  const { id } = await params;
  const punkId = parseInt(id, 10);
  const punk = getPunkById(punkId);

  if (!punk) {
    notFound();
  }

  const projects = getProjectsByPunk(punkId);
  const name = punk.name || `Punk #${punkId}`;

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        {/* Punk Header */}
        <section className="bg-punk-blue">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <Link
              href="/"
              className="mb-6 inline-flex items-center gap-2 text-base font-bold uppercase tracking-wider text-white/80 transition-colors hover:text-white"
            >
              ← Back
            </Link>

            <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
              <PunkAvatar
                punkId={punkId}
                size={120}
                className="pixel-shadow"
              />

              <div className="flex-1">
                <h1 className="font-pixel-custom text-3xl uppercase tracking-wider text-white sm:text-4xl drop-shadow-[2px_2px_0_rgba(0,0,0,0.3)]">
                  {name}
                </h1>
                <p className="mt-1 text-lg text-white/60 font-mono">
                  CryptoPunk #{punkId}
                </p>

                <div className="mt-6 flex flex-wrap items-center gap-3">
                  {punk.twitter && (
                    <Button
                      href={`https://x.com/${punk.twitter}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      variant="white"
                      size="sm"
                      className="text-punk-blue"
                    >
                      @{punk.twitter}
                    </Button>
                  )}
                  {punk.website && (
                    <Button
                      href={punk.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      variant="secondary"
                      size="sm"
                    >
                      {new URL(punk.website).hostname.replace("www.", "")}
                    </Button>
                  )}
                </div>
              </div>

              <div className="bg-white/10 px-6 py-4 text-center backdrop-blur-sm">
                <div className="text-4xl font-bold text-white">
                  {projects.length}
                </div>
                <div className="text-base font-bold uppercase tracking-wider text-white/80 font-pixel">
                  Project{projects.length !== 1 ? "s" : ""}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Custom Content (from markdown) */}
        {punk.body && (
          <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="prose prose-punk">
              <Markdown>{punk.body}</Markdown>
            </div>
          </section>
        )}

        {/* Projects Grid */}
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <h2 className="mb-8 text-xl font-bold uppercase tracking-wider">
            Projects featuring Punk #{punkId}
          </h2>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => {
              const collaborators = getProjectCreators(project).filter(
                (p) => p.id !== punkId
              );
              return (
                <ProjectCard
                  key={project.id}
                  project={project}
                  collaborators={collaborators}
                />
              );
            })}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
