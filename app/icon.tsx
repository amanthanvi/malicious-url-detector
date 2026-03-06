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
        background: "#194239",
        borderRadius: 20,
        color: "#f5efe4",
        display: "flex",
        fontSize: 28,
        fontWeight: 700,
        height: "100%",
        justifyContent: "center",
        position: "relative",
        width: "100%",
      }}
    >
      <div
        style={{
          border: "6px solid #f5efe4",
          borderRadius: "999px",
          height: 34,
          position: "absolute",
          width: 34,
        }}
      />
      <div
        style={{
          background: "#ef9355",
          borderRadius: "999px",
          height: 10,
          width: 10,
        }}
      />
    </div>,
    size,
  );
}
