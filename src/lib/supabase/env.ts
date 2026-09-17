/**
 * NEXT_PUBLIC_* values are inlined at build time, so a deploy that built
 * without them yields `undefined` here and every Supabase client throws deep
 * inside the library with an opaque message — which surfaces as a bare
 * "Internal Server Error" on every route, because the proxy/middleware
 * constructs a client on each request. Failing loudly and specifically here
 * turns that into something readable in the runtime log.
 */
function required(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(
      `Missing ${name}. Set it in your deployment's environment variables, then ` +
        `redeploy — NEXT_PUBLIC_* values are baked in at build time, so adding ` +
        `the variable without a rebuild will not take effect.`,
    );
  }
  return value;
}

export const SUPABASE_URL = required(
  "NEXT_PUBLIC_SUPABASE_URL",
  process.env.NEXT_PUBLIC_SUPABASE_URL,
);

export const SUPABASE_ANON_KEY = required(
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);
