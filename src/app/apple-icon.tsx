import { getSiteSettings } from "@/lib/settings";
import { schoolInitials } from "@/lib/school-branding";
import { ImageResponse } from "next/og";
import { logoDataUri } from "@/lib/brand-assets";

export const size = { width: 180, height: 180 };
export const dynamic = "force-dynamic";
export const contentType = "image/png";

/**
 * iOS "Add to Home Screen" icon. Unlike the browser tab icon this must fill its
 * canvas edge to edge with no transparency and no rounded corners — iOS applies
 * its own mask, and a transparent PNG comes out with black corners.
 */
export default async function AppleIcon() {
  const school = await getSiteSettings();
  const logo = await logoDataUri(school.branding.logo);

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
          <img src={logo} alt="" width={150} height={150} style={{ objectFit: "contain" }} />
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
          fontSize: 84,
          fontWeight: 700,
          letterSpacing: -3,
        }}
      >
        {schoolInitials(school.branding.shortName || school.name)}
      </div>
    ),
    size,
  );
}