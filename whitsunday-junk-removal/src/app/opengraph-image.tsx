import { ImageResponse } from "next/og";

export const alt = "Whitsunday Junk Removal — local rubbish removal, fixed load pricing";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Share preview for Facebook, Messenger, iMessage, LinkedIn, etc.
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "radial-gradient(circle at 15% 10%, #0f766e 0%, #081426 45%, #050d1a 100%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
          <div
            style={{
              width: 84,
              height: 84,
              borderRadius: 22,
              background: "linear-gradient(135deg, #5eead4, #22d3ee)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="52" height="52" viewBox="0 0 48 48" fill="none" stroke="#050d1a" strokeWidth="4.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 14h22v18H6zM28 20h8l6 6v6H28z" />
              <circle cx="14" cy="35" r="3.6" />
              <circle cx="34" cy="35" r="3.6" />
            </svg>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 40, fontWeight: 800 }}>Whitsunday</span>
            <span style={{ fontSize: 24, fontWeight: 700, letterSpacing: 6, color: "#5eead4" }}>JUNK REMOVAL</span>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontSize: 86, fontWeight: 800, lineHeight: 1.02 }}>Junk gone.</span>
          <span style={{ fontSize: 86, fontWeight: 800, lineHeight: 1.02, color: "#5eead4" }}>Without lifting a finger.</span>
        </div>
        <div style={{ display: "flex", gap: 18, fontSize: 30, color: "rgba(255,255,255,0.8)" }}>
          <span>Airlie Beach · Cannonvale · Proserpine</span>
          <span style={{ color: "#5eead4" }}>· Free quotes</span>
        </div>
      </div>
    ),
    size,
  );
}
