import { ImageResponse } from "next/og";
import { SCHOOL } from "@/lib/school";
import { logoDataUri } from "@/lib/brand-assets";

export const alt = `${SCHOOL.name} — ${SCHOOL.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Social-share card. Without this, a link to the site pasted into Facebook or
 * Messenger (which is how a school is actually shared around here) renders as
 * a bare text line — no image, no name, no trust.
 *
 * What it deliberately does NOT say: "Admission Open", a fee figure, or a
 * student/pass-rate number. Every one of those is either seasonal or an
 * unverified placeholder (see STATS in lib/school.ts), and a social card is
 * the single most-shared asset on the site — the worst place for a figure the
 * school hasn't confirmed.
 */
export default function OpengraphImage() {
  const logo = logoDataUri();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0F2A44",
          padding: 72,
          position: "relative",
        }}
      >
        {/* Gold accent bar along the top edge */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 14,
            background: "#C5A021",
          }}
        />

        {/* Brand row */}
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          {logo ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={logo}
              alt=""
              width={104}
              height={104}
              style={{ objectFit: "contain", borderRadius: 52 }}
            />
          ) : (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 104,
                height: 104,
                borderRadius: 52,
                border: "3px solid #C5A021",
                color: "#C5A021",
                fontSize: 44,
                fontWeight: 700,
                letterSpacing: -2,
              }}
            >
              EV
            </div>
          )}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", fontSize: 34, fontWeight: 700, color: "#FFFFFF" }}>
              {SCHOOL.shortName}
            </div>
            {/* Satori requires an explicit display on ANY div with more than one
                child — and a text node plus a {expression} counts as two. Every
                div below carrying interpolated text therefore declares display. */}
            <div
              style={{
                display: "flex",
                fontSize: 18,
                letterSpacing: 3,
                color: "#94A3B8",
                textTransform: "uppercase",
              }}
            >
              {`English School · ${SCHOOL.location}`}
            </div>
          </div>
        </div>

        {/* Headline */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div
            style={{
              fontSize: 66,
              fontWeight: 700,
              color: "#FFFFFF",
              lineHeight: 1.15,
              letterSpacing: -1.5,
              maxWidth: 940,
            }}
          >
            Nurturing Minds From Nursery to Class 10
          </div>
          <div style={{ display: "flex", height: 6, width: 200, background: "#C5A021" }} />
          <div style={{ display: "flex", fontSize: 26, color: "#CBD5E1" }}>
            {SCHOOL.motto}
          </div>
        </div>

        {/* Footer line */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 22,
            color: "#94A3B8",
            borderTop: "1px solid rgba(148,163,184,0.3)",
            paddingTop: 24,
          }}
        >
          <div style={{ display: "flex" }}>{SCHOOL.address}</div>
          <div style={{ display: "flex" }}>Established {SCHOOL.established} B.S.</div>
        </div>
      </div>
    ),
    size,
  );
}