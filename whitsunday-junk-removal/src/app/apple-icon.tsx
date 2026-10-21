import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// Home-screen icon when someone saves the site (or the dashboard) to their phone.
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #5eead4, #22d3ee)" }}>
        <svg width="120" height="120" viewBox="0 0 48 48" fill="none" stroke="#050d1a" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 14h22v18H6zM28 20h8l6 6v6H28z" />
          <circle cx="14" cy="35" r="3.6" />
          <circle cx="34" cy="35" r="3.6" />
        </svg>
      </div>
    ),
    size,
  );
}
