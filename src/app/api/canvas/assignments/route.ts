import { NextRequest, NextResponse } from "next/server";

const CANVAS_BASE_URL = "https://sit.instructure.com";

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
    let url: string | null =
      `${CANVAS_BASE_URL}/api/v1/courses/${courseId}/assignments?per_page=50`;
    const allAssignments: { name: string; description: string; due_at: string | null; points_possible: number | null }[] = [];

    while (url) {
      const res: Response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        return NextResponse.json(
          { error: `Canvas API error: ${res.status}` },
          { status: res.status }
        );
      }

      const data = await res.json();
      for (const a of data) {
        allAssignments.push({
          name: a.name ?? "",
          description: a.description ? htmlToText(a.description) : "",
          due_at: a.due_at ?? null,
          points_possible: a.points_possible ?? null,
        });
      }

      const linkHeader = res.headers.get("Link") ?? "";
      const nextMatch = linkHeader.match(/<([^>]+)>;\s*rel="next"/);
      url = nextMatch ? nextMatch[1] : null;
    }

    return NextResponse.json({ assignments: allAssignments });
  } catch (err) {
    console.error("[/api/canvas/assignments]", err);
    return NextResponse.json(
      { error: "Failed to fetch assignments" },
      { status: 500 }
    );
  }
}
