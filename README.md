# Modern E-Commerce Frontend

A high-performance, responsive e-commerce storefront built with [Next.js 14](https://nextjs.org/), [TypeScript](https://www.typescriptlang.org/), and [Tailwind CSS](https://tailwindcss.com/). This application is designed to decouple the frontend from a specific backend, currently configured to interface with a custom **Spring Boot Backend**.

## 🚀 Features

- **Modern Tech Stack**: Built with the Next.js App Router for optimal performance and SEO.
- **Dynamic Product Browsing**:
  - **Featured Products**: Highlighted items on the specific landing page.
  - **Product Listing**: Full catalog with search, sorting, and category filtering.
  - **Product Details**: Rich product pages with image galleries, variants, and stock status.
- **Shopping Cart**:
  - Fully functional persistence logic (client-side storage with optimistic updates).
  - Real-time totals and tax calculation simulations.
- **Backend Integration**:
  - Clean architecture using an adapter pattern (`lib/spring-client.ts`).
  - Fetches live data from a decoupled Spring Boot API.
- **Responsive Design**: Mobile-first UI components using Tailwind CSS and `lucide-react` icons.

## 🛠️ Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **State Management**: React Context (Cart)
- **Backend Communication**: Fetch API (Server & Client Components)

## 📦 Prerequisites

Before getting started, ensure you have the following installed:

- **Node.js** (v18.17.0 or higher)
- **npm** or **yarn**
- **Spring Boot Backend** (Running on port 8080)

## ⚡ Getting Started

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/yourusername/e-commerce-frontend.git
    cd e-commerce-frontend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Configure Environment Variables:**
    Create a `.env.local` file in the root directory:
    ```bash
    cp .env.example .env.local
    ```
    Add your backend URL (defaults to localhost):
    ```env
    NEXT_PUBLIC_API_URL=http://localhost:8080
    ```

4.  **Run the Development Server:**
    ```bash
    npm run dev
    ```

5.  **Open the Application:**
    Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

## 🏗️ Project Structure

```
├── app/                  # Next.js App Router pages
│   ├── layout.tsx        # Root layout with Navbar/Footer
│   ├── page.tsx          # Homepage
│   ├── products/         # Product listing page
│   └── product/[id]/     # Product details page
├── components/           # React Components
│   ├── ui/               # Reusable UI elements (Button, Card, Input)
│   ├── navbar.tsx        # Main navigation
│   └── ...               # Feature-specific components
├── context/              # Global State (CartContext)
├── hooks/                # Custom React Hooks
├── lib/                  # Utilities & API Adapters
│   ├── spring-client.ts  # Interface to Spring Boot Backend
│   └── utils.ts          # Helper functions (cn, etc.)
└── public/               # Static assets
```

## 🔌 API Integration

This project uses a dedicated client adapter to communicate with the backend.

- **Adapter:** `lib/spring-client.ts`
- **Base URL:** Defined via `NEXT_PUBLIC_API_URL`
- **Endpoints:**
  - `GET /api/products` - List all products
  - `GET /api/products/{id}` - Get single product details
  - `GET /api/search?keyword=...` - Search products

To switch backends (e.g., to Shopify), modifications should only be needed in the `lib` api adapters and the `hooks` layer, keeping the UI components untouched.

## 🤝 Contributing

1.  Fork the repository.
2.  Create a new feature branch (`git checkout -b feature/amazing-feature`).
3.  Commit your changes (`git commit -m 'Add some amazing feature'`).
4.  Push to the branch (`git push origin feature/amazing-feature`).
5.  Open a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
