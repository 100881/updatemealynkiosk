import React from "react"
import { useCart } from "../context/CartContext"

interface Props {
  onBack?: () => void
}

export default function CheckoutScreen({ onBack }: Props) {
  const { cart } = useCart()

  const handlePrint = () => {
    const total = cart.reduce((sum, i) => sum + i.price * i.quantity, 0)

    const printWindow = window.open("", "_blank", "width=300,height=600")
    if (!printWindow) return

    printWindow.document.write(`
      <html>
        <head>
          <title>Boodschappenlijst</title>
          <style>
            @page {
              margin: 0;
              size: 80mm auto;
            }
            body {
              font-family: monospace;
              font-size: 12px;
              width: 72mm;
              margin: 4mm;
              padding: 0;
            }
            h2 {
              font-size: 14px;
              text-align: center;
              margin-bottom: 8px;
              border-bottom: 1px dashed #000;
              padding-bottom: 6px;
            }
            ul {
              list-style: none;
              padding: 0;
              margin: 0;
            }
            li {
              display: flex;
              justify-content: space-between;
              padding: 3px 0;
              border-bottom: 1px dashed #ccc;
            }
            .total {
              font-weight: bold;
              margin-top: 8px;
              text-align: right;
              font-size: 13px;
              border-top: 1px solid #000;
              padding-top: 6px;
            }
            .footer {
              text-align: center;
              margin-top: 12px;
              font-size: 10px;
              color: #666;
            }
          </style>
        </head>
        <body>
          <h2>Mealyn Boodschappenlijst</h2>
          <ul>
            ${cart.map((item) => `
              <li>
                <span>${item.name}</span>
                <span>€${(item.price * item.quantity).toFixed(2)}</span>
              </li>
            `).join("")}
          </ul>
          <div class="total">Totaal: €${total.toFixed(2)}</div>
          <div class="footer">Gegenereerd door Mealyn</div>
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.focus()
    printWindow.print()
    printWindow.close()
  }

  const handleEmail = () => {
    const total = cart.reduce((sum, i) => sum + i.price * i.quantity, 0)
    const body = cart
      .map((item) => `${item.name} - €${(item.price * item.quantity).toFixed(2)}`)
      .join("%0A")
    const footer = `%0A%0ATotaal: €${total.toFixed(2)}`
    window.location.href = `mailto:?subject=Mijn boodschappenlijst&body=${body}${footer}`
  }

  return (
    <div style={{
      maxWidth: 480, margin: "0 auto", padding: "2rem 1.5rem",
      display: "flex", flexDirection: "column", alignItems: "center",
      fontFamily: "sans-serif", minHeight: "100vh",
    }}>
      <div style={{ width: "100%", display: "flex", justifyContent: "flex-end", marginBottom: "2rem" }}>
        <img src="/mealyn/assets/mealynlogo.png" alt="Mealyn" style={{ height: 36 }} />
      </div>

      <h2 style={{
        fontSize: 22, fontWeight: 700, textAlign: "center",
        lineHeight: 1.4, margin: "0 0 2.5rem", color: "#1a1a1a",
      }}>
        Print je boodschappenlijst<br />direct uit of e-mail hem<br />naar jezelf.
      </h2>

      <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 14, maxWidth: 300 }}>
        <button onClick={handlePrint} style={btnStyle}>
          <PrintIcon /> Printen
        </button>
        <button onClick={handleEmail} style={btnStyle}>
          <MailIcon /> E-mailen
        </button>
      </div>

      {onBack && (
        <button
          onClick={onBack}
          style={{
            marginTop: 32, background: "none", border: "none",
            color: "#2D6A4F", fontSize: "0.9rem", cursor: "pointer",
            textDecoration: "underline",
          }}
        >
          ← Terug
        </button>
      )}
    </div>
  )
}

const btnStyle: React.CSSProperties = {
  display: "flex", alignItems: "center", justifyContent: "center",
  gap: 10, padding: "16px", borderRadius: 12,
  background: "#f5f5f5", border: "1px solid #ddd",
  fontSize: 16, fontWeight: 600, color: "#1a1a1a",
  cursor: "pointer", width: "100%",
}

function PrintIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 6 2 18 2 18 9"/>
      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
      <rect x="6" y="14" width="12" height="8"/>
    </svg>
  )
}

function MailIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2"/>
      <polyline points="2,4 12,13 22,4"/>
    </svg>
  )
}