# Public release configuration

I made the public edition a functioning browser-only teaching sample so visitors can explore SYNAPSE without creating an account or consuming paid AI. It uses the existing animation, narration, architecture, source-guide templates and deterministic assessment functions. Progress stays in the current browser and can be cleared in settings.

## Environment separation

| Environment | Configuration | Available services |
|---|---|---|
| [Public production](https://synapse-learning-one.vercel.app) | `NEXT_PUBLIC_SYNAPSE_PUBLIC_SAMPLE=true` at build time; no model or Supabase credentials | Embedded Fieldnotes sample and browser storage |
| [Protected preview](https://synapse-learning-qr1qac164-pranav-pokkulas-projects.vercel.app) | Preview-only Prune and dedicated Supabase configuration; sample flag unset/false | Imported-repository studio, real AI and hosted progress; Vercel Authentication required |
| Local full studio | [`.env.example`](../.env.example), sample flag false; credentials optional | Local filesystem storage or configured Supabase; optional AI |

The public flag is a nonsecret build-time switch. [`proxy.ts`](../proxy.ts) denies `/api/*` and `/auth/*` in public mode. Vercel production is also denied even if this flag is accidentally omitted. Identity and provider-configuration checks add server-side defenses. Paid public AI is outside this release's scope; preview credentials are absent from production.

[`lib/browser-sample.ts`](../lib/browser-sample.ts) routes sample operations through the existing deterministic lesson/scoring code and a versioned localStorage key. Inputs and restored progress are validated. No server session, Supabase anonymous account, private-project access or server filesystem is used. Practice scores are self-study indicators, not tamper-resistant credentials.

## Hosting and access

The `synapse-learning` Vercel project uses Standard Protection with policy `all_except_custom_domains`. The production domain is accessible signed out; preview and generated deployment URLs require Vercel Authentication. The project is not Git-connected, so a documentation commit does not automatically deploy it. The current deployment identity and measured checks are recorded in the [release audit](RELEASE_AUDIT.md).

The public sample shares learning components with the full workspace, but GitHub import, generated Gemini tutoring and cloud persistence remain protected features. The recorded demo shows that full workspace.

## Reproduce public checks

Use a local environment without model or Supabase credentials:

```sh
NEXT_PUBLIC_SYNAPSE_PUBLIC_SAMPLE=true npm run build
NEXT_PUBLIC_SYNAPSE_PUBLIC_SAMPLE=true VERCEL_ENV=production npm start -- --port 3001
# In another terminal:
npx tsx scripts/verify-public.ts
```

The script exercises signed-out navigation, source evidence, animation, template guidance, grading/reload, browser separation, mobile accessibility and direct API/auth denial. It does not assess audible speech or spend model credits. Set `PUBLIC_TEST_URL` to the actual production origin to run the same checks there. CI uses Chromium; local tests default to Chrome. The script writes its report and genuine screenshots under `evidence/`.

[Official Standard Protection documentation](https://vercel.com/docs/deployment-protection) · [Vercel Authentication policy](https://vercel.com/docs/deployment-protection/methods-to-protect-deployments/vercel-authentication).
