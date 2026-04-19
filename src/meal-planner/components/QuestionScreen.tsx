import React, { useState } from "react"
import questionsData from "../data/questions.json"
import type { Answers } from "../utils/matchRecipes"
import logo from "/assets/mealynlogo.png"

interface Question {
  id: number
  question: string
  type: "choice"
  options: string[]
  placeholder?: string
}

interface Props {
  onComplete: (answers: Answers) => void
}

const questions = questionsData as unknown as Question[]

const answerKeys: (keyof Answers)[] = [
  "persons",
  "days",
  "allergy",
  "diet",
  "goal",
  "budget",
  "mealType",
]

const MEAL_IMAGES: Record<string, string> = {
  Avondeten: "/mealyn/assets/avondeten.png",
  Lunch: "/mealyn/assets/lunch.png",
  Ontbijt: "/mealyn/assets/ontbijt.png",
  Snacks: "/mealyn/assets/snacks.png",
}

const FALLBACK_IMAGE = "/testimg.jpg"
const handleImgError = (e: React.SyntheticEvent<HTMLImageElement>) => {
  const target = e.currentTarget
  if (target.src !== window.location.origin + FALLBACK_IMAGE) target.src = FALLBACK_IMAGE
}

export default function QuestionScreen({ onComplete }: Props) {
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState<Partial<Answers>>({
    allergy: [],
    diet: [],
    goal: [],
  })
  const [multi, setMulti] = useState<string[]>([])
  const [singleSelected, setSingleSelected] = useState<string | null>(null)
  const [showPinpad, setShowPinpad] = useState(false)
  const [pinValue, setPinValue] = useState("")

  const key = answerKeys[index]
  const isMulti = ["allergy", "diet", "goal"].includes(key)
  const isMealType = key === "mealType"
  const isVertical = key === "budget"
  const question = questions[index]

  const handlePinPress = (digit: string) => {
    if (digit === "←") {
      const updated = pinValue.slice(0, -1)
      setPinValue(updated)
      setAnswers(prev => ({ ...prev, budget: updated }))
      return
    }
    if (pinValue.length >= 5) return
    const updated = pinValue + digit
    setPinValue(updated)
    setAnswers(prev => ({ ...prev, budget: updated }))
  }

  const handleChoice = (option: string) => {
    if (key === "budget" && option === "Eigen bedrag invoeren...") {
      setShowPinpad(true)
      setSingleSelected(option)
      setPinValue("")
      setAnswers(prev => ({ ...prev, budget: "" }))
      return
    }

    if (key === "budget") {
      setShowPinpad(false)
      setPinValue("")
      const numericValue = option.replace(/[^0-9]/g, "")
      setSingleSelected(option)
      setAnswers(prev => ({ ...prev, budget: numericValue }))
      return
    }

    if (isMulti || isMealType) {
      if (option.startsWith("Geen")) {
        setMulti([option])
        setAnswers(prev => ({ ...prev, [key]: [option] }))
        return
      }
      const updatedMulti = multi.includes(option)
        ? multi.filter((o) => o !== option)
        : [...multi, option]
      setMulti(updatedMulti)
      setAnswers(prev => ({ ...prev, [key]: updatedMulti }))
      return
    }

    setSingleSelected(option)
    setAnswers(prev => ({ ...prev, [key]: option }))
  }

  const nextQuestion = () => {
    const finalAnswers: Partial<Answers> = {
      ...answers,
      [key]: isMulti || isMealType
        ? multi
        : key === "budget"
        ? (showPinpad ? pinValue : answers.budget ?? "")
        : singleSelected,
    }

    setMulti([])
    setSingleSelected(null)
    setShowPinpad(false)
    setPinValue("")

    if (index === questions.length - 1) {
      onComplete(finalAnswers as Answers)
    } else {
      setAnswers(finalAnswers)
      setIndex(index + 1)
    }
  }

  const goBack = () => {
    if (index === 0) return
    setMulti([])
    setSingleSelected(null)
    setShowPinpad(false)
    setPinValue("")
    setIndex(index - 1)
  }

  const canProceed = isMulti || isMealType
    ? multi.length > 0
    : key === "budget" && showPinpad
    ? pinValue.length > 0
    : singleSelected !== null

  const baseCardStyle: React.CSSProperties = {
    padding: "18px 20px",
    background: "white",
    border: "2px solid #d1e8dc",
    borderRadius: 18,
    color: "#1A1A18",
    fontWeight: 600,
    fontSize: "1.2rem",
    cursor: "pointer",
    textAlign: "left",
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 14,
    minHeight: 62,
    transition: "border-color 0.15s, background 0.15s",
    width: "100%",
  }

  const selectedCardStyle: React.CSSProperties = {
    ...baseCardStyle,
    background: "#2D6A4F",
    border: "2px solid #2D6A4F",
    color: "white",
  }

  const dotBase: React.CSSProperties = {
    width: 26,
    height: 26,
    borderRadius: "50%",
    border: "2px solid #b7d9c8",
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 14,
  }

  const dotSelected: React.CSSProperties = {
    ...dotBase,
    background: "rgba(255,255,255,0.25)",
    border: "2px solid rgba(255,255,255,0.5)",
    color: "white",
  }

  return (
    <div style={{ padding: 28, fontFamily: "sans-serif", maxWidth: 600, margin: "0 auto" }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
        <span style={{
          fontSize: "0.95rem",
          color: "white",
          fontWeight: 700,
          backgroundColor: "#2D6A4F",
          padding: "5px 12px",
          borderRadius: 6,
        }}>
          Vraag {index + 1} van {questions.length}
        </span>
        <img src={logo} alt="Mealyn" style={{ height: 64 }} />
      </div>

      {/* Vraag */}
      <h2 style={{ marginBottom: isMealType ? 8 : 28, fontSize: "1.6rem", fontWeight: 700, color: "#1A1A18", lineHeight: 1.3 }}>
        {question.question}
      </h2>

      {isMealType && (
        <p style={{ marginTop: 0, marginBottom: 20, fontSize: "1rem", color: "#666" }}>
          Je kunt meerdere opties selecteren.
        </p>
      )}

      {/* Pinpad */}
      {showPinpad ? (
        <div>
          <div style={{
            textAlign: "center",
            fontSize: "3rem",
            fontWeight: 700,
            color: "#1B4332",
            marginBottom: 32,
            letterSpacing: 3,
            minHeight: 64,
          }}>
            {pinValue ? `€ ${pinValue},-` : "€ ..."}
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 14,
            maxWidth: 360,
            margin: "0 auto 20px",
          }}>
            {["1","2","3","4","5","6","7","8","9","","0","←"].map((d, i) => (
              <button
                key={i}
                onClick={() => d !== "" && handlePinPress(d)}
                disabled={d === ""}
                style={{
                  padding: "22px 0",
                  fontSize: "1.6rem",
                  fontWeight: 700,
                  borderRadius: 16,
                  border: d === "←" ? "2px solid #e53e3e" : "2px solid #1B4332",
                  backgroundColor: d === "" ? "transparent" : d === "←" ? "#fff0f0" : "white",
                  color: d === "←" ? "#e53e3e" : "#1B4332",
                  cursor: d === "" ? "default" : "pointer",
                }}
              >
                {d}
              </button>
            ))}
          </div>

          <div style={{ textAlign: "center" }}>
            <button
              onClick={() => { setShowPinpad(false); setSingleSelected(null); setPinValue("") }}
              style={{
                background: "none", border: "none",
                color: "#2D6A4F", fontSize: "1rem",
                cursor: "pointer", textDecoration: "underline",
              }}
            >
              ← Terug naar opties
            </button>
          </div>
        </div>

      ) : isMealType ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {question.options.map((opt) => {
            const isSelected = multi.includes(opt)
            return (
              <div
                key={opt}
                onClick={() => handleChoice(opt)}
                style={{
                  position: "relative",
                  borderRadius: 16,
                  overflow: "hidden",
                  cursor: "pointer",
                  border: isSelected ? "3px solid #2D6A4F" : "3px solid transparent",
                  height: 135,
                }}
              >
                <img
                  src={MEAL_IMAGES[opt] || FALLBACK_IMAGE}
                  alt={opt}
                  onError={handleImgError}
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                />
                <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.25)" }} />
                <div style={{
                  position: "absolute", top: 12, left: 12,
                  width: 26, height: 26, borderRadius: 6,
                  border: "2px solid white",
                  backgroundColor: isSelected ? "#2D6A4F" : "rgba(255,255,255,0.3)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {isSelected && (
                    <span style={{ color: "white", fontSize: 15, lineHeight: 1, fontWeight: 700 }}>✓</span>
                  )}
                </div>
                <div style={{
                  position: "absolute", inset: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <span style={{
                    backgroundColor: "rgba(255,255,255,0.88)", color: "#1A1A18",
                    fontWeight: 700, fontSize: "1.2rem", padding: "7px 22px", borderRadius: 24,
                  }}>
                    {opt}
                  </span>
                </div>
              </div>
            )
          })}
        </div>

      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: 12,
        }}>
          {question.options.map((opt) => {
            const isSelected = isMulti ? multi.includes(opt) : singleSelected === opt
            return (
              <button
                key={opt}
                onClick={() => handleChoice(opt)}
                style={isSelected ? selectedCardStyle : baseCardStyle}
              >
                {(isVertical || isMulti) && (
                  <span style={isSelected ? dotSelected : dotBase}>
                    {isSelected ? "✓" : ""}
                  </span>
                )}
                {opt}
              </button>
            )
          })}
        </div>
      )}

      {/* Navigatie knoppen */}
      {!showPinpad && (
        <div style={{ display: "flex", gap: 14, marginTop: 32 }}>
          <button
            onClick={goBack}
            disabled={index === 0}
            style={{
              flex: 1, padding: "18px",
              border: "none", borderRadius: 16,
              backgroundColor: index === 0 ? "#ccc" : "#2D6A4F",
              color: "white", fontWeight: 700, fontSize: "1.2rem",
              cursor: index === 0 ? "not-allowed" : "pointer",
            }}
          >
            ← Terug
          </button>
          <button
            onClick={nextQuestion}
            disabled={!canProceed}
            style={{
              flex: 1, padding: "18px",
              border: "none", borderRadius: 16,
              backgroundColor: !canProceed ? "#ccc" : "#2D6A4F",
              color: "white", fontWeight: 700, fontSize: "1.2rem",
              cursor: !canProceed ? "not-allowed" : "pointer",
            }}
          >
            Ga verder →
          </button>
        </div>
      )}

      {showPinpad && (
        <div style={{ marginTop: 32 }}>
          <button
            onClick={nextQuestion}
            disabled={!canProceed}
            style={{
              width: "100%", padding: "18px",
              border: "none", borderRadius: 16,
              backgroundColor: !canProceed ? "#ccc" : "#2D6A4F",
              color: "white", fontWeight: 700, fontSize: "1.2rem",
              cursor: !canProceed ? "not-allowed" : "pointer",
            }}
          >
            Ga verder →
          </button>
        </div>
      )}
    </div>
  )
}