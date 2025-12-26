"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Loader2, Upload, AlertCircle } from "lucide-react"
import { addSpringProduct, updateSpringProduct, type SpringProduct } from "@/lib/spring-client"

interface ProductFormProps {
    initialData?: SpringProduct
    isEditing?: boolean
}

export function ProductForm({ initialData, isEditing = false }: ProductFormProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Form State
    const [name, setName] = useState(initialData?.name || "")
    const [description, setDescription] = useState(initialData?.description || "")
    const [brand, setBrand] = useState(initialData?.brand || "")
    const [price, setPrice] = useState(initialData?.price?.toString() || "")
    const [category, setCategory] = useState(initialData?.category || "")
    const [stockQuantity, setStockQuantity] = useState(initialData?.stockQuantity?.toString() || "")
    const [releaseDate, setReleaseDate] = useState(initialData?.releaseDate || new Date().toISOString().split('T')[0])
    const [productAvailable, setProductAvailable] = useState(initialData?.productAvailable ?? true)

    const [imageFile, setImageFile] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState<string | null>(
        isEditing && initialData?.imageUrl ? initialData.imageUrl : null
    )

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setImageFile(file)
            const reader = new FileReader()
            reader.onloadend = () => {
                setImagePreview(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        if (!imageFile && !isEditing) {
            setError("Please select a product image")
            setLoading(false)
            return
        }

        try {
            const productData: any = {
                name,
                description,
                brand,
                price: parseFloat(price),
                category,
                stockQuantity: parseInt(stockQuantity),
                releaseDate,
                productAvailable,
            }

            if (isEditing && initialData) {
                productData.id = initialData.id;
            }

            // If editing and no new image, we still need to send the old one or handle it in backend
            // But our client expects a File. 
            // For simplified implementation, we require re-uploading image on edit OR we mock a file if not changed.
            // However, the backend likely updates the image if provided.
            // Let's assume for this MVP, if it's edit and no image file is selected, we might have issues if backend wrapper requires Part.
            // The client `updateSpringProduct` takes `imageFile: File`.
            // We will create a dummy file if not provided during edit? 
            // Ideally backend should handle optional image update. 
            // Looking at backend `updateProduct` -> `@RequestPart MultipartFile imageFile`. It is required.
            // So user MUST upload image every time for now unless we change backend.

            if (isEditing && !imageFile) {
                setError("Due to backend constraints, please re-upload or select a new image when updating.")
                setLoading(false)
                return
            }

            const fileToUpload = imageFile || new File([""], "empty"); // Should be handled by validation above

            let result;
            if (isEditing && initialData) {
                result = await updateSpringProduct(initialData.id, productData, fileToUpload)
            } else {
                result = await addSpringProduct(productData, fileToUpload)
            }

            if (result) {
                router.push("/admin")
                router.refresh()
            } else {
                setError("Failed to save product")
            }
        } catch (err) {
            setError("An unexpected error occurred")
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>{isEditing ? "Edit Product" : "Add New Product"}</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">

                    {error && (
                        <div className="bg-destructive/10 text-destructive p-3 rounded-md flex items-center gap-2 text-sm">
                            <AlertCircle size={16} />
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Product Name</Label>
                            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="brand">Brand</Label>
                            <Input id="brand" value={brand} onChange={(e) => setBrand(e.target.value)} required />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea id="description" value={description} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)} required />
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="price">Price</Label>
                            <Input id="price" type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="stock">Stock</Label>
                            <Input id="stock" type="number" value={stockQuantity} onChange={(e) => setStockQuantity(e.target.value)} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="category">Category</Label>
                            <Input id="category" value={category} onChange={(e) => setCategory(e.target.value)} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="date">Release Date</Label>
                            <Input id="date" type="date" value={releaseDate} onChange={(e) => setReleaseDate(e.target.value)} />
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Switch id="available" checked={productAvailable} onCheckedChange={setProductAvailable} />
                        <Label htmlFor="available">Product Available</Label>
                    </div>

                    <div className="space-y-2">
                        <Label>Product Image</Label>
                        <div className="border-2 border-dashed border-input rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors bg-muted/50 relative">
                            <input
                                type="file"
                                accept="image/*"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                onChange={handleImageChange}
                            />
                            {imagePreview ? (
                                <img src={imagePreview} alt="Preview" className="h-48 object-contain" />
                            ) : (
                                <div className="text-center text-muted-foreground">
                                    <Upload className="mx-auto h-8 w-8 mb-2" />
                                    <span className="text-sm">Click to upload image</span>
                                </div>
                            )}
                        </div>
                        {isEditing && !imageFile && (
                            <p className="text-xs text-amber-600 mt-1">* You must re-upload image to update product.</p>
                        )}
                    </div>

                    <div className="flex gap-4">
                        <Button type="button" variant="outline" className="w-full" onClick={() => router.back()}>
                            Cancel
                        </Button>
                        <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={loading}>
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                "Save Product"
                            )}
                        </Button>
                    </div>

                </form>
            </CardContent>
        </Card>
    )
}
