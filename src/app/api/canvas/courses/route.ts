import { NextRequest, NextResponse } from "next/server";

const CANVAS_BASE_URL = "https://sit.instructure.com";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json(
      { error: "Missing token" },
      { status: 400 }
    );
  }

  try {
    const res = await fetch(
      `${CANVAS_BASE_URL}/api/v1/courses?enrollment_state=active&per_page=50`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!res.ok) {
      return NextResponse.json(
        { error: `Canvas API error: ${res.status} ${res.statusText}` },
        { status: res.status }
      );
    }

    const data = await res.json();

    // Filter to courses that have a name and id
    const courses = data
      .filter((c: { id: number; name?: string; course_code?: string }) => c.id && c.name)
      .map((c: { id: number; name: string; course_code?: string }) => ({
        id: c.id,
        name: c.name,
        course_code: c.course_code ?? "",
      }));

    return NextResponse.json({ courses });
  } catch (err) {
    console.error("[/api/canvas/courses]", err);
    return NextResponse.json(
      { error: "Failed to fetch courses from Canvas" },
      { status: 500 }
    );
  }
}
