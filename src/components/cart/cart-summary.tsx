"use client"

import { formatPrice } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"
import { siteConfig } from "@/lib/config"
import { getFreeShippingStatus } from "@/lib/shipping"
import { FreeShippingProgress } from "./free-shipping-progress"

interface CartSummaryProps {
  subtotal: number
}

export function CartSummary({ subtotal }: CartSummaryProps) {
  const { shippingCost } = getFreeShippingStatus(subtotal)
  const tax = Math.round(subtotal * siteConfig.taxRate)
  const total = subtotal + shippingCost + tax

  return (
    <div className="space-y-3">
      <FreeShippingProgress subtotal={subtotal} />
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Subtotal</span>
        <span>{formatPrice(subtotal)}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Shipping</span>
        <span>{shippingCost === 0 ? "Free" : formatPrice(shippingCost)}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Estimated tax</span>
        <span>{formatPrice(tax)}</span>
      </div>
      <Separator />
      <div className="flex justify-between font-medium">
        <span>Total</span>
        <span>{formatPrice(total)}</span>
      </div>
    </div>
  )
}
