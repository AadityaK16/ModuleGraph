"use client";

interface LoadingPipelineProps {
  progress: number;
  message?: string;
}

export function LoadingPipeline({ progress, message }: LoadingPipelineProps) {
  const circumference = 2 * Math.PI * 42;
  const offset = circumference * (1 - progress / 100);

  return (
    <div className="flex flex-col items-center justify-center gap-8 py-20">
      <div className="relative h-32 w-32">
        {/* Track ring */}
        <svg className="h-32 w-32" viewBox="0 0 100 100">
          <circle
            cx="50" cy="50" r="42"
            fill="none"
            stroke="rgba(99,102,241,0.1)"
            strokeWidth="6"
          />
          {/* Progress arc */}
          <circle
            cx="50" cy="50" r="42"
            fill="none"
            stroke="url(#spaceArcGrad)"
            strokeWidth="6"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform="rotate(-90 50 50)"
            style={{ transition: "stroke-dashoffset 0.5s ease" }}
          />
          <defs>
            <linearGradient id="spaceArcGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#a855f7" />
            </linearGradient>
          </defs>
        </svg>

        {/* Orbiting dot */}
        <div
          className="absolute inset-0"
          style={{ animation: "modulegraph-spin 2s linear infinite" }}
        >
          <div
            className="absolute h-3 w-3 rounded-full"
            style={{
              top: "4px",
              left: "50%",
              transform: "translateX(-50%)",
              background: "#c084fc",
              boxShadow: "0 0 8px rgba(192,132,252,0.8)",
            }}
          />
        </div>

        {/* Center planet */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="relative h-12 w-12 rounded-full"
            style={{
              background: "linear-gradient(135deg, #6366f1, #7c3aed)",
              boxShadow: "0 0 20px rgba(99,102,241,0.5)",
            }}
          >
            <div
              className="absolute inset-0 rounded-full"
              style={{ background: "linear-gradient(135deg, transparent, rgba(255,255,255,0.1))" }}
            />
          </div>
        </div>

        {/* Progress % */}
        <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 text-sm font-bold text-indigo-300">
          {progress}%
        </div>
      </div>

      <div className="text-center mt-4">
        <p className="text-white font-semibold text-lg">{message ?? "Launching…"}</p>
        <p className="text-slate-400 text-sm mt-1 flex items-center justify-center gap-1.5">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse" />
          Fetching your Canvas data
        </p>
      </div>

      <style>{`
        @keyframes modulegraph-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}