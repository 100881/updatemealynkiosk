type Props = {
  onStart: () => void
  onAITest: () => void
}

export default function WelcomeScreen({ onStart, onAITest }: Props) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        gap: "20px",
        fontFamily: "Arial",
      }}
    >
      <h1 style={{ fontSize: "48px" }}>Welcome to Mealyn</h1>

      <button
        onClick={onStart}
        style={{ fontSize: "28px", padding: "20px 60px", cursor: "pointer" }}
      >
        Start Planning
      </button>

      <button
        onClick={onAITest}
        style={{ fontSize: "20px", padding: "15px 40px", cursor: "pointer" }}
      >
        AI Test Kiosk
      </button>
    </div>
  )
}