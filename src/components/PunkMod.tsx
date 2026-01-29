interface PunkModProps {
  size?: number;
  className?: string;
}

// Use size=24 for crisp pixels, then scale up with CSS
const PUNKMOD_URL =
  "https://punks.art/api/traits/003-055-020-052?background=v2&format=png&size=24";

export function PunkMod({ size = 120, className = "" }: PunkModProps) {
  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <img
        src={PUNKMOD_URL}
        alt="PunkMod"
        width={size}
        height={size}
        className="pixelated shrink-0"
        style={{ imageRendering: "pixelated" }}
      />
      <div>
        <h3 className="text-xl font-bold text-punk-blue">PunkMod</h3>
        <p className="text-sm opacity-70">Your AI assistant for submissions</p>
      </div>
    </div>
  );
}
