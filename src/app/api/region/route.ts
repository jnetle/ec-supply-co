import type { NextRequest } from "next/server";

/**
 * The visitor's country, from Vercel's edge geolocation, so the analytics
 * loader knows whether to ask before setting cookies. Null off Vercel.
 */
export function GET(request: NextRequest) {
  const country = request.headers.get("x-vercel-ip-country");
  return Response.json(
    { country },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
