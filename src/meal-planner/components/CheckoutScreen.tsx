import React, { useEffect } from "react"
import { useCart } from "../context/CartContext"

interface Props {
  onBack?: () => void
}

declare global {
  interface Window {
    qz: any
  }
}

export default function CheckoutScreen({ onBack }: Props) {
  const { cart } = useCart()

  useEffect(() => {
    const script = document.createElement("script")
    script.src = "/mealyn/qz-tray.js"
    script.async = true
    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
    }
  }, [])

  const handlePrint = async () => {
    try {
      const qz = window.qz

      if (!qz.websocket.isActive()) {
        await qz.websocket.connect()
      }

      const total = cart.reduce((sum, i) => sum + i.price * i.quantity, 0)

      const config = qz.configs.create("EPSON TM-T20III Receipt")

      const ESC = "\x1B"
      const GS = "\x1D"

      const WIDTH = 42
      const LINE = "-".repeat(WIDTH) + "\n"

      const euro = (n: number) => "\xD5" + n.toFixed(2)

      const line = (left: string, right: string) => {
        const maxLeft = WIDTH - right.length
        const name = left.length > maxLeft ? left.slice(0, maxLeft) : left
        const spaces = " ".repeat(WIDTH - name.length - right.length)
        return name + spaces + right + "\n"
      }

      const data = [
        ESC + "@",
        ESC + "t\x13",

        ESC + "a\x01",
        ESC + "E\x01",
        ESC + "!\x11",
        "MEALYN\n",

        ESC + "!\x00",
        ESC + "E\x00",
        "Boodschappenlijst\n",

        LINE,

        ESC + "a\x00",

        ...cart.map((item) =>
          line(item.name, euro(item.price * item.quantity))
        ),

        LINE,

        ESC + "E\x01",
        line("Totaal:", euro(total)),
        ESC + "E\x00",

        "\n",

        ESC + "a\x01",
        "Gegenereerd door Mealyn\n",

        "\n\n\n",

        GS + "V\x41\x00"
      ]

      await qz.print(config, data)

      // ✅ NA PRINT: altijd naar WelcomeScreen
      window.location.href = "/"

    } catch (err) {
      console.error("Printfout:", err)
      alert("Kan niet verbinden met printer. Zorg dat QZ Tray actief is.")
    }
  }

  const handleEmail = () => {
    const total = cart.reduce((sum, i) => sum + i.price * i.quantity, 0)

    const body = cart
      .map((item) => `${item.name} - €${(item.price * item.quantity).toFixed(2)}`)
      .join("%0A")

    const footer = `%0A%0ATotaal: €${total.toFixed(2)}`

    window.location.href =
      `mailto:?subject=Mijn boodschappenlijst&body=${body}${footer}`
  }

  return (
    <div style={{
      maxWidth: 480,
      margin: "0 auto",
      padding: "2rem 1.5rem",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      fontFamily: "sans-serif",
      minHeight: "100vh",
    }}>
      <div style={{
        width: "100%",
        display: "flex",
        justifyContent: "flex-end",
        marginBottom: "2rem"
      }}>
        <img src="/mealyn/assets/mealynlogo.png" alt="Mealyn" style={{ height: 36 }} />
      </div>

      <h2 style={{
        fontSize: 22,
        fontWeight: 700,
        textAlign: "center",
        lineHeight: 1.4,
        margin: "0 0 2.5rem",
        color: "#1a1a1a",
      }}>
        Print je boodschappenlijst<br />
        direct uit of e-mail hem<br />
        naar jezelf.
      </h2>

      <div style={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 14,
        maxWidth: 300
      }}>
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
            marginTop: 32,
            background: "none",
            border: "none",
            color: "#2D6A4F",
            fontSize: "0.9rem",
            cursor: "pointer",
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
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 10,
  padding: "16px",
  borderRadius: 12,
  background: "#f5f5f5",
  border: "1px solid #ddd",
  fontSize: 16,
  fontWeight: 600,
  color: "#1a1a1a",
  cursor: "pointer",
  width: "100%",
}

function PrintIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 6 2 18 2 18 9"/>
      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
      <rect x="6" y="14" width="12" height="8"/>
    </svg>
  )
}

function MailIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2"/>
      <polyline points="2,4 12,13 22,4"/>
    </svg>
  )
}