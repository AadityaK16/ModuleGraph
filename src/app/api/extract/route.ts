import { NextRequest, NextResponse } from "next/server";

const FEATHERLESS_API_KEY = "PUT YOUR API KEY HERE";
const FEATHERLESS_BASE_URL = "https://api.featherless.ai/v1";
const MODEL = "Qwen/Qwen3-4B-Instruct-2507";

async function callLLM(prompt: string): Promise<string> {
  const res = await fetch(`${FEATHERLESS_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${FEATHERLESS_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: "user", content: prompt }],
      max_tokens: 4096,
      temperature: 0.2,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Featherless error ${res.status}: ${err}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "";
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { syllabusText, moduleItems, assignments } = body as {
      syllabusText: string;
      moduleItems: { name: string; type: string; items: { title: string; type: string }[] }[];
      assignments: { name: string; description: string; due_at: string | null; points_possible: number | null }[];
    };

    const syllabusTruncated = syllabusText.slice(0, 3000);
    const modulesTruncated = JSON.stringify(moduleItems).slice(0, 6000);

    // Condense assignments: keep enough description for the LLM to understand what each covers
    const condensedAssignments = assignments.map((a) => ({
      name: a.name,
      description: a.description.slice(0, 500),
      points: a.points_possible,
    }));
    const assignmentsSummary = JSON.stringify(condensedAssignments);

    // Step 1 — Entity extraction
    const step1Prompt = `You are an academic knowledge extractor. Given the course syllabus, module list, and assignments below, extract all important entities.

For each entity return a JSON array of objects with "name" and "type".
Valid types: concept, topic, skill, assignment, objective, prerequisite

Rules:
- Include ALL assignments/labs as entities with type "assignment"
- For each assignment, also extract the concepts, topics, and skills it covers as separate entities
- Target: 30+ entities

Return ONLY valid JSON array. No explanation.

SYLLABUS:
${syllabusTruncated}

MODULES:
${modulesTruncated}

ASSIGNMENTS:
${assignmentsSummary}

JSON:`;

    const step1Raw = await callLLM(step1Prompt);
    const step1Clean = step1Raw
      .replace(/```json|```/g, "")
      .trim()
      .match(/\[[\s\S]*\]/)?.[0] ?? "[]";
    const entities = JSON.parse(step1Clean);

    const syllabusTruncated2 = syllabusText.slice(0, 1500);
    const modulesTruncated2 = JSON.stringify(moduleItems).slice(0, 3000);
    const entitiesStr = entities
      .map((e: { name: string }) => e.name)
      .join(", ");

    // Step 2 — Relation extraction
    const step2Prompt = `You are an academic knowledge graph builder. Given these entities and course content, extract semantic relationships as subject-predicate-object triplets.

Valid predicates: requires, covers, assesses, builds_on, develops, part_of, precedes, relates_to

Rules:
- Every assignment/lab MUST have at least 2 relationships connecting it to concepts, topics, or skills it covers or assesses
- Use "assesses" for assignment -> concept/skill relationships (what the assignment tests)
- Use "develops" for assignment -> skill relationships (what the assignment helps build)
- Use "covers" for assignment -> topic relationships (what the assignment is about)
- Use "requires" for prerequisite relationships
- Use "builds_on" to connect sequential assignments (e.g. Lab 2 builds_on Lab 1)
- Use "precedes" to show ordering between assignments
- Target: 40+ triplets. Every entity should have at least one relationship.

Return ONLY a valid JSON array of objects with "subject", "predicate", "object". No explanation.

ENTITIES: ${entitiesStr}

SYLLABUS:
${syllabusTruncated2}

MODULES:
${modulesTruncated2}

ASSIGNMENTS:
${assignmentsSummary}

JSON:`;

    const step2Raw = await callLLM(step2Prompt);
    const step2Clean = step2Raw
      .replace(/```json|```/g, "")
      .trim()
      .match(/\[[\s\S]*\]/)?.[0] ?? "[]";
    const triplets = JSON.parse(step2Clean);

    return NextResponse.json({ entities, triplets });
  } catch (err) {
    console.error("[/api/extract]", err);
    return NextResponse.json(
      { error: "Extraction failed", detail: String(err) },
      { status: 500 }
    );
  }
}
