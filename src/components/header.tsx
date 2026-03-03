"use client";

import { LogOut, Orbit } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  onLogout?: () => void;
  isConnected?: boolean;
}

export function Header({ onLogout, isConnected }: HeaderProps) {
  return (
    <header
      className="flex items-center justify-between px-6 py-3"
      style={{
        background: "linear-gradient(90deg, #060d1f 0%, #0d1535 50%, #060d1f 100%)",
        borderBottom: "1px solid rgba(99,102,241,0.2)",
      }}
    >
      <div className="flex items-center gap-3">
        <div
          className="flex h-8 w-8 items-center justify-center rounded-full"
          style={{
            background: "linear-gradient(135deg, #6366f1, #a855f7)",
            boxShadow: "0 0 12px rgba(99,102,241,0.5)",
          }}
        >
          <Orbit className="h-4 w-4 text-white" />
        </div>
        <div className="flex items-baseline gap-2">
          <h1
            className="text-base font-bold tracking-tight"
            style={{
              background: "linear-gradient(90deg, #818cf8, #c084fc)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            ModuleGraph
          </h1>
          <span className="text-xs text-slate-600 hidden sm:block">
            Canvas Knowledge Graph
          </span>
        </div>
      </div>

      {isConnected && onLogout && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onLogout}
          className="text-slate-500 hover:text-white gap-1.5 text-xs"
        >
          <LogOut className="h-3.5 w-3.5" />
          Disconnect
        </Button>
      )}
    </header>
  );
}