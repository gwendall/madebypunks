import { GITHUB_URL } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="border-t-2 border-foreground/10 bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-base font-medium uppercase tracking-wider opacity-60">
            Trustless & community-owned
          </p>
          <div className="flex items-center gap-6">
            <a
              href="https://cryptopunks.app"
              target="_blank"
              rel="noopener noreferrer"
              className="text-base font-bold uppercase tracking-wider transition-colors hover:text-punk-pink"
            >
              CryptoPunks
            </a>
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-base font-bold uppercase tracking-wider transition-colors hover:text-punk-blue"
            >
              GitHub
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
