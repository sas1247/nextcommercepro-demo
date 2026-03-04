export default function AdminGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ minHeight: "100vh", background: "#07070c", color: "white" }}>
      {/* gradient + glow (inline, garantat) */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none" }}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(135deg, #000000 0%, #0b0b12 55%, rgba(53,51,205,0.28) 100%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: -220,
            right: -220,
            width: 680,
            height: 680,
            borderRadius: 9999,
            background: "rgba(53,51,205,0.22)",
            filter: "blur(80px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -260,
            left: -260,
            width: 760,
            height: 760,
            borderRadius: 9999,
            background: "rgba(0,0,0,0.60)",
            filter: "blur(90px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0.08,
            backgroundImage:
              "linear-gradient(to right, rgba(255,255,255,.12) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,.12) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />
      </div>

      <div style={{ position: "relative" }}>{children}</div>
    </div>
  );
}