import { siteConfig } from "@/lib/config"

export interface FreeShippingStatus {
  /** Merchandise subtotal in cents. */
  subtotal: number
  /** Configured free-shipping threshold in cents. */
  threshold: number
  /** Cents still needed. Zero once the order qualifies. */
  remaining: number
  qualified: boolean
  /** Fill percentage from 0 through 100. */
  progress: number
  /** Shipping charge in cents. Zero when the order qualifies. */
  shippingCost: number
}

/**
 * Single free-shipping eligibility check for the cart, progress indicator,
 * and checkout charge. Amounts are integer cents.
 */
export function getFreeShippingStatus(subtotalCents: number): FreeShippingStatus {
  const threshold = siteConfig.freeShippingThreshold
  const subtotal = Number.isFinite(subtotalCents) ? Math.max(0, subtotalCents) : 0
  const qualified = subtotal >= threshold
  const remaining = qualified ? 0 : threshold - subtotal
  const progress =
    threshold <= 0 ? 100 : Math.min(100, (subtotal / threshold) * 100)

  return {
    subtotal,
    threshold,
    remaining,
    qualified,
    progress,
    shippingCost: qualified ? 0 : siteConfig.standardShippingRate,
  }
}
