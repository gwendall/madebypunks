import { generateOGImage } from "@/lib/og-image";
import { getAllPunks } from "@/data/punks";

export const runtime = "nodejs";

export const alt = "Punks Who's Who | Made by Punks";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  const punkIds = getAllPunks().slice(0, 6);

  return generateOGImage(
    {
      title: "Punks Who's Who",
      subtitle: `${getAllPunks().length} punks exploring CryptoPunks art & culture`,
      punkIds,
      titleColor: "white",
    },
    size
  );
}
