/**
 * Entitlements seam for future monetization (paid quest-packs, premium
 * features). MVP unlocks everything via AllFreeEntitlements. Screens can already
 * gate on `entitlements.has("feature")` — a no-op today, a real check once
 * purchases exist.
 */
export interface Entitlements {
  has(feature: string): boolean;
}

export class AllFreeEntitlements implements Entitlements {
  has(): boolean {
    return true;
  }
}

export const entitlements: Entitlements = new AllFreeEntitlements();
