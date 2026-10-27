"use client";

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="bn">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
          background: "#fbf9f6",
          color: "#15173b",
          fontFamily: "system-ui, sans-serif",
          textAlign: "center",
          padding: 24,
        }}
      >
        <h1 style={{ fontSize: 28, margin: 0 }}>কিছু একটা ভুল হয়েছে</h1>
        <p style={{ margin: 0, color: "#5b5d7a" }}>Something went wrong.</p>
        <button
          onClick={() => reset()}
          style={{
            background: "#ac1f29",
            color: "#fff",
            border: 0,
            borderRadius: 999,
            padding: "12px 32px",
            cursor: "pointer",
          }}
        >
          আবার চেষ্টা করুন
        </button>
      </body>
    </html>
  );
}