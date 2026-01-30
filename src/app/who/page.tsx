import { Metadata } from "next";
import Link from "next/link";
import { Header, Footer, PunkAvatar, Button } from "@/components";
import { getPunksAlphabetically, getAllPunks } from "@/data/punks";

export const metadata: Metadata = {
  title: "Punks Who's Who | Made by Punks",
  description:
    "The definitive directory of CryptoPunks holders - artists, developers, and creators exploring punk art and culture.",
};

export default function WhoPage() {
  const alphabetGroups = getPunksAlphabetically();
  const totalPunks = getAllPunks().length;

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-punk-blue relative overflow-hidden">
          <div className="mx-auto max-w-7xl px-4 py-12 text-center sm:px-6 sm:py-16 lg:px-8 relative z-10">
            <h1 className="font-pixel-custom text-3xl uppercase tracking-wider text-white sm:text-5xl lg:text-6xl drop-shadow-[4px_4px_0_rgba(0,0,0,0.3)]">
              Who
            </h1>
            <p className="mx-auto mt-4 text-lg font-medium text-white/90 font-mono">
              {totalPunks} punks exploring CryptoPunks art & culture
            </p>
          </div>
        </section>

        {/* Punks List by Letter */}
        <div className="mx-auto max-w-7xl py-8">
          {alphabetGroups.map((group) => (
            <section
              key={group.letter}
              id={`letter-${group.letter}`}
              className="mb-12"
            >
              {/* Letter Header - full width with border edge to edge */}
              <div className="sticky top-16 z-30 bg-background py-2 mb-4 border-b border-foreground/10">
                <h2 className="text-sm font-bold text-foreground px-4 sm:px-6 lg:px-8">
                  {group.letter}
                </h2>
              </div>

              {/* Punks Grid */}
              <div className="flex flex-wrap px-4 sm:px-6 lg:px-8">
                {group.punks.map((punk) => (
                  <Link
                    key={punk.id}
                    href={`/${punk.id}`}
                    className="group flex flex-col items-center"
                  >
                    <div className="w-[120px] h-[120px] overflow-hidden bg-punk-blue-light group-hover:bg-punk-blue transition-colors">
                      <PunkAvatar
                        punkId={punk.id}
                        size={120}
                        noBackground
                      />
                    </div>
                    <div className="pt-2 pb-4 text-center">
                      <span className="block text-sm font-medium text-foreground max-w-[120px] truncate">
                        {punk.name || `Punk`}
                      </span>
                      <span className="block text-sm text-muted-foreground">
                        #{punk.id}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* CTA Section */}
        <section className="bg-punk-pink">
          <div className="mx-auto max-w-7xl px-4 py-12 text-center sm:px-6 lg:px-8">
            <h2 className="text-xl font-bold uppercase tracking-wider text-white drop-shadow-[2px_2px_0_rgba(0,0,0,0.2)]">
              Own a CryptoPunk?
            </h2>
            <p className="mt-3 text-white/90 text-base max-w-lg mx-auto">
              Create your profile and show the world who you are.
            </p>
            <Button href="/add" variant="white" size="sm" className="mt-6 text-punk-pink">
              Add Your Profile
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
