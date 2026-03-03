export interface CanvasCourse {
  id: number;
  name: string;
  course_code: string;
}

export interface CanvasModuleItem {
  id: number;
  title: string;
  type: string;
}

export interface CanvasModule {
  id: number;
  name: string;
  position: number;
  items: CanvasModuleItem[];
}

export interface SyllabusResponse {
  courseId: number;
  courseName: string;
  syllabusHtml: string;
  syllabusText: string;
}

export interface CanvasAssignment {
  name: string;
  description: string;
  due_at: string | null;
  points_possible: number | null;
}

export interface AssignmentsResponse {
  assignments: CanvasAssignment[];
}

export interface ModulesResponse {
  modules: CanvasModule[];
}
