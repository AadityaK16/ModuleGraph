import { NextRequest, NextResponse } from "next/server";

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
    let url: string | null =
      `${CANVAS_BASE_URL}/api/v1/courses/${courseId}/modules?include[]=items&per_page=50`;
    const allModules: unknown[] = [];

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
      allModules.push(...data);

      // Parse Link header for pagination
      const linkHeader = res.headers.get("Link") ?? "";
      const nextMatch = linkHeader.match(/<([^>]+)>;\s*rel="next"/);
      url = nextMatch ? nextMatch[1] : null;
    }

    return NextResponse.json({ modules: allModules });
  } catch (err) {
    console.error("[/api/canvas/modules]", err);
    return NextResponse.json(
      { error: "Failed to fetch modules" },
      { status: 500 }
    );
  }
}
