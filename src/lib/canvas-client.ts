import type {
  CanvasCourse,
  AssignmentsResponse,
  ModulesResponse,
  SyllabusResponse,
} from "@/types/canvas";

export interface CanvasAuth {
  token: string;
}

function buildParams(auth: CanvasAuth, extra: Record<string, string> = {}): string {
  const params = new URLSearchParams({
    token: auth.token,
    ...extra,
  });
  return params.toString();
}

export async function fetchCourses(auth: CanvasAuth): Promise<CanvasCourse[]> {
  const res = await fetch(`/api/canvas/courses?${buildParams(auth)}`);
  if (!res.ok) throw new Error(`Failed to fetch courses: ${res.statusText}`);
  const data = await res.json();
  return data.courses as CanvasCourse[];
}

export async function fetchSyllabus(
  auth: CanvasAuth,
  courseId: number
): Promise<SyllabusResponse> {
  const res = await fetch(
    `/api/canvas/syllabus?${buildParams(auth, { courseId: String(courseId) })}`
  );
  if (!res.ok) throw new Error(`Failed to fetch syllabus: ${res.statusText}`);
  return res.json() as Promise<SyllabusResponse>;
}

export async function fetchAssignments(
  auth: CanvasAuth,
  courseId: number
): Promise<AssignmentsResponse> {
  const res = await fetch(
    `/api/canvas/assignments?${buildParams(auth, { courseId: String(courseId) })}`
  );
  if (!res.ok) throw new Error(`Failed to fetch assignments: ${res.statusText}`);
  return res.json() as Promise<AssignmentsResponse>;
}

export async function fetchModules(
  auth: CanvasAuth,
  courseId: number
): Promise<ModulesResponse> {
  const res = await fetch(
    `/api/canvas/modules?${buildParams(auth, { courseId: String(courseId) })}`
  );
  if (!res.ok) throw new Error(`Failed to fetch modules: ${res.statusText}`);
  return res.json() as Promise<ModulesResponse>;
}
