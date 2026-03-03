"use client";

import type { GraphNode } from "@/types/graph";
import { X } from "lucide-react";

interface NodeDetailPanelProps {
  node: GraphNode | null;
  onClose: () => void;
}

export function NodeDetailPanel({ node, onClose }: NodeDetailPanelProps) {
  if (!node) return null;

  return (
    <div
      className="rounded-xl p-4 w-64"
      style={{
        background: "rgba(6,13,31,0.92)",
        border: `1px solid ${node.color}44`,
        backdropFilter: "blur(16px)",
        boxShadow: `0 0 30px ${node.color}1a, 0 8px 32px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)`,
      }}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div
            className="h-8 w-8 rounded-full flex items-center justify-center text-white text-sm flex-shrink-0 font-bold"
            style={{
              background: `radial-gradient(circle at 35% 35%, ${node.color}dd, ${node.color}77)`,
              boxShadow: `0 0 12px ${node.color}66`,
            }}
          >
            {node.icon}
          </div>
          <span
            className="text-[10px] font-bold uppercase tracking-widest"
            style={{ color: node.color }}
          >
            {node.type}
          </span>
        </div>
        <button
          onClick={onClose}
          aria-label = "Close"
          className="text-slate-600 hover:text-white transition-colors mt-0.5"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <p className="text-sm font-semibold text-white leading-snug break-words">
        {node.name}
      </p>

      <div className="mt-3 pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <p className="text-xs text-slate-500">
          <span className="font-semibold" style={{ color: node.color }}>{node.connections}</span>{" "}
          connection{node.connections !== 1 ? "s" : ""}
        </p>
      </div>
    </div>
  );
}