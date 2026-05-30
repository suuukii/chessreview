import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const fen = request.nextUrl.searchParams.get("fen");

  if (!fen) {
    return NextResponse.json({ error: "Missing fen" }, { status: 400 });
  }

  try {
    const headers: HeadersInit = {
      Accept: "application/json",
      "User-Agent": "chessreview-local",
    };

    if (process.env.LICHESS_TOKEN) {
      headers.Authorization = `Bearer ${process.env.LICHESS_TOKEN}`;
    }

    const response = await fetch(
      `https://explorer.lichess.ovh/masters?fen=${encodeURIComponent(fen)}&moves=0`,
      {
        headers,
        cache: "no-store",
      },
    );

    if (!response.ok) {
      return NextResponse.json({
        opening: null,
        upstreamStatus: response.status,
      });
    }

    return NextResponse.json(await response.json());
  } catch (error) {
    console.error("Lichess opening explorer request failed", error);
    return NextResponse.json({ opening: null });
  }
}
