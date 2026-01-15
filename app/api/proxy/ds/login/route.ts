import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const landauToken = request.headers.get("Landau-Token");

    const response = await fetch("https://api-dev.landau.app/v1/ds/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Landau-Token": landauToken || "",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Proxy error:", error);
    return NextResponse.json(
      { error: "Failed to proxy request" },
      { status: 500 }
    );
  }
}
