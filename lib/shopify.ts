import {
  getSpringProducts,
  getSpringProduct,
  getSpringProductImageUrl,
  type SpringProduct,
} from "./spring-client"

// Keep existing interfaces to avoid breaking UI components
export interface ShopifyProduct {
  id: string
  title: string
  description: string
  handle: string
  images: {
    edges: Array<{
      node: {
        url: string
        altText: string
      }
    }>
  }
  priceRange: {
    minVariantPrice: {
      amount: string
      currencyCode: string
    }
  }
  compareAtPriceRange: {
    minVariantPrice: {
      amount: string
      currencyCode: string
    }
  }
  variants: {
    edges: Array<{
      node: {
        id: string
        title: string
        price: {
          amount: string
          currencyCode: string
        }
        availableForSale: boolean
      }
    }>
  }
}

export interface ShopifyCollection {
  id: string
  title: string
  handle: string
  description: string
  image?: {
    url: string
    altText: string
  }
}

export interface ShopifyCartLine {
  id: string
  quantity: number
  merchandise: {
    id: string
    title: string
    price: {
      amount: string
      currencyCode: string
    }
    product: {
      title: string
      handle: string
      images: {
        edges: Array<{
          node: {
            url: string
            altText: string
          }
        }>
      }
    }
  }
}

export interface ShopifyCart {
  id: string
  lines: {
    edges: Array<{ node: ShopifyCartLine }>
  }
  cost: {
    totalAmount: {
      amount: string
      currencyCode: string
    }
    subtotalAmount: {
      amount: string
      currencyCode: string
    }
    totalTaxAmount: {
      amount: string
      currencyCode: string
    }
  }
  checkoutUrl: string
}

// Mapper function: SpringProduct -> ShopifyProduct
function mapSpringToShopify(product: SpringProduct): ShopifyProduct {
  const price = product.price.toString()
  const imageUrl = product.imageName ? getSpringProductImageUrl(product.id) : "/placeholder.svg"

  return {
    id: product.id.toString(),
    title: product.name,
    description: product.description,
    handle: product.id.toString(), // Using ID as handle for simplicity
    images: {
      edges: [
        {
          node: {
            url: imageUrl,
            altText: product.name,
          },
        },
      ],
    },
    priceRange: {
      minVariantPrice: {
        amount: price,
        currencyCode: "USD",
      },
    },
    compareAtPriceRange: {
      minVariantPrice: {
        amount: price, // No separate list price in Spring spec yet
        currencyCode: "USD",
      },
    },
    variants: {
      edges: [
        {
          node: {
            id: product.id.toString(),
            title: "Default Variant",
            price: {
              amount: price,
              currencyCode: "USD",
            },
            availableForSale: product.productAvailable,
          },
        },
      ],
    },
  }
}

// --- Data Fetching (Server & Client) ---

export async function getProducts(first = 20): Promise<ShopifyProduct[]> {
  try {
    const springProducts = await getSpringProducts()
    return springProducts.map(mapSpringToShopify)
  } catch (error) {
    console.error("Error fetching products:", error)
    return []
  }
}

export async function getProduct(handle: string): Promise<ShopifyProduct | null> {
  try {
    const id = parseInt(handle)
    if (isNaN(id)) return null
    const springProduct = await getSpringProduct(id)
    return springProduct ? mapSpringToShopify(springProduct) : null
  } catch (error) {
    console.error("Error fetching product:", error)
    return null
  }
}

export async function getCollections(first = 10): Promise<ShopifyCollection[]> {
  // Mock collections for now as Spring API doesn't support them explicitly yet
  return [
    {
      id: "1",
      title: "All Products",
      handle: "all",
      description: "Everything we have",
      image: { url: "/placeholder.svg", altText: "All Products" },
    },
  ]
}

// --- Local Cart Implementation (Client Only) ---

const LOCAL_CART_KEY = "mock_shopify_cart"

