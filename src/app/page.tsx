import { Header, Footer, PunkSection } from "@/components";
import PUNKS, { getAllPunks, getAllTags } from "@/data/punks";
import { GITHUB_URL, SITE_NAME, SITE_DESCRIPTION } from "@/lib/constants";

export default function HomePage() {
  const punkIds = getAllPunks();
  const allTags = getAllTags();
  const totalProjects = PUNKS.reduce(
    (acc, punk) => acc + punk.projects.length,
    0
  );

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="border-b-4 border-foreground bg-punk-blue">
          <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 sm:py-20 lg:px-8">
            <h1 className="text-4xl font-bold uppercase tracking-wider text-white sm:text-5xl lg:text-6xl">
              {SITE_NAME}
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-white/80">
              {SITE_DESCRIPTION}
            </p>
            <div className="mt-8 flex items-center justify-center gap-8">
              <div className="border-4 border-white bg-white px-6 py-3">
                <span className="text-3xl font-bold text-punk-blue">
                  {punkIds.length}
                </span>
                <span className="ml-2 text-sm font-bold uppercase tracking-wider text-punk-blue">
                  Punks
                </span>
              </div>
              <div className="border-4 border-white bg-punk-pink px-6 py-3">
                <span className="text-3xl font-bold text-white">
                  {totalProjects}
                </span>
                <span className="ml-2 text-sm font-bold uppercase tracking-wider text-white">
                  Projects
                </span>
              </div>
            </div>

            {/* Tags */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
              {allTags.map((tag, i) => (
                <span
                  key={tag}
                  className={`pixel-tag ${i % 2 === 0 ? "border-white bg-white text-punk-blue" : "border-white bg-punk-pink text-white"}`}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Projects by Punk */}
        <div className="mx-auto max-w-7xl divide-y-4 divide-foreground px-4 sm:px-6 lg:px-8">
          {PUNKS.map((punk) => (
            <PunkSection key={punk.id} punk={punk} />
          ))}
        </div>

        {/* CTA Section */}
        <section className="border-t-4 border-foreground bg-punk-pink">
          <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold uppercase tracking-wider text-white">
              Building something with Punks?
            </h2>
            <p className="mt-4 text-white/80">
              Submit a PR to add your project and join the directory.
            </p>
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-block border-4 border-white bg-white px-8 py-3 text-sm font-bold uppercase tracking-wider text-punk-pink transition-all hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[4px_4px_0_0_rgba(0,0,0,0.3)]"
            >
              + Add Project
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
