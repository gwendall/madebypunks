import Image from "next/image";

interface PunkAvatarProps {
  punkId: number;
  size?: number;
  className?: string;
  noBackground?: boolean;
}

export function getPunkImageUrl(punkId: number, size: number = 24, noBackground: boolean = false) {
  const bgParam = noBackground ? "" : "&background=v2";
  return `https://punks.art/api/punks/${punkId}?format=png&size=${size}${bgParam}`;
}

export function PunkAvatar({
  punkId,
  size = 96,
  className = "",
  noBackground = false,
}: PunkAvatarProps) {
  // Use size 24 for the API (it will be scaled up)
  const apiSize = 24;

  return (
    <div
      className={`relative overflow-hidden ${noBackground ? "" : "bg-punk-blue-light"} ${className}`}
      style={{ width: size, height: size }}
    >
      <Image
        src={getPunkImageUrl(punkId, apiSize, noBackground)}
        alt={`CryptoPunk #${punkId}`}
        width={size}
        height={size}
        className="pixelated"
        style={{ imageRendering: "pixelated" }}
        unoptimized
      />
    </div>
  );
}
