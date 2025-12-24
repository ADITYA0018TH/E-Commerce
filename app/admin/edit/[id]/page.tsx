"use client"

import { useEffect, useState } from "react"
import { ProductForm } from "@/components/admin/product-form"
import { getSpringProduct, type SpringProduct } from "@/lib/spring-client"
import { Loader2 } from "lucide-react"

export default function EditProductPage({ params }: { params: { id: string } }) {
    const [product, setProduct] = useState<SpringProduct | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const id = parseInt(params.id)
                if (isNaN(id)) return

                const data = await getSpringProduct(id)
                setProduct(data)
            } catch (error) {
                console.error("Failed to fetch product", error)
            } finally {
                setLoading(false)
            }
        }
        fetchProduct()
    }, [params.id])

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        )
    }

    if (!product) {
        return <div className="text-center py-20">Product not found</div>
    }

    return (
        <div className="container mx-auto py-10 px-4">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-center">Edit Product</h1>
            </div>
            <ProductForm initialData={product} isEditing={true} />
        </div>
    )
}
