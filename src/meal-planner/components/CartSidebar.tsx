import { useCart } from "../context/CartContext"
import { useState } from "react"

interface Props {
  mealType?: string
}

export default function CartSidebar({ mealType }: Props) {
  const { cart, removeItem } = useCart()

  // Filter: bij Avondeten alleen ingrediënten van geselecteerde recepten
  const displayedItems =
    mealType === "Avondeten" ? cart.filter((i) => i.id.includes("-")) : cart

  const total = displayedItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <div style={{ padding: 12, border: "1px solid #ccc", borderRadius: 8, background: "#f9f5e7" }}>
      <h2>Winkelmandje</h2>
      {displayedItems.length === 0 ? (
        <p>Je winkelmandje is leeg.</p>
      ) : (
        displayedItems.map((item) => (
          <div
            key={item.id}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 8,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <img
                src={item.image}
                alt={item.name}
                style={{ width: 40, height: 40, objectFit: "cover", borderRadius: 4 }}
              />
              <span>{item.name}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span>€{(item.price * item.quantity).toFixed(2)}</span>
              <button onClick={() => removeItem(item.id)} style={{ color: "red" }}>
                ❌
              </button>
            </div>
          </div>
        ))
      )}
      <hr />
      <h3>Totaal: €{total.toFixed(2)}</h3>
    </div>
  )
}