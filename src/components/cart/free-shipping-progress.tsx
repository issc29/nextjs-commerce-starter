"use client"

import { Truck } from "lucide-react"
import { useTranslations } from "next-intl"
import { getFreeShippingStatus } from "@/lib/shipping"
import { cn, formatPrice } from "@/lib/utils"

interface FreeShippingProgressProps {
  subtotal: number
}

export function FreeShippingProgress({ subtotal }: FreeShippingProgressProps) {
  const t = useTranslations("cart")
  const status = getFreeShippingStatus(subtotal)
  const message = status.qualified
    ? t("freeShippingUnlocked")
    : t("freeShippingProgress", { amount: formatPrice(status.remaining) })

  return (
    <div className="space-y-2" data-testid="free-shipping-progress">
      <p
        className={cn(
          "flex items-center gap-1.5 text-xs",
          status.qualified ? "font-medium text-success" : "text-muted-foreground"
        )}
        role="status"
        aria-live="polite"
      >
        <Truck className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        <span>{message}</span>
      </p>
      <div
        className="h-1.5 overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={status.qualified ? 100 : Math.floor(status.progress)}
        aria-label={message}
      >
        <div
          className={cn(
            "h-full rounded-full transition-[width] duration-300 ease-out",
            status.qualified ? "bg-success" : "bg-primary"
          )}
          style={{ width: `${status.progress}%` }}
        />
      </div>
    </div>
  )
}
