import React from "react"
import { useCart } from "../context/CartContext"

interface Props {
  onBack?: () => void
  onDone?: () => void
  selectedRecipes?: string[]
}

export default function CheckoutScreen({ onBack, onDone, selectedRecipes = [] }: Props) {
  const { cart, clearCart } = useCart()

  const encodeCP858 = (text: string): number[] => {
    const bytes: number[] = []
    for (const c of text) {
      if (c === '€') {
        bytes.push(0xD5)
      } else {
        const code = c.charCodeAt(0)
        bytes.push(code > 255 ? 0x3F : code)
      }
    }
    return bytes
  }

  const handlePrint = async () => {
    try {
      const devices = await (navigator as any).usb.getDevices()
      const bekend = devices.find((d: any) => d.vendorId === 0x04b8)

      const device = bekend
        ? bekend
        : await (navigator as any).usb.requestDevice({
            filters: [{ vendorId: 0x04b8 }]
          })

      await device.open()

      if (device.configuration === null) {
        await device.selectConfiguration(1)
      }

      await device.claimInterface(0)

      const total = cart.reduce((sum, i) => sum + i.price * i.quantity, 0)

      const WIDTH = 42
      const LINE = "-".repeat(WIDTH) + "\n"

      const euro = (n: number) => `€${n.toFixed(2)}`

      const line = (left: string, right: string) => {
        const maxLeft = WIDTH - right.length
        const name = left.length > maxLeft ? left.slice(0, maxLeft) : left
        const spaces = " ".repeat(WIDTH - name.length - right.length)
        return name + spaces + right + "\n"
      }

      const receptenRegels = selectedRecipes.length > 0
        ? [
            "\n",
            LINE,
            "\x1Ba\x01",
            "\x1BE\x01",
            "Bijbehorende recepten:\n",
            "\x1BE\x00",
            "\x1Ba\x00",
            ...selectedRecipes.map((naam) => `- ${naam}\n`),
          ]
        : []

      const tekstRegels = [
        "\x1B@",
        "\x1Bt\x13",
        "\x1Ba\x01",
        "\x1BE\x01",
        "\x1B!\x11",
        "MEALYN\n",
        "\x1B!\x00",
        "\x1BE\x00",
        "Boodschappenlijst\n",
        LINE,
        "\x1Ba\x00",
        ...cart.map((item) =>
          item.quantity > 1
            ? line(`${item.quantity}x ${item.name}`, euro(item.price * item.quantity))
            : line(item.name, euro(item.price * item.quantity))
        ),
        LINE,
        "\x1BE\x01",
        line("Totaal:", euro(total)),
        "\x1BE\x00",
        ...receptenRegels,
        "\n",
        "\x1Ba\x01",
        "Gegenereerd door Mealyn\n",
        "\n\n\n",
        "\x1DVA\x00"
      ].join("")

      const data = new Uint8Array(encodeCP858(tekstRegels))

      await device.transferOut(1, data)
      await device.close()

      clearCart()
      onDone?.()

    } catch (err) {
      console.error("Printfout:", err)
      alert("Kan niet verbinden met printer. Controleer de USB verbinding.")
    }
  }

  const handleEmail = () => {
    const total = cart.reduce((sum, i) => sum + i.price * i.quantity, 0)

    const body = cart
      .map((item) => `${item.quantity > 1 ? `${item.quantity}x ` : ""}${item.name} - €${(item.price * item.quantity).toFixed(2)}`)
      .join("%0A")

    const recepten = selectedRecipes.length > 0
      ? `%0A%0ABijbehorende recepten:%0A${selectedRecipes.map((r) => `- ${r}`).join("%0A")}`
      : ""

    const footer = `%0A%0ATotaal: €${total.toFixed(2)}${recepten}`

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
      backgroundColor: "#ffffff",
    }}>

      <div style={{
        width: "100%",
        display: "flex",
        justifyContent: "flex-end",
        marginBottom: "3rem",
      }}>
        <img src="/mealyn/assets/mealynlogo.png" alt="Mealyn" style={{ height: 75 }} />
      </div>

      <p style={{
        fontSize: 22,
        fontWeight: 600,
        textAlign: "center",
        lineHeight: 1.6,
        margin: "0 0 3rem",
        color: "#1A1A18",
      }}>
        Print je boodschappenlijst<br />
        direct uit of e-mail hem<br />
        naar jezelf.
      </p>

      <div style={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 16,
        maxWidth: 360,
      }}>
        <button onClick={handlePrint} style={btnStyle}>
          <PrintIcon /> Printen
        </button>

        <button onClick={handleEmail} style={btnStyle}>
          <MailIcon /> E-mailen
        </button>
      </div>

      {onBack && (
        <div style={{ width: "100%", maxWidth: 360, marginTop: 24 }}>
          <button
            onClick={onBack}
            style={{
              width: "100%",
              padding: "18px",
              border: "none",
              borderRadius: 14,
              backgroundColor: "#2D6A4F",
              color: "white",
              fontWeight: 700,
              fontSize: "1.3rem",
              cursor: "pointer",
            }}
          >
            ← Terug
          </button>
        </div>
      )}
    </div>
  )
}

const btnStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 12,
  padding: "22px",
  borderRadius: 14,
  background: "#ffffff",
  border: "1px solid #e0e0e0",
  fontSize: 20,
  fontWeight: 600,
  color: "#1a1a1a",
  cursor: "pointer",
  width: "100%",
}

function PrintIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke="#2D6A4F" strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 6 2 18 2 18 9"/>
      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
      <rect x="6" y="14" width="12" height="8"/>
    </svg>
  )
}

function MailIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke="#2D6A4F" strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2"/>
      <polyline points="2,4 12,13 22,4"/>
    </svg>
  )
}