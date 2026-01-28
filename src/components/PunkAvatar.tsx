import Image from "next/image";

interface PunkAvatarProps {
  punkId: number;
  size?: number;
  className?: string;
}

export function getPunkImageUrl(punkId: number, size: number = 24) {
  return `https://punks.art/api/punks/${punkId}?format=png&size=${size}&background=v2`;
}

export function PunkAvatar({
  punkId,
  size = 96,
  className = "",
}: PunkAvatarProps) {
  // Use size 24 for the API (it will be scaled up)
  const apiSize = 24;

  return (
    <div
      className={`relative overflow-hidden bg-punk-blue-light ${className}`}
      style={{ width: size, height: size }}
    >
      <Image
        src={getPunkImageUrl(punkId, apiSize)}
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
