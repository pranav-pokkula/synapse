export const publicSample =
  process.env.NEXT_PUBLIC_SYNAPSE_PUBLIC_SAMPLE === "true";

// Production is always restricted, even if a future deployment omits the UI flag.
export function publicServerMode() {
  return publicSample || process.env.VERCEL_ENV === "production";
}
