export async function verifyTurnstile(
  token: string | undefined,
  ip: string,
): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  // Only local `next dev` may skip verification; every other mode fails closed.
  if (!secret) return process.env.NODE_ENV === "development";
  if (!token) return false;

  const res = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        secret,
        response: token,
        remoteip: ip,
      }),
      signal: AbortSignal.timeout(8000),
    },
  ).catch(() => null);
  if (!res || !res.ok) return false;
  const data = (await res.json()) as { success: boolean };
  return data.success === true;
}
