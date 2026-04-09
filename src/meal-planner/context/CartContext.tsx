import { createContext, useContext, useState } from "react"
import type { ReactNode } from "react"

export interface CartItem {
  id: string
  name: string
  price: number
  image: string
  quantity: number
}

interface CartContextType {
  cart: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (id: string) => void
  clearCart: () => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([])

  const addItem = (item: CartItem) => {
    setCart((prev) => {
      const exists = prev.find((i) => i.id === item.id)
      if (exists) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i
        )
      }
      return [...prev, item]
    })
  }

  const removeItem = (id: string) => {
    setCart((prev) => prev.filter((i) => i.id !== id))
  }

  const clearCart = () => setCart([])

  return (
    <CartContext.Provider value={{ cart, addItem, removeItem, clearCart }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error("useCart must be used within CartProvider")
  return context
}