import { NextRequest, NextResponse } from "next/server";

function htmlToText(html: string): string {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

const CANVAS_BASE_URL = "https://sit.instructure.com";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");
  const courseId = searchParams.get("courseId");

  if (!token || !courseId) {
    return NextResponse.json(
      { error: "Missing token or courseId" },
      { status: 400 }
    );
  }

  try {
    const res = await fetch(
      `${CANVAS_BASE_URL}/api/v1/courses/${courseId}?include[]=syllabus_body`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!res.ok) {
      return NextResponse.json(
        { error: `Canvas API error: ${res.status}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    const syllabusHtml: string = data.syllabus_body ?? "";
    const syllabusText = htmlToText(syllabusHtml);

    return NextResponse.json({
      courseId: Number(courseId),
      courseName: data.name ?? "",
      syllabusHtml,
      syllabusText,
    });
  } catch (err) {
    console.error("[/api/canvas/syllabus]", err);
    return NextResponse.json(
      { error: "Failed to fetch syllabus" },
      { status: 500 }
    );
  }
}
