import Link from "next/link";
import { SITE_NAME } from "@/lib/constants";
import { Button } from "./Button";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b-2 border-foreground/10 bg-background backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-lg font-bold uppercase tracking-wider font-pixel">
            {SITE_NAME}
          </span>
        </Link>

        <nav className="flex items-center">
          <Button href="/add" variant="primary" size="sm" className="hidden sm:inline-flex">
            + Add Project
          </Button>
          <Button href="/add" variant="primary" size="sm" className="sm:hidden w-9 h-9 p-0 justify-center">
            +
          </Button>
        </nav>
      </div>
    </header>
  );
}
