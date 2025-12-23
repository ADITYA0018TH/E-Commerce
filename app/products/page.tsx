import { ProductsPageClient } from "@/components/products-page-client"
import { SetupTooltip } from "@/components/setup-tooltip"

export default function ProductsPage() {
  // Server-side check for Shopify configuration
  const isShopifyConfigured = !!process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN

  return (
    <>
      <ProductsPageClient />
      {/* Show setup tooltip only when Shopify is not configured */}
      {!isShopifyConfigured && <SetupTooltip />}
    </>
  )
}
