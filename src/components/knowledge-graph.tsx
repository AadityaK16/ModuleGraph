"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef } from "react";
import type { GraphData, GraphNode } from "@/types/graph";

const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
  ssr: false,
});

// ─── color helpers — at module level so the component can use them ────────────

function lighten(hex: string, amount: number): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.min(255, (num >> 16) + amount);
  const g = Math.min(255, ((num >> 8) & 0xff) + amount);
  const b = Math.min(255, (num & 0xff) + amount);
  return `rgb(${r},${g},${b})`;
}

function darken(hex: string, amount: number): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.max(0, (num >> 16) - amount);
  const g = Math.max(0, ((num >> 8) & 0xff) - amount);
  const b = Math.max(0, (num & 0xff) - amount);
  return `rgb(${r},${g},${b})`;
}

interface KnowledgeGraphProps {
  data: GraphData;
  onNodeClick?: (node: GraphNode) => void;
}

// ─── component — useCallback and useRef must live inside here ─────────────────

export function KnowledgeGraph({ data, onNodeClick }: KnowledgeGraphProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fgRef = useRef<any>(null);

  // hoveredNodeRef is declared here, inside the component
  const hoveredNodeRef = useRef<string | null>(null);

  const handleNodeClick = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (node: any) => {
      const n = node as GraphNode & { x?: number; y?: number };
      if (fgRef.current && n.x !== undefined && n.y !== undefined) {
        fgRef.current.centerAt(n.x, n.y, 500);
        fgRef.current.zoom(3, 500);
      }
      onNodeClick?.(n as GraphNode);
    },
    [onNodeClick]
  );

  // nodeCanvasObject is also inside the component so it can close over hoveredNodeRef
  const nodeCanvasObject = useCallback(
  (node: object, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const n = node as GraphNode & { x?: number; y?: number; connections?: number };
    if (n.x === undefined || n.y === undefined) return;

    const connections = n.connections ?? 1;
    const radius = Math.max(8, Math.min(22, 6 + connections * 1.8));
    const isHovered = hoveredNodeRef.current === n.id;

    // ── Outer glow halo — more subtle when not hovered ──────────────────
    const glowSize = isHovered ? radius * 2.2 : radius * 1.3;
    const glowGrad = ctx.createRadialGradient(n.x, n.y, radius * 0.5, n.x, n.y, glowSize);
    glowGrad.addColorStop(0, n.color + (isHovered ? "55" : "15"));
    glowGrad.addColorStop(1, "transparent");
    ctx.beginPath();
    ctx.arc(n.x, n.y, glowSize, 0, Math.PI * 2);
    ctx.fillStyle = glowGrad;
    ctx.fill();

    // ── Planet body with radial gradient ────────────────────────────────
    const grad = ctx.createRadialGradient(
      n.x - radius * 0.3, n.y - radius * 0.3, radius * 0.1,
      n.x, n.y, radius
    );
    grad.addColorStop(0, lighten(n.color, 60));
    grad.addColorStop(0.5, n.color);
    grad.addColorStop(1, darken(n.color, 40));
    ctx.beginPath();
    ctx.arc(n.x, n.y, radius, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();
     // ── Border — thinner and more subtle unless hovered ──────────────────
    ctx.beginPath();
    ctx.arc(n.x, n.y, radius, 0, Math.PI * 2);
    ctx.strokeStyle = isHovered ? "#ffffff" : n.color + "66";
    ctx.lineWidth = isHovered ? 2.5 : 0.8;
    ctx.stroke();

    // ── Icon ─────────────────────────────────────────────────────────────
    ctx.font = `${radius * 0.85}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.shadowColor = "rgba(0,0,0,0.8)";
    ctx.shadowBlur = 4;
    ctx.fillText(n.icon ?? "○", n.x, n.y);
    ctx.shadowBlur = 0;

    // ── Label — only visible on hover ────────────────────────────────────
    if (!isHovered) return;

    const fontSize = Math.min(14, Math.max(9, 11 / Math.max(globalScale * 0.6, 0.4)));
    const labelY = n.y + radius + 7;
    const text = n.name.length > 28 ? n.name.slice(0, 28) + "…" : n.name;

    ctx.font = `${fontSize}px Inter, sans-serif`;
    const textW = ctx.measureText(text).width;
    const padX = 5, padY = 3, rx = 4;
    const lx = n.x - textW / 2 - padX;
    const ly = labelY - padY;
    const lw = textW + padX * 2;
    const lh = fontSize + padY * 2;

    // Label pill background
    ctx.fillStyle = "rgba(2,5,9,0.82)";
    ctx.beginPath();
    ctx.moveTo(lx + rx, ly);
    ctx.lineTo(lx + lw - rx, ly);
    ctx.quadraticCurveTo(lx + lw, ly, lx + lw, ly + rx);
    ctx.lineTo(lx + lw, ly + lh - rx);
      ctx.quadraticCurveTo(lx + lw, ly + lh, lx + lw - rx, ly + lh);
      ctx.lineTo(lx + rx, ly + lh);
      ctx.quadraticCurveTo(lx, ly + lh, lx, ly + lh - rx);
      ctx.lineTo(lx, ly + rx);
      ctx.quadraticCurveTo(lx, ly, lx + rx, ly);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = "#ffffff";
      ctx.textBaseline = "top";
      ctx.fillText(text, n.x, labelY);
    },
    [] // empty — reads hoveredNodeRef.current directly, never stale
  );

  return (
    <div className="relative w-full h-full">
      <div className="absolute inset-0">
        <ForceGraph2D
          ref={fgRef}
          graphData={data as { nodes: object[]; links: object[] }}
          nodeCanvasObject={nodeCanvasObject}
          nodeCanvasObjectMode={() => "replace"}
          linkColor={() => "rgba(99,102,241,0.4)"}
          linkWidth={1.5}
          linkDirectionalArrowLength={5}
          linkDirectionalArrowRelPos={1}
          linkDirectionalParticles={2}
          linkDirectionalParticleWidth={2}
          linkDirectionalParticleColor={() => "rgba(168,85,247,0.8)"}
          backgroundColor="#020509"
          onNodeClick={handleNodeClick}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onNodeHover={(node: any) => {
            // writes to the ref — the graph's animation loop picks it up next frame
            hoveredNodeRef.current = node ? (node as GraphNode).id : null;
            document.body.style.cursor = node ? "pointer" : "default";
          }}
          nodeLabel={() => ""}
          cooldownTicks={120}
          d3AlphaDecay={0.02}
          d3VelocityDecay={0.3}
          minZoom={0.5}
          maxZoom={20}
          warmupTicks={100}
        />
      </div>
    </div>
  );
}