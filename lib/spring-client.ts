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
  imageName: string;
  imageType: string;
  // imageData is usually omitted in lists
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
  const res = await fetch(`${API_BASE_URL}/api/products/${id}`);
  if (!res.ok) return null;
  return res.json();
}

export function getSpringProductImageUrl(id: number): string {
  return `${API_BASE_URL}/api/product/${id}/image`;
}

export async function searchSpringProducts(keyword: string): Promise<SpringProduct[]> {
  const res = await fetch(`${API_BASE_URL}/api/search?keyword=${encodeURIComponent(keyword)}`);
  if (!res.ok) return [];
  return res.json();
}