function getLocalCart(): ShopifyCart {
  if (typeof window === "undefined") {
    return createEmptyCart("server-mock")
  }
  const stored = localStorage.getItem(LOCAL_CART_KEY)
  if (stored) {
    return JSON.parse(stored)
  }
  const newCart = createEmptyCart(`cart-${Date.now()}`)
  saveLocalCart(newCart)
  return newCart
}

function saveLocalCart(cart: ShopifyCart) {
  if (typeof window !== "undefined") {
    localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(cart))
  }
}

function createEmptyCart(id: string): ShopifyCart {
  return {
    id,
    lines: { edges: [] },
    cost: {
      totalAmount: { amount: "0.00", currencyCode: "USD" },
      subtotalAmount: { amount: "0.00", currencyCode: "USD" },
      totalTaxAmount: { amount: "0.00", currencyCode: "USD" },
    },
    checkoutUrl: "/checkout",
  }
}

function recalculateCartTotals(cart: ShopifyCart): ShopifyCart {
  let total = 0
  cart.lines.edges.forEach(({ node }) => {
    const price = parseFloat(node.merchandise.price.amount)
    total += price * node.quantity
  })
  
  const totalStr = total.toFixed(2)
  cart.cost.totalAmount.amount = totalStr
  cart.cost.subtotalAmount.amount = totalStr
  
  return cart
}

export async function createCart(): Promise<ShopifyCart> {
  // Reset or return existing? The context calls this if no ID is found.
  // We'll just return the current local cart or create new one.
  return getLocalCart()
}

export async function getCart(cartId: string): Promise<ShopifyCart | null> {
  return getLocalCart()
}

export async function addCartLines(
  cartId: string,
  lines: Array<{ merchandiseId: string; quantity: number }>,
): Promise<ShopifyCart> {
  const cart = getLocalCart()
  
  for (const line of lines) {
    // We need product details to add to cart. In a real backend, ID is enough.
    // Here, we have to fetch the product "optimistically" or "server-side" style.
    // Since this is client-side, we can fetch from Spring API.
    const id = parseInt(line.merchandiseId)
    const product = await getSpringProduct(id)
    
    if (!product) continue

    const mapped = mapSpringToShopify(product)
    const variant = mapped.variants.edges[0].node
    const image = mapped.images.edges[0]?.node.url

    // Check if item exists
    const existingLine = cart.lines.edges.find(
      (edge) => edge.node.merchandise.id === line.merchandiseId
    )

    if (existingLine) {
      existingLine.node.quantity += line.quantity
    } else {
      cart.lines.edges.push({
        node: {
          id: `line-${Date.now()}-${Math.random()}`,
          quantity: line.quantity,
          merchandise: {
            id: line.merchandiseId,
            title: variant.title,
            price: variant.price,
            product: {
              title: product.name,
              handle: mapped.handle,
              images: {
                edges: [{ node: { url: image, altText: product.name } }],
              },
            },
          },
        },
      })
    }
  }

  const updatedCart = recalculateCartTotals(cart)
  saveLocalCart(updatedCart)
  return updatedCart
}

export async function updateCartLines(
  cartId: string,
  lines: Array<{ id: string; quantity: number }>,
): Promise<ShopifyCart> {
  const cart = getLocalCart()
  
  for (const line of lines) {
    const existingLine = cart.lines.edges.find((edge) => edge.node.id === line.id)
    if (existingLine) {
      existingLine.node.quantity = line.quantity
    }
  }
  
  // Remove 0 quantity
  cart.lines.edges = cart.lines.edges.filter((edge) => edge.node.quantity > 0)

  const updatedCart = recalculateCartTotals(cart)
  saveLocalCart(updatedCart)
  return updatedCart
}

export async function removeCartLines(cartId: string, lineIds: string[]): Promise<ShopifyCart> {
  const cart = getLocalCart()
  
  cart.lines.edges = cart.lines.edges.filter((edge) => !lineIds.includes(edge.node.id))
  
  const updatedCart = recalculateCartTotals(cart)
  saveLocalCart(updatedCart)
  return updatedCart
}
