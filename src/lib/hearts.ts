export const MAX_HEARTS = 10;
export const HEART_REFILL_MS = 60 * 60 * 1000;

export type HeartsSnapshot = {
  hearts: number;
  heartsUpdatedAt: Date;
};

export type HeartsState = {
  hearts: number;
  anchoredAt: Date;
};

export function computeCurrentHearts(
  snapshot: HeartsSnapshot,
  now: Date = new Date(),
): HeartsState {
  const { hearts, heartsUpdatedAt } = snapshot;
  if (hearts >= MAX_HEARTS) {
    return { hearts: MAX_HEARTS, anchoredAt: now };
  }
  const elapsed = now.getTime() - heartsUpdatedAt.getTime();
  if (elapsed <= 0) {
    return { hearts, anchoredAt: heartsUpdatedAt };
  }
  const refills = Math.floor(elapsed / HEART_REFILL_MS);
  const next = Math.min(MAX_HEARTS, hearts + refills);
  if (next >= MAX_HEARTS) {
    return { hearts: MAX_HEARTS, anchoredAt: now };
  }
  const newAnchor = new Date(
    heartsUpdatedAt.getTime() + refills * HEART_REFILL_MS,
  );
  return { hearts: next, anchoredAt: newAnchor };
}

export function msUntilNextHeart(
  state: HeartsState,
  now: Date = new Date(),
): number | null {
  if (state.hearts >= MAX_HEARTS) return null;
  const nextAt = state.anchoredAt.getTime() + HEART_REFILL_MS;
  return Math.max(0, nextAt - now.getTime());
}

export function spendFromState(state: HeartsState, count: number): HeartsState {
  const spent = Math.min(state.hearts, Math.max(0, count));
  const nextHearts = state.hearts - spent;
  const wasFull = state.hearts >= MAX_HEARTS;
  return {
    hearts: nextHearts,
    anchoredAt: wasFull ? new Date() : state.anchoredAt,
  };
}
