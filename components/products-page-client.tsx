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

export function ProductsPageClient() {
  const { products, loading, error } = useProducts()
  const { addItem } = useCart()
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("featured")
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null)
  const [addingProducts, setAddingProducts] = useState<Set<string>>(new Set())

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const collectionParam = urlParams.get("collection")
    if (collectionParam) {
      setSelectedCollection(collectionParam)
    }
  }, [])

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
      <div className="min-h-screen bg-white py-8">
        <div className="container mx-auto px-4 text-center py-20">
          <Loader2 className="animate-spin h-12 w-12 mx-auto mb-4" />
          <p className="text-gray-600">Loading products...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white py-8">
        <div className="container mx-auto px-4 text-center py-20">
          <p className="text-red-600 mb-4">Error loading products: {error}</p>
          <Button onClick={() => window.location.reload()} className="bg-black text-white hover:bg-black/90">
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

    return matchesSearch
  })

  return (
    <div className="min-h-screen bg-white py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-black mb-4">
            {selectedCollection ? `Collection: ${selectedCollection}` : "All Products"}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover our complete collection of amazing products
          </p>
          {selectedCollection && (
            <Button
              variant="outline"
              className="mt-4 border-gray-300 bg-transparent"
              onClick={() => {
                setSelectedCollection(null)
                window.history.pushState({}, "", "/products")
              }}
            >
              Clear Filter
            </Button>
          )}
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="search"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-3 border-gray-300 focus:border-black"
            />
          </div>

          <div className="flex gap-4">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg bg-white"
            >
              <option value="featured">Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="name">Name A-Z</option>
            </select>

            <Button variant="outline" className="px-6 border-gray-300 bg-transparent">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-600 text-lg">No products found matching your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredProducts.map((product) => {
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
                  <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 border border-gray-200 h-full flex flex-col relative">
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
                          <Badge className="absolute top-4 left-4 bg-black text-white">{productData.discount}% OFF</Badge>
                        )}

                        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <Button
                            type="button"
                            className="bg-white text-black hover:bg-gray-100 border border-gray-200"
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
                          <h3 className="font-semibold text-lg text-black mb-2 group-hover:text-gray-600 transition-colors cursor-pointer line-clamp-2 h-14 leading-7">
                            {productData.title}
                          </h3>
                        </Link>

                        <p className="text-gray-600 text-sm mb-4 line-clamp-2 h-10 leading-5">
                          {productData.description}
                        </p>

                        <div className="flex items-center gap-2 mb-4 h-8">
                          <span className="text-2xl font-bold text-black">${productData.price.toFixed(2)}</span>
                          {productData.hasDiscount && productData.compareAtPrice && (
                            <>
                              <span className="text-lg text-gray-500 line-through">
                                ${productData.compareAtPrice.toFixed(2)}
                              </span>
                              <Badge variant="secondary" className="bg-gray-100 text-black text-xs">
                                {productData.discount}% OFF
                              </Badge>
                            </>
                          )}
                        </div>

                        <div className="mt-auto">
                          <Button
                            type="button"
                            className="w-full bg-black text-white hover:bg-black/90"
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
