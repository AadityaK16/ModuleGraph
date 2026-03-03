"use client";

import { useState } from "react";
import type { CanvasAuth } from "@/lib/canvas-client";

export function useCanvasAuth() {
  const [auth, setAuth] = useState<CanvasAuth | null>(null);

  function login(token: string) {
    setAuth({ token });
  }

  function logout() {
    setAuth(null);
  }

  return { auth, login, logout };
}
