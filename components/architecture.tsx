"use client";
import { useState } from "react";
import {
  Code2,
  Database,
  FileCode2,
  Network,
  ShieldCheck,
  TestTube2,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import type { Snapshot, SourceFile } from "@/lib/types";
const icons: Record<string, typeof Code2> = {
  interface: Code2,
  server: Network,
  data: Database,
  auth: ShieldCheck,
  test: TestTube2,
  module: FileCode2,
};
export function Architecture({
  snapshot,
  onSource,
  large = false,
}: {
  snapshot: Snapshot;
  onSource: (path: string) => void;
  large?: boolean;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const connected = new Set(snapshot.edges.flatMap((e) => [e.from, e.to]));
  const files = [...snapshot.files]
    .sort(
      (a, b) => Number(connected.has(b.path)) - Number(connected.has(a.path)),
    )
    .filter((f) => !/\.css$|package.json/.test(f.path))
    .slice(0, large ? 18 : 8);
  const cols = large ? 3 : 3;
  const positions = new Map(
    files.map((f, i) => [
      f.path,
      { x: 46 + (i % cols) * 230, y: 38 + Math.floor(i / cols) * 115 },
    ]),
  );
  const edges = snapshot.edges.filter(
    (e) => positions.has(e.from) && positions.has(e.to),
  );
  const height = Math.max(260, Math.ceil(files.length / cols) * 115 + 20);
  function node(f: SourceFile) {
    const p = positions.get(f.path)!;
    const Icon = icons[f.category] ?? FileCode2;
    const active = selected === f.path;
    const related =
      selected &&
      snapshot.edges.some(
        (e) =>
          (e.from === selected && e.to === f.path) ||
          (e.to === selected && e.from === f.path),
      );
    return (
      <button
        key={f.path}
        className={`arch-node ${active ? "active" : ""} ${related ? "related" : ""}`}
        style={{ left: p.x, top: p.y }}
        onClick={() => setSelected(active ? null : f.path)}
        aria-pressed={active}
      >
        <span className={`node-icon ${f.category}`}>
          <Icon size={17} />
        </span>
        <span>
          <strong>{f.path.split("/").pop()}</strong>
          <small>
            {f.path.split("/").slice(0, -1).join("/") || "project root"}
          </small>
        </span>
      </button>
    );
  }
  return (
    <div className={`architecture ${large ? "expanded" : ""}`}>
      <div className="graph-scroller">
        <div
          className="graph-canvas"
          style={{ width: 740 * zoom, height: height * zoom }}
        >
          <div
            style={{
              width: 740,
              height,
              transform: `scale(${zoom})`,
              transformOrigin: "top left",
              position: "relative",
            }}
          >
            <svg
              width="740"
              height={height}
              className="graph-lines"
              aria-hidden="true"
            >
              <defs>
                <marker
                  id="edge-arrow"
                  markerWidth="6"
                  markerHeight="6"
                  refX="5"
                  refY="3"
                  orient="auto"
                >
                  <path d="M0 0L6 3L0 6" fill="var(--line-strong)" />
                </marker>
              </defs>
              {edges.map((e, i) => {
                const from = positions.get(e.from)!,
                  to = positions.get(e.to)!;
                const x1 = from.x + 95,
                  y1 = from.y + 55,
                  x2 = to.x + 95,
                  y2 = to.y;
                return (
                  <path
                    key={i}
                    d={`M${x1},${y1} C${x1},${y1 + 45} ${x2},${y2 - 35} ${x2},${y2}`}
                    className={
                      selected && (e.from === selected || e.to === selected)
                        ? "edge-selected"
                        : ""
                    }
                    markerEnd="url(#edge-arrow)"
                  />
                );
              })}
            </svg>
            {files.map(node)}
          </div>
        </div>
      </div>
      <div className="graph-toolbar">
        <span>
          <i className="legend-line" />
          Static import relationship{" "}
          <span className="muted">· {edges.length} shown</span>
        </span>
        <div>
          <button
            className="icon-button"
            aria-label="Zoom out"
            onClick={() => setZoom((z) => Math.max(0.65, z - 0.15))}
          >
            <ZoomOut size={16} />
          </button>
          <button
            className="icon-button"
            aria-label="Zoom in"
            onClick={() => setZoom((z) => Math.min(1.45, z + 0.15))}
          >
            <ZoomIn size={16} />
          </button>
        </div>
      </div>
      {selected && (
        <div className="graph-selection">
          <span>
            <strong>{selected}</strong>
            <small>
              {snapshot.files.find((f) => f.path === selected)?.imports.length}{" "}
              imports · relationships show source dependencies, not execution
              order
            </small>
          </span>
          <button
            className="button small secondary"
            onClick={() => onSource(selected)}
          >
            View source
          </button>
        </div>
      )}
      {!edges.length && (
        <p className="graph-note">
          No local imports resolved within this indexed subset. Select a file to
          inspect its source.
        </p>
      )}
    </div>
  );
}
