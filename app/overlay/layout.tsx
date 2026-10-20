/**
 * Overlay layout — overrides the default body background so that OBS
 * Browser Sources can render this page on a fully transparent canvas.
 * Only the ticker bar paints pixels; everything else is see-through.
 */
export default function OverlayLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        background: "transparent",
        minHeight:  "100dvh",
        width:      "100%",
      }}
    >
      <style>{`
        html, body { background: transparent !important; }
      `}</style>
      {children}
    </div>
  );
}
