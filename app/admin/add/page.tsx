import { ProductForm } from "@/components/admin/product-form"

export default function AddProductPage() {
    return (
        <div className="container mx-auto py-10 px-4">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-center">Add New Product</h1>
            </div>
            <ProductForm />
        </div>
    )
}
