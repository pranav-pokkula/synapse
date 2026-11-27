# Public release configuration

The public edition is **option B: a functioning browser-only teaching sample**. It uses the existing animation, narration, architecture, source-guide templates and deterministic assessment functions. It does not run imported code or call paid AI. Its progress is local to the browser and can be cleared in settings.

## Environment separation

| Environment | Configuration | Available services |
|---|---|---|
| Public production | `NEXT_PUBLIC_SYNAPSE_PUBLIC_SAMPLE=true` at build time; no model or Supabase credentials | Embedded sample and browser storage only |
| Existing protected preview | Existing preview-only Prune and dedicated Supabase configuration; public flag unset/false | Full imported-repository studio, real AI and hosted progress |
| Local full studio | `.env.example`, public flag false; credentials optional | Local filesystem storage or configured Supabase; optional AI |

The public flag is a nonsecret build-time switch. `proxy.ts` denies `/api/*` and `/auth/*` in public mode. Vercel production is also denied even if this flag is accidentally omitted. `identity()` and `providerConfigured()` provide additional server-side checks. Production must never receive the preview credentials. Enabling paid public AI would require a separate reviewed implementation and authorization.

The client routes sample operations to `lib/browser-sample.ts`, which uses the existing deterministic lesson/scoring code and a versioned localStorage key. Inputs and restored progress are validated. No server session, Supabase anonymous account, private project access or server filesystem is needed. Practice scores are self-study indicators, not tamper-resistant credentials.

## Vercel access

Use only the existing `synapse-learning` project in `pranav-pokkulas-projects`. Standard Vercel Authentication should protect preview and generated deployment URLs while allowing the production domain. Do not disable protection globally. Verify the actual policy, signed-out production requests and signed-out preview denial after release.

Deploy the merged main commit as a staged production deployment with `--skip-domain`, inspect it, then promote only after the intended public configuration is verified. Preserve preview credentials and the existing dedicated database. No migration is needed for this release.

## Reproduce public checks

```sh
# Supply the flag before building. Keep production service credentials absent.
NEXT_PUBLIC_SYNAPSE_PUBLIC_SAMPLE=true npm run build
NEXT_PUBLIC_SYNAPSE_PUBLIC_SAMPLE=true VERCEL_ENV=production npm start -- --port 3001
# Another terminal:
npx tsx scripts/verify-public.ts
```

The script exercises signed-out navigation, source evidence, animation, template guidance, grading/reload, browser separation, mobile accessibility and direct API denial. It does not claim audible speech or spend model credits. Set `PUBLIC_TEST_URL` to the actual production origin to run the same checks there. CI uses Chromium; local tests default to Chrome.

See [final handoff](FINAL_SUBMISSION_HANDOFF.md) for the verified deployment URL, commit and results. The approved video records the full protected experience, so its cloud and AI features are not advertised as available in the public sample.

## Verified deployment

Public domain: https://synapse-learning-one.vercel.app. Initial release deployment `dpl_8wEp4APaKfetqpZrGJzbuXDTybUd` was built from merged main `84983f462eca9ac660836f9029fc560a75da8df0`, staged, checked, then promoted. Standard Protection is saved as `all_except_custom_domains`; signed-out preview requests redirect to Vercel SSO. All 22 production checks passed. The temporary automation bypass created by CLI verification was revoked. Later documentation-only deployments preserve this application implementation.

[Official Standard Protection scope](https://vercel.com/docs/deployment-protection) · [API policy values](https://vercel.com/docs/deployment-protection/methods-to-protect-deployments/vercel-authentication).
