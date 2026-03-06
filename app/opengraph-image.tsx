import { ImageResponse } from "next/og";

export const alt = "Malicious URL Detector v2";
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
        background:
          "linear-gradient(140deg, rgba(245,239,228,1) 0%, rgba(240,159,83,0.22) 35%, rgba(86,170,154,0.24) 100%)",
        padding: "72px",
        color: "#16201d",
      }}
    >
      <div
        style={{
          fontSize: 28,
          letterSpacing: "0.24em",
          textTransform: "uppercase",
          color: "#596565",
        }}
      >
        Malicious URL Detector v2
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <div
          style={{
            fontSize: 92,
            lineHeight: 1,
            fontWeight: 700,
            maxWidth: "850px",
            letterSpacing: "-0.05em",
          }}
        >
          Stream link verdicts from 8 layered threat signals.
        </div>
        <div style={{ fontSize: 34, maxWidth: "760px", color: "#31403c" }}>
          VirusTotal, Safe Browsing, community feeds, TLS, DNS, redirects,
          registration data, and ML heuristics in one portfolio-grade interface.
        </div>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 18,
          fontSize: 28,
        }}
      >
        <div
          style={{
            display: "flex",
            height: 72,
            width: 72,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 24,
            backgroundColor: "#194239",
            color: "#f5efe4",
          }}
        >
          MD
        </div>
        <span>malicious-url-detector</span>
      </div>
    </div>,
    size,
  );
}
