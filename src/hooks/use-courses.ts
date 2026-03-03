"use client";

import { useState, useCallback } from "react";
import type { CanvasCourse } from "@/types/canvas";
import type { CanvasAuth } from "@/lib/canvas-client";
import { fetchCourses } from "@/lib/canvas-client";

export function useCourses() {
  const [courses, setCourses] = useState<CanvasCourse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (auth: CanvasAuth) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchCourses(auth);
      setCourses(data);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  return { courses, loading, error, load };
}
