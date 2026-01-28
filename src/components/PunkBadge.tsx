import Link from "next/link";
import { Punk } from "@/types";
import { PunkAvatar } from "./PunkAvatar";

interface PunkBadgeProps {
  punk: Punk;
  size?: "sm" | "md" | "lg";
  showName?: boolean;
  showTwitter?: boolean;
}

const sizeConfig = {
  sm: { avatar: 32, text: "text-sm" },
  md: { avatar: 48, text: "text-base" },
  lg: { avatar: 56, text: "text-lg" },
};

export function PunkBadge({
  punk,
  size = "md",
  showName = true,
  showTwitter = false,
}: PunkBadgeProps) {
  const config = sizeConfig[size];

  return (
    <Link href={`/${punk.id}`} className="group flex items-center gap-3">
      <PunkAvatar
        punkId={punk.id}
        size={config.avatar}
        className="transition-all group-hover:translate-x-[-2px] group-hover:translate-y-[-2px] group-hover:shadow-[4px_4px_0_0_var(--shadow-color)]"
      />
      {showName && (
        <div>
          <div className={`${config.text} font-bold uppercase tracking-wider group-hover:text-punk-pink transition-colors flex items-baseline gap-2`}>
            <span>{punk.name || `Punk #${punk.id}`}</span>
            <span className="text-sm font-medium opacity-60 group-hover:text-punk-blue group-hover:opacity-100 transition-all">
              #{punk.id}
            </span>
          </div>
          {showTwitter && punk.twitter && (
            <div className="text-sm font-medium opacity-60">
              @{punk.twitter}
            </div>
          )}
        </div>
      )}
    </Link>
  );
}
