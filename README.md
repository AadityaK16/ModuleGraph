# ModuleGraph

> **Turn your Canvas syllabus into a living knowledge constellation.**

ModuleGraph connects to your Canvas LMS account and automatically generates an interactive, force-directed knowledge graph of your course — revealing the hidden relationships between concepts, assignments, skills, and prerequisites that flat module lists never show you.

---

## ✦ What It Does

Select a course. In seconds, ModuleGraph:

1. Fetches your **syllabus**, **module structure**, and **assignment descriptions** from the Canvas REST API
2. Sends that content through a **two-step LLM pipeline** (Featherless AI · Qwen3-4B) that extracts named academic entities and the semantic relationships between them
3. Renders everything as a **live, interactive force-directed graph** — nodes color-coded by type, links animated with traveling particles, hover labels, and click-to-zoom

The result: a visual map of your entire course. See at a glance that *Lab 3 builds on Lab 2*, both *assess Dynamic Programming*, and Dynamic Programming *requires Recursion* as a prerequisite.

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Icons | Lucide React |
| Font | Inter via `next/font/google` |
| Graph | `react-force-graph-2d` |
| Node Rendering | HTML5 Canvas API (custom `nodeCanvasObject`) |
| AI Inference | Featherless AI — `Qwen/Qwen3-4B-Instruct-2507` |
| Data Source | Canvas LMS REST API |

---

## 🧠 How the Extraction Pipeline Works

Extraction runs in two LLM calls, server-side inside a Next.js API route:

**Step 1 — Entity Extraction**
The model reads the syllabus, module list, and assignment descriptions and returns a JSON array of entities. Valid types: `concept` · `topic` · `skill` · `assignment` · `objective` · `prerequisite`. Target: 30+ entities per course.

**Step 2 — Relation Extraction**
Given the entity list and course content, the model returns subject-predicate-object triplets. Valid predicates: `requires` · `covers` · `assesses` · `builds_on` · `develops` · `part_of` · `precedes` · `relates_to`. Target: 40+ triplets. Every entity must have at least one relationship.

Both responses are regex-cleaned, JSON-parsed, deduplicated by lowercased name, and assembled into a `{ nodes, links }` graph object by `src/lib/graph-transformer.ts`.

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- A [Canvas Personal Access Token](https://canvas.instructure.com/doc/api/file.oauth.html#manual-token-generation)
- A [Featherless AI API key](https://featherless.ai)

### Installation

```bash
git clone https://github.com/AadityaK16/ModuleGraph.git
cd ModuleGraph
npm install
```

### Environment Variables

Create a `.env.local` file in the project root:

```env
FEATHERLESS_API_KEY=your_featherless_api_key_here
```

### Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), enter your Canvas instance URL and Personal Access Token, and select a course.

---

## 📁 Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── canvas/          # Proxy routes for Canvas API (courses, modules, assignments, syllabus)
│   │   └── extract/         # Two-step LLM extraction pipeline
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx             # Main app shell + state orchestration
├── components/
│   ├── auth-form.tsx         # Canvas token login
│   ├── course-selector.tsx   # Course dropdown
│   ├── graph-legend.tsx      # Node type legend overlay
│   ├── header.tsx            # App header
│   ├── knowledge-graph.tsx   # ForceGraph2D + custom canvas rendering
│   ├── loading-pipeline.tsx  # Animated loading state
│   ├── node-detail-panel.tsx # Click-to-inspect node panel
│   └── ui/                   # shadcn/ui primitives
├── hooks/
│   ├── use-canvas-auth.ts    # Auth state
│   ├── use-courses.ts        # Course fetching
│   └── use-extraction.ts     # Full extraction orchestration
├── lib/
│   ├── canvas-client.ts      # Canvas API fetch helpers
│   ├── graph-transformer.ts  # Entity + triplet → GraphData
│   └── utils.ts
└── types/
    ├── canvas.ts
    ├── extraction.ts
    └── graph.ts
```

---

## 🎨 Node Types

| Icon | Type | Color | Description |
|---|---|---|---|
| ✱ | Concept | Indigo | Core ideas and theories |
| ◆ | Topic | Purple | Subject areas and themes |
| ⚙ | Skill | Cyan | Practical abilities |
| ✎ | Assignment | Amber | Labs, projects, homework |
| ⚑ | Objective | Green | Learning goals |
| ⚠ | Prerequisite | Red | Required prior knowledge |

---

## ⚙️ Graph Rendering Details

Nodes are drawn entirely via the HTML5 Canvas API using `react-force-graph-2d`'s `nodeCanvasObject` prop:

- **Planet body** — radial gradient from lightened color at top-left to darkened color at edge
- **Glow halo** — radial gradient that intensifies on hover
- **Hover label** — pill-shaped background with rounded corners drawn via `quadraticCurveTo`, appears only on hover
- **Hover detection** — uses `useRef` (not `useState`) so the graph's own animation loop reads the current hovered node ID every frame without triggering React re-renders

Links render with directional arrows and animated purple traveling particles.

---

## 👥 Contributors

- [Aaditya Kulkarni](https://github.com/AadityaK16)
- [Andrew Hing](https://github.com/ahing1)
- [Jordan Tam](https://github.com/Jordan-Tam)

---
