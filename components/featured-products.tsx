"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Loader2 } from "lucide-react"
import { useCart } from "@/context/cart-context"
import { useProducts } from "@/hooks/use-shopify"
import Link from "next/link"
import { useState } from "react"

export function FeaturedProducts() {
  const { products, loading, error } = useProducts()
  const { addItem } = useCart()
  const [addingProducts, setAddingProducts] = useState<Set<string>>(new Set())

  const handleAddToCart = async (product: any, event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()

    const variant = product.variants.edges[0]?.node
    if (variant) {
      setAddingProducts((prev) => new Set(prev).add(product.id))
      try {
        await addItem({
          id: variant.id,
          name: product.title,
          price: Number.parseFloat(variant.price.amount),
          image: product.images.edges[0]?.node.url || "/placeholder.svg",
          handle: product.handle,
        })
      } finally {
        setAddingProducts((prev) => {
          const newSet = new Set(prev)
          newSet.delete(product.id)
          return newSet
        })
      }
    }
  }

  if (loading) {
    return (
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 text-center">
          <Loader2 className="animate-spin h-12 w-12 mx-auto mb-4" />
          <p className="text-muted-foreground">Loading featured products...</p>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 text-center">
          <p className="text-red-600">Error loading products: {error}</p>
        </div>
      </section>
    )
  }

  // Show generic message if no products
  if (products.length === 0) {
    return (
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground">No featured products found.</p>
        </div>
      </section>
    )
  }

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Featured Products</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Handpicked items from our collection
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.slice(0, 6).map((product) => {
            const variant = product.variants.edges[0]?.node
            const image = product.images.edges[0]?.node
            const price = variant ? Number.parseFloat(variant.price.amount) : 0
            const compareAtPrice = product.compareAtPriceRange?.minVariantPrice?.amount
            const hasDiscount = compareAtPrice && Number.parseFloat(compareAtPrice) > price
            const discount = hasDiscount
              ? Math.round(((Number.parseFloat(compareAtPrice!) - price) / Number.parseFloat(compareAtPrice!)) * 100)
              : 0

            const productData = {
              id: product.id,
              title: product.title,
              price,
              compareAtPrice: compareAtPrice ? Number.parseFloat(compareAtPrice) : null,
              hasDiscount,
              discount,
              image: image?.url || "/placeholder.svg",
              imageAlt: image?.altText || product.title,
              handle: product.handle,
              available: variant?.availableForSale || false,
            }

            const isAddingThisProduct = addingProducts.has(productData.id)

            return (
              <div key={productData.id} className="h-full">
                <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 border border-border h-full flex flex-col relative">
                  <CardContent className="p-0 flex flex-col h-full">
                    <div className="relative overflow-hidden">
                      <Link href={`/product/${productData.handle}`}>
                        <img
                          src={productData.image}
                          alt={productData.imageAlt}
                          className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                        />
                      </Link>

                      {productData.hasDiscount && (
                        <Badge className="absolute top-4 left-4 bg-primary text-primary-foreground">{productData.discount}% OFF</Badge>
                      )}

                      <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <Button
                          type="button"
                          className="bg-background text-foreground hover:bg-muted border border-border"
                          onClick={(e) => handleAddToCart(product, e)}
                          disabled={!productData.available || isAddingThisProduct}
                        >
                          {isAddingThisProduct ? (
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          ) : (
                            <ShoppingCart className="w-4 h-4 mr-2" />
                          )}
                          {productData.available ? "Quick Add" : "Out of Stock"}
                        </Button>
                      </div>
                    </div>

                    <div className="p-6 flex flex-col flex-grow">
                      <Link href={`/product/${productData.handle}`}>
                        <h3 className="font-semibold text-lg text-foreground mb-3 group-hover:text-muted-foreground transition-colors cursor-pointer line-clamp-2 h-14 leading-7">
                          {productData.title}
                        </h3>
                      </Link>

                      <div className="flex items-center gap-2 mb-4 h-8">
                        <span className="text-2xl font-bold text-foreground">${productData.price.toFixed(2)}</span>
                        {productData.hasDiscount && productData.compareAtPrice && (
                          <>
                            <span className="text-lg text-muted-foreground line-through">
                              ${productData.compareAtPrice.toFixed(2)}
                            </span>
                            <Badge variant="secondary" className="bg-secondary text-secondary-foreground text-xs">
                              {productData.discount}% OFF
                            </Badge>
                          </>
                        )}
                      </div>

                      <div className="mt-auto">
                        <Button
                          type="button"
                          className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                          onClick={(e) => handleAddToCart(product, e)}
                          disabled={!productData.available || isAddingThisProduct}
                        >
                          {isAddingThisProduct ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Add to Cart"}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )
          })}
        </div>

        <div className="text-center mt-12">
          <Link href="/products">
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 py-6 border-primary text-primary hover:bg-primary hover:text-primary-foreground bg-transparent"
            >
              View All Products
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
