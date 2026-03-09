import { ImageResponse } from "next/og";

export const alt = "Scrutinix — Multi-Signal URL Threat Analyzer";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        display: "flex",
        height: "100%",
        width: "100%",
        flexDirection: "column",
        justifyContent: "space-between",
        background: "#080c10",
        padding: "72px",
        color: "#c8d6e5",
        fontFamily: "monospace",
      }}
    >
      <div
        style={{
          fontSize: 24,
          letterSpacing: "0.3em",
          textTransform: "uppercase",
          color: "#7a8a9a",
        }}
      >
        SCRUTINIX
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <div
          style={{
            fontSize: 80,
            lineHeight: 1,
            fontWeight: 700,
            maxWidth: "900px",
            letterSpacing: "-0.03em",
            color: "#00e639",
          }}
        >
          Stream link verdicts from 8 threat signals.
        </div>
        <div style={{ fontSize: 30, maxWidth: "760px", color: "#7a8a9a" }}>
          VirusTotal, Safe Browsing, community feeds, TLS, DNS, redirects,
          registration, and ML ensemble — streamed via NDJSON.
        </div>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          fontSize: 22,
          color: "#7a8a9a",
        }}
      >
        <div
          style={{
            display: "flex",
            height: 48,
            width: 48,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 12,
            border: "2px solid #00e639",
            color: "#00e639",
            fontSize: 18,
            fontWeight: 700,
          }}
        >
          SX
        </div>
        <span>scrutinix</span>
      </div>
    </div>,
    size,
  );
}
