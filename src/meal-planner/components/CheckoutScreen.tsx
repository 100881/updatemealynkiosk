import { useState } from "react"
import { useCart } from "../context/CartContext"

interface Props {
  onComplete?: () => void
}

export default function CheckoutScreen({ onComplete }: Props) {
  const { cart, clearCart } = useCart()
  const [name, setName] = useState("")
  const [address, setAddress] = useState("")
  const [confirmed, setConfirmed] = useState(false)

  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const handleConfirm = () => {
    if (!name || !address) {
      alert("Vul alstublieft naam en adres in")
      return
    }
    setConfirmed(true)
    clearCart()
    if (onComplete) onComplete()
  }

  if (confirmed) {
    return (
      <div style={{ padding: 20 }}>
        <h2>Bedankt voor je bestelling, {name}!</h2>
        <p>De bestelling wordt geleverd op {address}.</p>
      </div>
    )
  }

  return (
    <div style={{ padding: 20, fontFamily: "sans-serif" }}>
      <h2>Checkout</h2>

      {cart.length === 0 ? (
        <p>Je winkelmandje is leeg</p>
      ) : (
        <>
          <div>
            {cart.map((item) => (
              <div
                key={item.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  marginBottom: 12,
                  borderBottom: "1px solid #eee",
                  paddingBottom: 8,
                }}
              >
                <img
                  src={item.image}
                  alt={item.name}
                  style={{ width: 50, height: 50, objectFit: "cover", borderRadius: 6 }}
                />
                <div style={{ flexGrow: 1 }}>
                  <p style={{ margin: 0 }}>{item.name}</p>
                  <span>{item.quantity} × €{item.price.toFixed(2)}</span>
                </div>
                <span>€{(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <h3>Totaal: €{totalPrice.toFixed(2)}</h3>

          <div style={{ marginTop: 20 }}>
            <label>
              Naam:
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ marginLeft: 8 }}
              />
            </label>
          </div>
          <div style={{ marginTop: 12 }}>
            <label>
              Adres:
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                style={{ marginLeft: 8 }}
              />
            </label>
          </div>

          <button onClick={handleConfirm} style={{ marginTop: 20 }}>
            Bestelling bevestigen
          </button>
        </>
      )}
    </div>
  )
}