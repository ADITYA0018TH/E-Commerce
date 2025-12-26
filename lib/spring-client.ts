const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export interface SpringProduct {
  id: number;
  name: string;
  description: string;
  brand: string;
  price: number;
  category: string;
  releaseDate: string;
  productAvailable: boolean;
  stockQuantity: number;
  imageUrl: string; // Cloudinary URL returned directly from backend
}

export async function getSpringProducts(): Promise<SpringProduct[]> {
  const res = await fetch(`${API_BASE_URL}/api/products`);
  if (!res.ok) {
    console.error("Failed to fetch products from Spring API");
    return [];
  }
  return res.json();
}

export async function getSpringProduct(id: number): Promise<SpringProduct | null> {
  const res = await fetch(`${API_BASE_URL}/api/product/${id}`);
  if (!res.ok) return null;
  return res.json();
}


export async function searchSpringProducts(keyword: string): Promise<SpringProduct[]> {
  const res = await fetch(`${API_BASE_URL}/api/products/search?keyword=${encodeURIComponent(keyword)}`);
  if (!res.ok) return [];
  return res.json();
}

export async function addSpringProduct(productData: SpringProduct, imageFile: File): Promise<SpringProduct | null> {
  const formData = new FormData();

  // Spring @RequestPart expects the "product" part to be JSON with valid content-type
  const productBlob = new Blob([JSON.stringify(productData)], { type: 'application/json' });
  formData.append('product', productBlob);
  formData.append('imageFile', imageFile);

  const res = await fetch(`${API_BASE_URL}/api/product`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    console.error("Failed to add product", await res.text());
    return null;
  }
  return res.json();
}

export async function updateSpringProduct(id: number, productData: SpringProduct, imageFile: File): Promise<string | null> {
  const formData = new FormData();

  const productBlob = new Blob([JSON.stringify(productData)], { type: 'application/json' });
  formData.append('product', productBlob);
  formData.append('imageFile', imageFile);

  const res = await fetch(`${API_BASE_URL}/api/product/${id}`, {
    method: 'PUT',
    body: formData,
  });

  if (!res.ok) {
    console.error("Failed to update product", await res.text());
    return null;
  }
  return res.text();
}

export async function deleteSpringProduct(id: number): Promise<string | null> {
  const res = await fetch(`${API_BASE_URL}/api/product/${id}`, {
    method: 'DELETE',
  });

  if (!res.ok) {
    console.error("Failed to delete product", await res.text());
    return null;
  }
  return res.text();
}
