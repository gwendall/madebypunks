import { ImageResponse } from "next/og";
import { COLORS } from "./constants";

interface OGImageOptions {
  width: number;
  height: number;
}

interface OGImageProps {
  title: string;
  subtitle?: string;
  punkIds?: number[];
  punkId?: number;
  projectCount?: number;
  twitter?: string;
}

function getPunkImageUrl(punkId: number) {
  return `https://punks.art/api/punks/${punkId}?format=png&size=240&background=v2`;
}

export function generateNotFoundImage(options: OGImageOptions): ImageResponse {
  const { width, height } = options;
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: COLORS.punkBlue,
          color: "white",
          fontSize: 64,
          fontWeight: 900,
          textTransform: "uppercase",
        }}
      >
        Punk Not Found
      </div>
    ),
    { width, height }
  );
}

export async function generateOGImage(
  props: OGImageProps,
  options: OGImageOptions
): Promise<ImageResponse> {
  const { width, height } = options;
  const { title, subtitle, punkIds, punkId, projectCount, twitter } = props;

  // Single punk view - card style with punk on left, info on right
  if (punkId !== undefined) {
    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-start",
            backgroundColor: COLORS.punkBlue,
            padding: "40px",
          }}
        >
          {/* Punk avatar - large on the left */}
          <div
            style={{
              display: "flex",
              flexShrink: 0,
              border: "8px solid #000",
              boxShadow: "8px 8px 0 0 rgba(0,0,0,0.4)",
              marginRight: "60px",
            }}
          >
            <img
              src={getPunkImageUrl(punkId)}
              width={400}
              height={400}
              style={{
                imageRendering: "pixelated",
              }}
            />
          </div>

          {/* Info on the right */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              flex: 1,
            }}
          >
            {/* Name */}
            <div
              style={{
                fontSize: 72,
                fontWeight: 900,
                color: "white",
                textTransform: "uppercase",
                letterSpacing: "0.02em",
                textShadow: "4px 4px 0 #000",
                lineHeight: 1.1,
              }}
            >
              {title}
            </div>

            {/* Punk ID */}
            <div
              style={{
                fontSize: 36,
                fontWeight: 700,
                color: "white",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                marginTop: "16px",
                opacity: 0.7,
              }}
            >
              Punk #{punkId}
            </div>

            {/* Stats row */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "32px",
                marginTop: "32px",
              }}
            >
              {/* Project count badge */}
              {projectCount !== undefined && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    backgroundColor: "#fff",
                    border: "4px solid #000",
                    padding: "12px 24px",
                  }}
                >
                  <span
                    style={{
                      fontSize: 48,
                      fontWeight: 900,
                      color: COLORS.punkBlue,
                      marginRight: "12px",
                    }}
                  >
                    {projectCount}
                  </span>
                  <span
                    style={{
                      fontSize: 24,
                      fontWeight: 700,
                      color: COLORS.punkBlue,
                      textTransform: "uppercase",
                    }}
                  >
                    Project{projectCount !== 1 ? "s" : ""}
                  </span>
                </div>
              )}

              {/* Twitter handle */}
              {twitter && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    backgroundColor: COLORS.punkPink,
                    border: "4px solid #000",
                    padding: "12px 24px",
                  }}
                >
                  <span
                    style={{
                      fontSize: 24,
                      fontWeight: 700,
                      color: "#fff",
                    }}
                  >
                    @{twitter}
                  </span>
                </div>
              )}
            </div>

            {/* Made by Punks branding */}
            <div
              style={{
                fontSize: 24,
                fontWeight: 700,
                color: "white",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                marginTop: "40px",
                opacity: 0.5,
              }}
            >
              Made by Punks
            </div>
          </div>
        </div>
      ),
      { width, height }
    );
  }

  // Multiple punks view (homepage)
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: COLORS.punkBlue,
        }}
      >
        {/* Punk avatars */}
        {punkIds && punkIds.length > 0 && (
          <div
            style={{
              display: "flex",
              gap: "24px",
              marginBottom: "48px",
            }}
          >
            {punkIds.slice(0, 6).map((id) => (
              <div
                key={id}
                style={{
                  display: "flex",
                  border: "6px solid #000",
                  boxShadow: "6px 6px 0 0 rgba(0,0,0,0.4)",
                }}
              >
                <img
                  src={getPunkImageUrl(id)}
                  width={100}
                  height={100}
                  style={{
                    imageRendering: "pixelated",
                  }}
                />
              </div>
            ))}
          </div>
        )}

        {/* Title */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <div
            style={{
              fontSize: 80,
              fontWeight: 900,
              color: "white",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              textShadow: "6px 6px 0 #000",
            }}
          >
            {title}
          </div>
          {subtitle && (
            <div
              style={{
                fontSize: 28,
                fontWeight: 700,
                color: "white",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                marginTop: "16px",
                opacity: 0.8,
              }}
            >
              {subtitle}
            </div>
          )}
        </div>
      </div>
    ),
    { width, height }
  );
}
