"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useProducts } from "@/hooks/use-shopify"
import { useCart } from "@/context/cart-context"
import { ShoppingCart, Search, Filter, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"

export function ProductsPageClient() {
  const { products, loading, error } = useProducts()
  const { addItem } = useCart()
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("featured")
  const [addingProducts, setAddingProducts] = useState<Set<string>>(new Set())
  const [showFilters, setShowFilters] = useState(false)

  const searchParams = useSearchParams()
  const router = useRouter()
  const selectedCollection = searchParams.get("collection")

  // Available filter categories
  const categories = [
    { id: "electronics", label: "Electronics" },
    { id: "fashion", label: "Fashion" },
    { id: "accessories", label: "Accessories" },
    { id: "gaming", label: "Gaming" },
    { id: "photography", label: "Photography" },
    { id: "lifestyle", label: "Lifestyle" },
    { id: "tech-gear", label: "Tech Gear" },
    { id: "premium", label: "Premium" },
  ]

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
      <div className="min-h-screen bg-background py-8">
        <div className="container mx-auto px-4 text-center py-20">
          <Loader2 className="animate-spin h-12 w-12 mx-auto mb-4" />
          <p className="text-muted-foreground">Loading products...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="container mx-auto px-4 text-center py-20">
          <p className="text-red-600 mb-4">Error loading products: {error}</p>
          <Button onClick={() => window.location.reload()} className="bg-primary text-primary-foreground hover:bg-primary/90">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase())

    // Filter by category if selected
    const matchesCategory = !selectedCollection ||
      product.title.toLowerCase().includes(selectedCollection.toLowerCase()) ||
      product.description.toLowerCase().includes(selectedCollection.toLowerCase())

    return matchesSearch && matchesCategory
  })

  // Sort products based on sortBy selection
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const priceA = a.variants?.edges?.[0]?.node?.price?.amount
      ? Number.parseFloat(a.variants.edges[0].node.price.amount)
      : 0
    const priceB = b.variants?.edges?.[0]?.node?.price?.amount
      ? Number.parseFloat(b.variants.edges[0].node.price.amount)
      : 0

    switch (sortBy) {
      case "price-low":
        return priceA - priceB
      case "price-high":
        return priceB - priceA
      case "name":
        return a.title.localeCompare(b.title)
      default: // "featured"
        return 0
    }
  })

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            {selectedCollection
              ? selectedCollection.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
              : "All Products"}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover our complete collection of amazing products
          </p>
          {selectedCollection && (
            <Button
              variant="outline"
              className="mt-4 border-border bg-transparent"
              onClick={() => router.push("/products")}
            >
              Clear Filter
            </Button>
          )}
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-3 border-border focus:border-primary"
            />
          </div>

          <div className="flex gap-4">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 border border-border rounded-lg bg-background text-foreground"
            >
              <option value="featured">Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="name">Name A-Z</option>
            </select>

            <Button
              variant="outline"
              className={`px-6 border-border bg-transparent ${showFilters ? 'bg-primary text-primary-foreground' : ''}`}
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="mb-8 p-6 bg-card rounded-xl border border-border">
            <h3 className="font-semibold text-foreground mb-4">Filter by Category</h3>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={!selectedCollection ? "default" : "outline"}
                size="sm"
                onClick={() => router.push("/products")}
                className={!selectedCollection ? "bg-primary text-primary-foreground" : "border-border"}
              >
                All
              </Button>
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCollection === category.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => router.push(`/products?collection=${category.id}`)}
                  className={selectedCollection === category.id ? "bg-primary text-primary-foreground" : "border-border"}
                >
                  {category.label}
                </Button>
              ))}
            </div>
          </div>
        )}

        {sortedProducts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg">No products found matching your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {sortedProducts.map((product) => {
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
                description: product.description,
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
                            Quick Add
                          </Button>
                        </div>
                      </div>

                      <div className="p-6 flex flex-col flex-grow">
                        <Link href={`/product/${productData.handle}`}>
                          <h3 className="font-semibold text-lg text-foreground mb-2 group-hover:text-muted-foreground transition-colors cursor-pointer line-clamp-2 h-14 leading-7">
                            {productData.title}
                          </h3>
                        </Link>

                        <p className="text-muted-foreground text-sm mb-4 line-clamp-2 h-10 leading-5">
                          {productData.description}
                        </p>

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
        )}
      </div>
    </div>
  )
}
