import { ImageResponse } from "next/og";

export const size = {
  width: 64,
  height: 64,
};

export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        alignItems: "center",
        background: "#080c10",
        borderRadius: 16,
        color: "#00e639",
        display: "flex",
        fontSize: 28,
        fontWeight: 700,
        height: "100%",
        justifyContent: "center",
        position: "relative",
        width: "100%",
      }}
    >
      {/* Shield outline */}
      <div
        style={{
          border: "4px solid #00e639",
          borderRadius: "6px 6px 16px 16px",
          height: 36,
          width: 28,
          position: "absolute",
        }}
      />
      {/* Center dot */}
      <div
        style={{
          background: "#00e639",
          borderRadius: "999px",
          height: 8,
          width: 8,
          boxShadow: "0 0 8px #00e639",
        }}
      />
    </div>,
    size,
  );
}
