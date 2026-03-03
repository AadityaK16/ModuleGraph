"use client";

import { CanvasCourse } from "@/types/canvas";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CourseSelectorProps {
  courses: CanvasCourse[];
  selectedId: number | null;
  onSelect: (courseId: number) => void;
  disabled?: boolean;
}

export function CourseSelector({
  courses,
  selectedId,
  onSelect,
  disabled,
}: CourseSelectorProps) {
  return (
    <Select
      value={selectedId !== null ? String(selectedId) : undefined}
      onValueChange={(value) => onSelect(Number(value))}
      disabled={disabled}
    >
      <SelectTrigger className="w-full bg-slate-900 border-white/10 text-white">
        <SelectValue placeholder="Select a course\u2026" />
      </SelectTrigger>
      <SelectContent className="bg-slate-900 border-white/10">
        {courses.map((course) => (
          <SelectItem
            key={course.id}
            value={String(course.id)}
            className="text-white focus:bg-slate-800 focus:text-white"
          >
            {course.name} ({course.course_code})
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
