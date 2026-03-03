"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Rocket } from "lucide-react";

interface AuthFormProps {
  onLogin: (token: string) => void;
  loading?: boolean;
  error?: string | null;
}

export function AuthForm({ onLogin, loading, error }: AuthFormProps) {
  const [token, setToken] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token.trim()) return;
    onLogin(token.trim());
  }

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Gradient border wrapper */}
      <div
        className="rounded-2xl p-px shadow-2xl"
        style={{
          background: "linear-gradient(135deg, rgba(99,102,241,0.4), rgba(168,85,247,0.2), rgba(6,182,212,0.15))",
        }}
      >
        <div className="rounded-2xl p-8" style={{ background: "rgba(7,13,31,0.95)" }}>
          <div className="mb-7 text-center">
            <div
              className="inline-flex h-14 w-14 items-center justify-center rounded-full mb-4"
              style={{
                background: "linear-gradient(135deg, #6366f1, #a855f7)",
                boxShadow: "0 0 24px rgba(99,102,241,0.5)",
              }}
            >
              <Rocket className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-1">Connect to Canvas</h2>
            <p className="text-sm text-slate-400">
              Enter your Personal Access Token to launch
            </p>
          </div>

          {error && (
            <Alert
              variant="destructive"
              className="mb-4"
              style={{
                background: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.3)",
              }}
            >
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="token" className="text-slate-300 text-sm font-medium">
                Personal Access Token
              </Label>
              <Input
                id="token"
                type="password"
                placeholder="••••••••••••••••••••"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                required
                className="text-white placeholder:text-slate-600"
                style={{
                  background: "rgba(13,21,53,0.8)",
                  border: "1px solid rgba(99,102,241,0.25)",
                }}
              />
              <p className="text-xs text-slate-600">
                Account → Settings → Approved Integrations → + New Access Token
              </p>
            </div>

            <Button
              type="submit"
              disabled={loading || !token}
              className="w-full text-white font-semibold py-5"
              style={{
                background: loading
                  ? "rgba(99,102,241,0.4)"
                  : "linear-gradient(135deg, #6366f1, #a855f7)",
                boxShadow: !loading ? "0 0 20px rgba(99,102,241,0.3)" : undefined,
                border: "none",
              }}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Connecting…
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Rocket className="h-4 w-4" />
                  Launch ModuleGraph
                </span>
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}