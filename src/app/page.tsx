"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/header";
import { AuthForm } from "@/components/auth-form";
import { CourseSelector } from "@/components/course-selector";
import { KnowledgeGraph } from "@/components/knowledge-graph";
import { GraphLegend } from "@/components/graph-legend";
import { NodeDetailPanel } from "@/components/node-detail-panel";
import { LoadingPipeline } from "@/components/loading-pipeline";
import { useCanvasAuth } from "@/hooks/use-canvas-auth";
import { useCourses } from "@/hooks/use-courses";
import { useExtraction } from "@/hooks/use-extraction";
import { buildGraphFromExtraction } from "@/lib/graph-transformer";
import type { GraphNode, GraphData } from "@/types/graph";

export default function Home() {
  const { auth, login, logout } = useCanvasAuth();
  const { courses, loading: coursesLoading, error: coursesError, load: loadCourses } = useCourses();
  const { data: extraction, loading: extracting, error: extractionError, extract, reset: resetExtraction } = useExtraction();

  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] });
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);

  useEffect(() => { if (auth) loadCourses(auth); }, [auth, loadCourses]);
  useEffect(() => { if (auth && selectedCourseId !== null) extract(auth, selectedCourseId); }, [auth, selectedCourseId, extract]);
  useEffect(() => { if (extraction) setGraphData(buildGraphFromExtraction(extraction.entities, extraction.triplets)); }, [extraction]);

  function handleLogout() {
    logout();
    resetExtraction();
    setSelectedCourseId(null);
    setGraphData({ nodes: [], links: [] });
    setSelectedNode(null);
  }

  function handleCourseSelect(courseId: number) {
    setSelectedCourseId(courseId);
    setGraphData({ nodes: [], links: [] });
    setSelectedNode(null);
  }

  const isLoading = coursesLoading || extracting;
  const error = coursesError ?? extractionError;
  const hasData = graphData.nodes.length > 0;

  return (
    <div
      className="flex flex-col h-screen text-white overflow-hidden"
      style={{ background: "radial-gradient(ellipse at 20% 30%, #0d1b3e 0%, #060d1f 40%, #020509 100%)" }}
    >
      <Header isConnected={!!auth} onLogout={handleLogout} />

      {/* ── Not logged in ── */}
      {!auth && (
        <main className="flex-1 flex items-center justify-center p-6 relative overflow-hidden">
          {/* Decorative nebula orbs */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div
              className="absolute -top-32 -left-32 h-96 w-96 rounded-full opacity-20"
              style={{ background: "radial-gradient(circle, #6366f1, transparent 70%)" }}
            />
            <div
              className="absolute -bottom-40 -right-20 h-80 w-80 rounded-full opacity-15"
              style={{ background: "radial-gradient(circle, #a855f7, transparent 70%)" }}
            />
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full opacity-5"
              style={{ background: "radial-gradient(circle, #06b6d4, transparent 70%)" }}
            />
          </div>

          <div className="w-full max-w-md relative z-10">
            <div className="text-center mb-8">
              <p className="text-indigo-300 text-sm font-medium tracking-widest uppercase mb-3">
                ✦ Knowledge Constellation
              </p>
              <h2 className="text-4xl font-bold text-white mb-3 leading-tight">
                Visualize your<br />
                <span
                  style={{
                    background: "linear-gradient(90deg, #818cf8, #c084fc, #67e8f9)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  coursework universe
                </span>
              </h2>
              <p className="text-slate-400 text-sm">
                Connect your Canvas account to see your course content as an interactive knowledge graph.
              </p>
            </div>
            <AuthForm onLogin={login} loading={isLoading} error={error} />
          </div>
        </main>
      )}

      {/* ── Logged in ── */}
      {auth && (
        <>
          {/* Course selector bar */}
          {courses.length > 0 && (
            <div
              className="px-6 py-3 flex items-center gap-4"
              style={{
                borderBottom: "1px solid rgba(99,102,241,0.15)",
                background: "rgba(6,13,31,0.6)",
              }}
            >
              <label className="text-sm font-medium text-slate-400 flex-shrink-0">Course</label>
              <div className="w-72">
                <CourseSelector
                  courses={courses}
                  selectedId={selectedCourseId}
                  onSelect={handleCourseSelect}
                  disabled={extracting}
                />
              </div>
            </div>
          )}

          {/* Loading courses */}
          {coursesLoading && (
            <main className="flex-1 flex items-center justify-center">
              <LoadingPipeline progress={30} message="Scanning your courses…" />
            </main>
          )}

          {/* Extracting */}
          {extracting && (
            <main className="flex-1 flex items-center justify-center">
              <LoadingPipeline progress={60} message="Mapping the knowledge graph…" />
            </main>
          )}

          {/* Error */}
          {!isLoading && error && (
            <main className="flex-1 flex items-center justify-center p-6">
              <div className="text-center max-w-md">
                <div className="text-5xl mb-4">☄️</div>
                <p className="text-red-400 text-lg font-semibold mb-2">Houston, we have a problem</p>
                <p className="text-slate-400 text-sm mb-5">{error}</p>
                <button
                  onClick={handleLogout}
                  className="text-indigo-400 hover:text-indigo-300 underline text-sm"
                >
                  Try reconnecting
                </button>
              </div>
            </main>
          )}

          {/* Graph view */}
          {!isLoading && !error && hasData && (
            <main className="flex-1 relative overflow-hidden">
              <KnowledgeGraph data={graphData} onNodeClick={(node) => setSelectedNode(node)} />

              <div className="absolute top-4 right-4 flex flex-col gap-3">
                <GraphLegend />
                <NodeDetailPanel node={selectedNode} onClose={() => setSelectedNode(null)} />
              </div>

              {/* Stats pill */}
              <div
                className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4 rounded-full px-5 py-2 text-xs text-slate-400"
                style={{
                  background: "rgba(6,13,31,0.85)",
                  border: "1px solid rgba(99,102,241,0.2)",
                  backdropFilter: "blur(12px)",
                  boxShadow: "0 0 20px rgba(99,102,241,0.1)",
                }}
              >
                <span>
                  <span className="text-indigo-300 font-semibold">{graphData.nodes.length}</span> entities
                </span>
                <span className="text-indigo-900">✦</span>
                <span>
                  <span className="text-purple-300 font-semibold">{graphData.links.length}</span> relationships
                </span>
              </div>
            </main>
          )}

          {/* No course selected yet */}
          {!isLoading && !error && !hasData && selectedCourseId === null && courses.length > 0 && (
            <main className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl mb-3">🌌</div>
                <p className="text-slate-500">Select a course to generate its knowledge graph.</p>
              </div>
            </main>
          )}

          {/* Extraction returned nothing */}
          {!isLoading && !error && !hasData && selectedCourseId !== null && (
            <main className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl mb-3">🔭</div>
                <p className="text-slate-500">No entities extracted. Try a different course.</p>
              </div>
            </main>
          )}
        </>
      )}
    </div>
  );
}