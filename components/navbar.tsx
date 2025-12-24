"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, ShoppingCart, User, Menu } from "lucide-react"
import { useState } from "react"
import { useCart } from "@/context/cart-context"
import { getStoreName } from "@/lib/store-name"
import { ModeToggle } from "@/components/mode-toggle"

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { state, dispatch } = useCart()

  // Get dynamic store name
  const storeName = getStoreName()

  // Function to scroll to categories section
  const scrollToCategories = () => {
    const categoriesSection = document.getElementById("categories-section")
    if (categoriesSection) {
      categoriesSection.scrollIntoView({ behavior: "smooth" })
    }
    setIsMenuOpen(false) // Close mobile menu if open
  }

  return (
    <nav className="bg-background border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo - now uses dynamic store name */}
          <div className="flex items-center">
            <a href="/" className="text-2xl font-bold text-foreground hover:text-muted-foreground transition-colors">
              {storeName}
            </a>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="/" className="text-foreground hover:text-foreground/70 font-medium transition-colors">
              Home
            </a>
            <a href="/products" className="text-foreground hover:text-foreground/70 font-medium transition-colors">
              Products
            </a>
            {/* Updated Categories link to scroll to section */}
            <button
              onClick={scrollToCategories}
              className="text-foreground hover:text-foreground/70 font-medium transition-colors"
            >
              Categories
            </button>
          </div>

          {/* Search Bar */}
          <div className="hidden lg:flex items-center flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search products..."
                className="pl-10 pr-4 py-2 w-full border-input focus:border-primary"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            <ModeToggle />
            <Button variant="ghost" size="sm" className="relative" onClick={() => dispatch({ type: "TOGGLE_CART" })}>
              <ShoppingCart className="w-5 h-5" />
              {state.itemCount > 0 && (
                <Badge className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded-full min-w-[20px] h-5 flex items-center justify-center">
                  {state.itemCount}
                </Badge>
              )}
            </Button>

            <Button variant="ghost" size="sm" className="hidden md:flex">
              <User className="w-5 h-5" />
            </Button>

            {/* Mobile Menu Button */}
            <Button variant="ghost" size="sm" className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-border py-4">
            <div className="flex flex-col space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input type="search" placeholder="Search products..." className="pl-10 pr-4 py-2 w-full" />
              </div>
              <a
                href="/"
                className="text-foreground hover:text-foreground/70 font-medium py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </a>
              <a
                href="/products"
                className="text-foreground hover:text-foreground/70 font-medium py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Products
              </a>
              {/* Updated mobile Categories link */}
              <button
                onClick={scrollToCategories}
                className="text-foreground hover:text-foreground/70 font-medium py-2 text-left"
              >
                Categories
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
