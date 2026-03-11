type Props = {
  onStart: () => void
}

export default function WelcomeScreen({ onStart }: Props) {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
      fontFamily: "Arial"
    }}>
      <h1 style={{ fontSize: "48px", marginBottom: "40px" }}>
        Welcome to Mealyn
      </h1>

      <button
        onClick={onStart}
        style={{
          fontSize: "28px",
          padding: "20px 60px",
          cursor: "pointer"
        }}
      >
        Start Planning
      </button>
    </div>
  )
}