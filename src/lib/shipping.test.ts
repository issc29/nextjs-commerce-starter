import assert from "node:assert/strict"
import { beforeEach, describe, it } from "node:test"
import { readFileSync } from "node:fs"
import { siteConfig } from "@/lib/config"
import { getFreeShippingStatus } from "@/lib/shipping"
import { useCartStore } from "@/store/cart"
import type { ProductImage } from "@/types"

const image: ProductImage = {
  url: "/images/products/placeholder.svg",
  alt: "Test product",
}

describe("free shipping eligibility", () => {
  it("is configured centrally at $100", () => {
    assert.equal(siteConfig.freeShippingThreshold, 10000)
    assert.equal(siteConfig.standardShippingRate, 599)
  })

  it("keeps standard shipping at $99.99", () => {
    const status = getFreeShippingStatus(9999)

    assert.equal(status.qualified, false)
    assert.equal(status.remaining, 1)
    assert.equal(status.shippingCost, 599)
    assert.ok(status.progress > 99 && status.progress < 100)
  })

  it("qualifies at exactly $100", () => {
    const status = getFreeShippingStatus(10000)

    assert.equal(status.qualified, true)
    assert.equal(status.remaining, 0)
    assert.equal(status.shippingCost, 0)
    assert.equal(status.progress, 100)
  })

  it("qualifies at $100.01", () => {
    const status = getFreeShippingStatus(10001)

    assert.equal(status.qualified, true)
    assert.equal(status.remaining, 0)
    assert.equal(status.shippingCost, 0)
    assert.equal(status.progress, 100)
  })

  it("treats an empty cart as the full threshold away", () => {
    const status = getFreeShippingStatus(0)

    assert.equal(status.subtotal, 0)
    assert.equal(status.qualified, false)
    assert.equal(status.remaining, 10000)
    assert.equal(status.progress, 0)
    assert.equal(status.shippingCost, 599)
  })

  it("charges checkout with the same helper the cart uses", () => {
    const checkout = readFileSync(
      new URL("../app/(store)/checkout/page.tsx", import.meta.url),
      "utf8"
    )
    const summary = readFileSync(
      new URL("../components/cart/cart-summary.tsx", import.meta.url),
      "utf8"
    )

    assert.match(checkout, /getFreeShippingStatus\(subtotal\)\.shippingCost/)
    assert.match(summary, /getFreeShippingStatus\(subtotal\)/)
    assert.doesNotMatch(checkout, /freeShippingThreshold/)
  })
})

describe("cart quantity changes", () => {
  beforeEach(() => {
    useCartStore.setState({ items: [], isOpen: false })
  })

  it("recalculates eligibility when quantity changes or an item is removed", () => {
    useCartStore.getState().addItem({
      variantId: "variant-1",
      productId: "product-1",
      name: "Test product",
      variantName: "Default",
      image,
      slug: "test-product",
      price: 9999,
      quantity: 1,
    })

    let status = getFreeShippingStatus(useCartStore.getState().getSubtotal())
    assert.equal(status.subtotal, 9999)
    assert.equal(status.qualified, false)
    assert.equal(status.remaining, 1)

    useCartStore.getState().updateQuantity("variant-1", 2)
    status = getFreeShippingStatus(useCartStore.getState().getSubtotal())
    assert.equal(status.subtotal, 19998)
    assert.equal(status.qualified, true)
    assert.equal(status.shippingCost, 0)
    assert.equal(status.remaining, 0)

    useCartStore.getState().updateQuantity("variant-1", 1)
    status = getFreeShippingStatus(useCartStore.getState().getSubtotal())
    assert.equal(status.qualified, false)
    assert.equal(status.remaining, 1)

    useCartStore.getState().removeItem("variant-1")
    status = getFreeShippingStatus(useCartStore.getState().getSubtotal())
    assert.equal(status.subtotal, 0)
    assert.equal(status.qualified, false)
    assert.equal(status.remaining, siteConfig.freeShippingThreshold)
    assert.equal(status.progress, 0)
  })
})

describe("free shipping copy", () => {
  it("includes English and Spanish progress and success messages", () => {
    const en = JSON.parse(
      readFileSync(new URL("../../messages/en.json", import.meta.url), "utf8")
    )
    const es = JSON.parse(
      readFileSync(new URL("../../messages/es.json", import.meta.url), "utf8")
    )

    assert.match(en.cart.freeShippingProgress, /\{amount\}/)
    assert.match(es.cart.freeShippingProgress, /\{amount\}/)
    assert.equal(en.cart.freeShippingUnlocked, "You've unlocked free shipping!")
    assert.equal(es.cart.freeShippingUnlocked, "¡Ya tienes envío gratis!")
    assert.notEqual(en.cart.freeShippingProgress, es.cart.freeShippingProgress)
  })
})
