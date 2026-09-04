const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
export const FREE_WEEKLY_CREDITS = 3;

export interface CreditState {
  isPro: boolean;
  credits: number;
  creditsResetAt: string; // ISO timestamp of the last reset
}

/**
 * Given a Clerk user object, figures out the correct current credit
 * balance, applying a weekly reset for free-tier users if a week has
 * passed since their last reset. Does NOT write to Clerk itself —
 * caller decides whether/when to persist `changed` state.
 */
export function computeCreditState(user: any): { state: CreditState; changed: boolean } {
  const isPro = user.publicMetadata?.isPro === true;
  const now = Date.now();
  const storedResetAt = user.publicMetadata?.creditsResetAt as string | undefined;
  const storedCredits =
    typeof user.publicMetadata?.credits === 'number' ? (user.publicMetadata.credits as number) : null;

  let resetAtMs = storedResetAt ? new Date(storedResetAt).getTime() : 0;
  let credits = storedCredits ?? FREE_WEEKLY_CREDITS;
  let changed = false;

  if (isPro) {
    // Pro users don't use the weekly counter, but keep credits at a
    // high number in case they're ever downgraded without a webhook firing.
    return {
      state: { isPro: true, credits: storedCredits ?? 999, creditsResetAt: storedResetAt || new Date(now).toISOString() },
      changed: false,
    };
  }

  if (!storedResetAt || now - resetAtMs >= WEEK_MS) {
    credits = FREE_WEEKLY_CREDITS;
    resetAtMs = now;
    changed = true;
  }

  return {
    state: {
      isPro: false,
      credits,
      creditsResetAt: new Date(resetAtMs).toISOString(),
    },
    changed,
  };
}