import { NextResponse } from "next/server";
import { publicServerMode } from "./lib/deployment-mode";

export function proxy() {
  if (publicServerMode())
    return NextResponse.json(
      {
        error:
          "This public edition runs the sample in your browser. Server features are available only in the protected workspace.",
        code: "PUBLIC_SAMPLE_ONLY",
      },
      { status: 403, headers: { "Cache-Control": "no-store" } },
    );
  return NextResponse.next();
}
export const config = { matcher: ["/api/:path*", "/auth/:path*"] };
