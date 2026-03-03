# ModuleGraph — Technical Specification

## Context

ModuleGraph is a 24-hour hackathon project that ingests Canvas LMS course data and generates an interactive knowledge graph showing semantic connections between course concepts. The goal is to help neurodiverse learners visualize curriculum structure that's hidden in linear syllabi. The MVP targets 30+ semantic connections from a single Canvas course.

## Confirmed Tech Stack

- **Framework**: Next.js 15 (App Router) + TypeScript
- **UI**: shadcn/ui + Tailwind CSS
- **Backend**: Next.js API routes (no separate backend)
- **Graph**: react-force-graph-2d (dynamic import, no SSR)
- **AI**: Featherless.ai API + Qwen3-4B-Instruct
- **Auth**: Canvas Personal Access Token (user-supplied at runtime)
- **Database**: None

## Architecture

```
User → AuthForm (baseUrl + token)
     → GET /api/canvas/courses → Canvas REST API
     → CourseSelector dropdown
     → GET /api/canvas/syllabus + GET /api/canvas/modules (parallel)
     → POST /api/extract (2-step LLM: entities → triplets)
     → graph-transformer.ts → react-force-graph-2d
```

## Directory Structure

```
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                    # Single-page orchestrator
│   ├── globals.css
│   └── api/
│       ├── canvas/
│       │   ├── courses/route.ts    # GET - list enrolled courses
│       │   ├── syllabus/route.ts   # GET - fetch + parse syllabus HTML
│       │   └── modules/route.ts    # GET - fetch modules with items
│       └── extract/route.ts        # POST - 2-step SPO extraction via Featherless
├── components/
│   ├── ui/                         # shadcn components
│   ├── auth-form.tsx
│   ├── course-selector.tsx
│   ├── knowledge-graph.tsx         # ForceGraph2D wrapper
│   ├── graph-legend.tsx
│   ├── node-detail-panel.tsx
│   ├── loading-pipeline.tsx
│   └── header.tsx
├── lib/
│   ├── utils.ts                    # shadcn cn() helper
│   ├── canvas-client.ts            # Client-side fetch wrappers for API routes
│   ├── html-to-text.ts             # HTML → plain text (regex-based)
│   ├── prompt-builder.ts           # Step 1 + Step 2 extraction prompts
│   ├── graph-transformer.ts        # Entities + triplets → ForceGraph2D data
│   ├── node-icons.ts               # Entity type → color + symbol mapping
│   └── mock-data.ts                # Pre-generated demo data
├── types/
│   ├── canvas.ts                   # Canvas API response types
│   ├── extraction.ts               # Entity, Triplet, ExtractionRequest/Response
│   └── graph.ts                    # GraphNode, GraphLink, GraphData
└── hooks/
    ├── use-canvas-auth.ts
    ├── use-courses.ts
    ├── use-course-data.ts
    └── use-extraction.ts
```

## API Routes

### `GET /api/canvas/courses`
- Query: `baseUrl`, `token`
- Proxies `${baseUrl}/api/v1/courses?enrollment_state=active&per_page=50`
- Returns: `{ courses: [{ id, name, course_code }] }`

### `GET /api/canvas/syllabus`
- Query: `baseUrl`, `token`, `courseId`
- Proxies `${baseUrl}/api/v1/courses/${courseId}?include[]=syllabus_body`
- Converts HTML to text server-side
- Returns: `{ courseId, courseName, syllabusHtml, syllabusText }`

### `GET /api/canvas/modules`
- Query: `baseUrl`, `token`, `courseId`
- Proxies `${baseUrl}/api/v1/courses/${courseId}/modules?include[]=items&per_page=50`
- Handles Canvas Link header pagination (max 5 pages)
- Returns: `{ modules: [{ id, name, position, items: [{ id, title, type }] }] }`

### `POST /api/extract`
- Body: `{ syllabusText, moduleItems: [{ name, type, items[] }] }`
- Two sequential LLM calls to Featherless.ai
- Returns: `{ entities: [{ name, type }], triplets: [{ subject, predicate, object }] }`

## Extraction Prompts

**Step 1** — Entity extraction: categorize as concept/topic/skill/assignment/objective/prerequisite. Target: 15+ entities.

**Step 2** — Relation extraction: SPO triplets using predicates: `requires`, `covers`, `assesses`, `builds_on`, `develops`, `part_of`, `precedes`, `relates_to`. Target: 20+ triplets.

Input truncation: syllabus capped at 3000 chars (Step 1) / 1500 chars (Step 2). Module items capped at 2000/1000 chars.

## Graph Rendering

- `react-force-graph-2d` with dynamic import (`ssr: false`)
- Custom `nodeCanvasObject` for colored circles + unicode icons per entity type
- Node size weighted by connection count
- Click-to-focus: highlight neighbors, zoom to node, show detail panel
- Dark background (`#0f172a`)

**Node colors**: concept=#6366f1, topic=#8b5cf6, skill=#06b6d4, assignment=#f59e0b, objective=#10b981, prerequisite=#ef4444

**Node icons** (unicode): concept=✱, topic=◆, skill=⚙, assignment=✎, objective=⚑, prerequisite=⚠

## Environment Variables

```
# .env.local
FEATHERLESS_API_KEY=your-key-here
```

Canvas token is user-supplied at runtime, never stored server-side.
