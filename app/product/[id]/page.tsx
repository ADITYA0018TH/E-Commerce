import { ProductPageClient } from "@/components/product-page-client"
import { SetupTooltip } from "@/components/setup-tooltip"

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  // Server-side check for Shopify configuration
  const isShopifyConfigured = !!process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN

  return (
    <>
      <ProductPageClient productHandle={id} />
      {/* Show setup tooltip only when Shopify is not configured */}
      {!isShopifyConfigured && <SetupTooltip />}
    </>
  )
}
