"use client";

import { useState, useCallback } from "react";
import type { CanvasAuth } from "@/lib/canvas-client";
import { fetchSyllabus, fetchModules, fetchAssignments } from "@/lib/canvas-client";
import type { ExtractionResponse } from "@/types/extraction";

const extractionCache = new Map<number, ExtractionResponse>();

export function useExtraction() {
  const [data, setData] = useState<ExtractionResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const extract = useCallback(async (auth: CanvasAuth, courseId: number) => {
    const cached = extractionCache.get(courseId);
    if (cached) {
      setData(cached);
      setError(null);
      setLoading(false);
      return cached;
    }

    setLoading(true);
    setError(null);
    setData(null);
    try {
      // Fetch syllabus, modules, and assignments in parallel
      const [syllabus, modulesRes, assignmentsRes] = await Promise.all([
        fetchSyllabus(auth, courseId),
        fetchModules(auth, courseId),
        fetchAssignments(auth, courseId),
      ]);

      // Transform modules into ExtractionRequest.moduleItems format
      const moduleItems = modulesRes.modules.map((m) => ({
        name: m.name,
        type: "module",
        items: m.items.map((item) => ({ title: item.title, type: item.type })),
      }));

      // Transform assignments with descriptions
      const assignments = assignmentsRes.assignments.map((a) => ({
        name: a.name,
        description: a.description,
        due_at: a.due_at,
        points_possible: a.points_possible,
      }));

      // POST to extraction API
      const res = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          syllabusText: syllabus.syllabusText,
          moduleItems,
          assignments,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `Extraction failed: ${res.statusText}`);
      }

      const result: ExtractionResponse = await res.json();
      extractionCache.set(courseId, result);
      setData(result);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    extractionCache.clear();
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return { data, loading, error, extract, reset };
}
