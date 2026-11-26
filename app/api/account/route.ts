import { NextResponse } from "next/server";
import { z } from "zod";
import { identity, deleteRecords, consume } from "@/lib/store";
import { supabase } from "@/lib/supabase";
import { failure, readBody } from "@/lib/http";
import { AppError } from "@/lib/errors";
export async function POST(request: Request) {
  try {
    const b = z
      .discriminatedUnion("action", [
        z.object({ action: z.literal("delete-data") }),
        z.object({ action: z.literal("sign-out") }),
        z.object({ action: z.literal("sign-in"), email: z.email().max(254) }),
      ])
      .parse(await readBody(request));
    if (b.action === "sign-out") {
      const db = await supabase();
      if (db) await db.auth.signOut({ scope: "local" });
      return NextResponse.json({ ok: true });
    }
    const user = await identity();
    if (b.action === "delete-data") {
      await deleteRecords(user);
      return NextResponse.json({ ok: true });
    }
    const db = await supabase();
    if (!db)
      throw new AppError(
        "Email sign-in needs a separate Supabase project. Local learning is available without an account.",
        503,
        "AUTH_CONFIG",
      );
    await consume(user, "email-auth", 3, 3600);
    const origin = process.env.APP_ORIGIN ?? new URL(request.url).origin;
    const { error } = await db.auth.signInWithOtp({
      email: b.email,
      options: { emailRedirectTo: `${origin}/auth/callback` },
    });
    if (error)
      throw new AppError(
        "A sign-in link could not be sent. Please check your email and retry later.",
        503,
      );
    return NextResponse.json({
      ok: true,
      message:
        "Check your email for a sign-in link. Guest progress stays with the guest session; signing in opens your account’s learning history.",
    });
  } catch (e) {
    return failure(e);
  }
}
