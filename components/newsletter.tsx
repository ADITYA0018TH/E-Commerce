import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Mail } from "lucide-react"

export function Newsletter() {
  return (
    <section className="py-20 bg-muted">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-primary/10 rounded-full p-4">
              <Mail className="w-12 h-12 text-primary" />
            </div>
          </div>

          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Get Exclusive Deals</h2>

          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Subscribe to our newsletter and get 20% off your first order plus early access to sales and new arrivals
          </p>

          <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <div className="relative flex-1">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="email"
                name="email"
                placeholder="Enter your email"
                className="pl-10 py-6 text-lg bg-background text-foreground border border-border"
                required
              />
            </div>
            <Button
              type="submit"
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-6 text-lg font-semibold"
            >
              Subscribe
            </Button>
          </form>

          <p className="text-muted-foreground text-sm mt-4">No spam, unsubscribe at any time</p>
        </div>
      </div>
    </section>
  )
}
