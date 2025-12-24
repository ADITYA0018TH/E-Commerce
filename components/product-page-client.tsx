"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useCart } from "@/context/cart-context"
import { ShoppingCart, Truck, Shield, RotateCcw, ArrowLeft, Loader2 } from "lucide-react"
import { useState } from "react"
import Link from "next/link"
import { useProduct } from "@/hooks/use-shopify"

interface ProductPageClientProps {
  productHandle: string
}

export function ProductPageClient({ productHandle }: ProductPageClientProps) {
  const { product, loading, error } = useProduct(productHandle)
  const { addItem, state: cartState } = useCart()
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [activeTab, setActiveTab] = useState("description")
  // Track if this product is being added to cart
  const [isAddingToCart, setIsAddingToCart] = useState(false)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading product...</p>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Product Not Found</h1>
          <p className="text-muted-foreground mb-6">This product doesn't exist in your Shopify store</p>
          <Link href="/">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">Return Home</Button>
          </Link>
        </div>
      </div>
    )
  }

  const variant = product.variants.edges[0]?.node
  const images = product.images.edges.map((edge) => edge.node)
  const price = variant ? Number.parseFloat(variant.price.amount) : 0
  const compareAtPrice = product.compareAtPriceRange.minVariantPrice.amount
  const hasDiscount = compareAtPrice && Number.parseFloat(compareAtPrice) > price
  const discount = hasDiscount
    ? Math.round(((Number.parseFloat(compareAtPrice) - price) / Number.parseFloat(compareAtPrice)) * 100)
    : 0

  const handleAddToCart = async (event: React.FormEvent) => {
    // Prevent form submission and page reload
    event.preventDefault()

    if (variant) {
      setIsAddingToCart(true)

      try {
        await addItem(
          {
            id: variant.id,
            name: product.title,
            price: price,
            image: images[0]?.url || "/placeholder.svg",
            handle: product.handle,
          },
          quantity,
        )
      } finally {
        setIsAddingToCart(false)
      }
    }
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-8">
          <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-muted rounded-lg overflow-hidden border border-border">
              <img
                src={images[selectedImage]?.url || "/placeholder.svg?height=500&width=500"}
                alt={images[selectedImage]?.altText || product.title}
                className="w-full h-full object-cover"
              />
            </div>

            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {images.slice(0, 4).map((image, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square bg-muted rounded-lg overflow-hidden border-2 transition-colors ${selectedImage === index ? "border-primary" : "border-border hover:border-muted-foreground"
                      }`}
                  >
                    <img
                      src={image.url || "/placeholder.svg"}
                      alt={image.altText || `${product.title} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              {hasDiscount && <Badge className="bg-primary text-primary-foreground mb-4">{discount}% OFF</Badge>}

              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{product.title}</h1>

              <div className="flex items-center gap-4 mb-6">
                <span className="text-3xl font-bold text-foreground">${price.toFixed(2)}</span>
                {hasDiscount && (
                  <>
                    <span className="text-xl text-muted-foreground line-through">
                      ${Number.parseFloat(compareAtPrice).toFixed(2)}
                    </span>
                    <Badge variant="secondary" className="bg-secondary text-secondary-foreground">
                      {discount}% OFF
                    </Badge>
                  </>
                )}
              </div>

              <div className="prose max-w-none mb-6">
                <p className="text-muted-foreground text-lg leading-relaxed">
                  {product.description || "No description available for this product."}
                </p>
              </div>
            </div>

            {/* Quantity and Add to Cart Form */}
            <form onSubmit={handleAddToCart} className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="font-medium">Quantity:</span>
                <div className="flex items-center border border-border rounded-lg">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2 hover:bg-muted"
                    disabled={isAddingToCart}
                  >
                    -
                  </button>
                  <span className="px-4 py-2 border-x border-border">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-2 hover:bg-muted"
                    disabled={isAddingToCart}
                  >
                    +
                  </button>
                </div>
                <span className="text-sm text-muted-foreground">{variant?.availableForSale ? "In stock" : "Out of stock"}</span>
              </div>

              <div className="flex gap-4">
                <Button
                  type="submit"
                  disabled={!variant?.availableForSale || isAddingToCart}
                  className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 text-lg py-6 disabled:opacity-50"
                >
                  {isAddingToCart ? (
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  ) : (
                    <ShoppingCart className="w-5 h-5 mr-2" />
                  )}
                  {variant?.availableForSale ? "Add to Cart" : "Out of Stock"}
                </Button>
              </div>
            </form>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Truck className="w-4 h-4 text-foreground" />
                Free Shipping
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Shield className="w-4 h-4 text-foreground" />
                Secure Payment
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <RotateCcw className="w-4 h-4 text-foreground" />
                Easy Returns
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-16">
          <div className="border-b border-border">
            <nav className="flex space-x-8">
              {["description", "details"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${activeTab === tab
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                    }`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>

          <div className="py-8">
            {activeTab === "description" && (
              <div className="prose max-w-none">
                <p className="text-muted-foreground leading-relaxed">
                  {product.description || "No detailed description available for this product."}
                </p>
              </div>
            )}

            {activeTab === "details" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="font-medium text-foreground">Product ID:</span>
                    <span className="text-muted-foreground">{product.id.split("/").pop()}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="font-medium text-foreground">Handle:</span>
                    <span className="text-muted-foreground">{product.handle}</span>
                  </div>
                  {variant && (
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="font-medium text-foreground">Variant:</span>
                      <span className="text-muted-foreground">{variant.title}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
