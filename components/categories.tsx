"use client"

import Link from "next/link"
import { useCollections } from "@/hooks/use-shopify"
import { Loader2 } from "lucide-react"

export function Categories() {
  const { collections, loading, error } = useCollections()

  if (loading) {
    return (
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <Loader2 className="animate-spin h-12 w-12 mx-auto mb-4" />
          <p className="text-gray-600">Loading categories...</p>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <p className="text-red-500">Error loading categories: {error}</p>
        </div>
      </section>
    )
  }

  // Show nothing or empty state if no collections
  if (collections.length === 0) {
    return (
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-500">No categories found.</p>
        </div>
      </section>
    )
  }

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-black mb-4">Shop by Category</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">Explore our wide range of products</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {collections.map((collection) => (
            <Link
              key={collection.id}
              href={`/products?collection=${collection.handle}`}
              className="group relative h-80 overflow-hidden rounded-2xl shadow-lg border border-gray-200 block"
            >
              <div className="absolute inset-0 bg-gray-200">
                {collection.image && (
                  <img
                    src={collection.image.url}
                    alt={collection.image.altText || collection.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                )}
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300" />
              <div className="absolute bottom-0 left-0 right-0 p-8 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                <h3 className="text-2xl font-bold text-white mb-2">{collection.title}</h3>
                <p className="text-gray-200 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-4 group-hover:translate-y-0 delay-100">
                  Browse Collection &rarr;
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
