"use client"

import Link from "next/link"
import { useCollections } from "@/hooks/use-shopify"
import { Loader2, Headphones, Shirt, Watch, Gamepad2, Camera, Coffee, Package, Star } from "lucide-react"
import { Badge } from "@/components/ui/badge"

// Demo categories with icons for when Shopify is not connected
const demoCategories = [
  { id: "1", title: "Electronics", handle: "electronics", icon: Headphones },
  { id: "2", title: "Fashion", handle: "fashion", icon: Shirt },
  { id: "3", title: "Accessories", handle: "accessories", icon: Watch },
  { id: "4", title: "Gaming", handle: "gaming", icon: Gamepad2 },
  { id: "5", title: "Photography", handle: "photography", icon: Camera },
  { id: "6", title: "Lifestyle", handle: "lifestyle", icon: Coffee },
  { id: "7", title: "Tech Gear", handle: "tech-gear", icon: Package },
  { id: "8", title: "Premium", handle: "premium", icon: Star },
]

// Map collection titles to icons
const categoryIconMap: Record<string, typeof Headphones> = {
  electronics: Headphones,
  fashion: Shirt,
  accessories: Watch,
  gaming: Gamepad2,
  photography: Camera,
  lifestyle: Coffee,
  "tech-gear": Package,
  premium: Star,
}

export function Categories() {
  const { collections, loading, error } = useCollections()

  // Check if Shopify is configured
  const isShopifyConfigured = !!process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN

  if (loading) {
    return (
      <section id="categories-section" className="py-20 bg-muted">
        <div className="container mx-auto px-4 text-center">
          <Loader2 className="animate-spin h-12 w-12 mx-auto mb-4" />
          <p className="text-muted-foreground">Loading categories...</p>
        </div>
      </section>
    )
  }

  // Use demo categories if no collections or error
  const showDemo = error || collections.length === 0 || !isShopifyConfigured
  const categoriesToShow = showDemo ? demoCategories : collections

  return (
    <section id="categories-section" className="py-20 bg-muted">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Shop by Category</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {showDemo
              ? "Sample categories - connect your Shopify store to see real collections"
              : "Explore our wide range of products"}
          </p>
          {showDemo && (
            <Badge className="mt-4 bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 hover:bg-amber-100">
              Demo Mode
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {categoriesToShow.map((category) => {
            const Icon = showDemo
              ? (category as typeof demoCategories[0]).icon
              : categoryIconMap[category.handle.toLowerCase()] || Package

            return (
              <Link
                key={category.id}
                href={`/products?collection=${category.handle}`}
                className="group relative bg-card rounded-xl border border-border p-6 flex flex-col items-center justify-center gap-4 hover:shadow-lg hover:-translate-y-1 hover:border-foreground transition-all duration-300"
              >
                {showDemo && (
                  <Badge
                    variant="secondary"
                    className="absolute top-2 right-2 text-[10px] px-1.5 py-0.5 bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                  >
                    Demo
                  </Badge>
                )}

                <div className="w-12 h-12 flex items-center justify-center text-foreground group-hover:text-primary transition-colors duration-300">
                  <Icon className="w-10 h-10 stroke-[1.5]" />
                </div>

                <span className="font-medium text-sm text-foreground text-center group-hover:text-primary transition-colors duration-300">
                  {category.title}
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
