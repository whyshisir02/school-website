import { ImageResponse } from "next/og";
import { logoDataUri } from "@/lib/brand-assets";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

/**
 * Browser tab / bookmark icon. Generated rather than a committed .ico for one
 * reason: the school has no logo file yet, and a generated "EV" monogram is far
 * better than Next's default blank icon. As soon as public/images/logo.png
 * exists this picks it up automatically — no code change.
 */
export default function Icon() {
  const logo = logoDataUri();

  if (logo) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#0F2A44",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logo} alt="" width={400} height={400} style={{ objectFit: "contain" }} />
        </div>
      ),
      size,
    );
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0F2A44",
          color: "#C5A021",
          fontSize: 240,
          fontWeight: 700,
          letterSpacing: -8,
        }}
      >
        EV
      </div>
    ),
    size,
  );
}