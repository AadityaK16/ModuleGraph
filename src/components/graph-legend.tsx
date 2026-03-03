"use client";

const LEGEND = [
  { color: "#6366f1", icon: "✱", label: "Concept" },
  { color: "#8b5cf6", icon: "◆", label: "Topic" },
  { color: "#06b6d4", icon: "⚙", label: "Skill" },
  { color: "#f59e0b", icon: "✎", label: "Assignment" },
  { color: "#10b981", icon: "⚑", label: "Objective" },
  { color: "#ef4444", icon: "⚠", label: "Prerequisite" },
];

export function GraphLegend() {
  return (
    <div
      className="rounded-xl p-3 text-xs"
      style={{
        background: "rgba(6,13,31,0.88)",
        border: "1px solid rgba(99,102,241,0.2)",
        backdropFilter: "blur(12px)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)",
      }}
    >
      <p className="font-bold text-indigo-300 uppercase tracking-wider mb-2.5 text-[10px]">
        ✦ Map Legend
      </p>
      <div className="flex flex-col gap-1.5">
        {LEGEND.map(({ color, icon, label }) => (
          <div key={label} className="flex items-center gap-2">
            <div
              className="h-4 w-4 rounded-full flex-shrink-0 flex items-center justify-center text-[9px] text-white font-bold"
              style={{
                background: `radial-gradient(circle at 35% 35%, ${color}dd, ${color}88)`,
                boxShadow: `0 0 6px ${color}66`,
              }}
            >
              {icon}
            </div>
            <span className="text-slate-300">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}