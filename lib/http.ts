import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { AppError } from "./errors";
export async function readBody(request: Request, max = 16_000) {
  const origin = request.headers.get("origin");
  const expected = process.env.APP_ORIGIN ?? new URL(request.url).origin;
  if (origin && origin !== expected)
    throw new AppError(
      "This request came from an unsupported origin.",
      403,
      "ORIGIN",
    );
  if (request.headers.get("sec-fetch-site") === "cross-site")
    throw new AppError("Cross-site requests are not allowed.", 403, "ORIGIN");
  if (!request.headers.get("content-type")?.includes("application/json"))
    throw new AppError("Send a JSON request.", 415);
  const reader = request.body?.getReader();
  if (!reader) throw new AppError("Request body is missing.");
  let bytes = 0;
  const chunks: Uint8Array[] = [];
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    bytes += value.byteLength;
    if (bytes > max) {
      await reader.cancel();
      throw new AppError("This request is too large.", 413);
    }
    chunks.push(value);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8")) as unknown;
  } catch {
    throw new AppError("Request body is not valid JSON.");
  }
}
export function failure(error: unknown) {
  if (error instanceof AppError)
    return NextResponse.json(
      { error: error.message, code: error.code },
      { status: error.status },
    );
  if (error instanceof ZodError)
    return NextResponse.json(
      {
        error:
          "The supplied information has an invalid format. Please check it and try again.",
        code: "VALIDATION",
      },
      { status: 400 },
    );
  console.error(
    "SYNAPSE request failed:",
    error instanceof Error ? error.name : "Unknown error",
  );
  return NextResponse.json(
    {
      error:
        "The operation could not be completed. Your previous work is safe. Please retry.",
      code: "INTERNAL",
    },
    { status: 500 },
  );
}
