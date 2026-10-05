import { getSiteSettings } from "@/lib/settings";
import { schoolInitials } from "@/lib/school-branding";
import { ImageResponse } from "next/og";
import { logoDataUri } from "@/lib/brand-assets";

export const size = { width: 512, height: 512 };
export const dynamic = "force-dynamic";
export const contentType = "image/png";

/** Browser icon follows saved school branding. */
export default async function Icon() {
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
        {schoolInitials(school.branding.shortName || school.name)}
      </div>
    ),
    size,
  );
}