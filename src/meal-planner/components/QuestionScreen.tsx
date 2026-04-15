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
    // FIX: voor budget altijd de al-genormaliseerde numerieke waarde gebruiken
    // uit answers, niet singleSelected (die bevat de display-tekst zoals "€ 50,-")
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

  const baseButtonStyle: React.CSSProperties = {
    padding: isVertical ? "12px 16px" : "10px",
    background: "white",
    border: "2px solid #1B4332",
    borderRadius: isVertical ? "30px" : "10px",
    color: "#2D6A4F",
    fontWeight: 500,
    fontSize: "1rem",
    cursor: "pointer",
    textAlign: isVertical ? "left" : "center",
  }

  const selectedButtonStyle: React.CSSProperties = {
    ...baseButtonStyle,
    background: "#2D6A4F",
    color: "white",
  }

  return (
    <div style={{ padding: 20, fontFamily: "sans-serif", maxWidth: 480, margin: "0 auto" }}>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <span style={{ fontSize: "0.85rem", color: "#2D6A4F", fontWeight: 600 }}>
          Vraag {index + 1} van {questions.length}
        </span>
        <img src={logo} alt="Mealyn" style={{ height: 32 }} />
      </div>

      <div style={{ height: 6, backgroundColor: "#e0e0e0", borderRadius: 10, marginBottom: 24 }}>
        <div
          style={{
            height: "100%",
            width: `${((index + 1) / questions.length) * 100}%`,
            backgroundColor: "#2D6A4F",
            borderRadius: 10,
            transition: "width 0.3s ease",
          }}
        />
      </div>

      <h2 style={{ marginBottom: 4 }}>{question.question}</h2>

      {isMealType && (
        <p style={{ marginTop: 0, marginBottom: 16, fontSize: "0.9rem", color: "#666" }}>
          Je kunt meerdere opties selecteren.
        </p>
      )}

      {showPinpad ? (
        <div>
          <div style={{
            textAlign: "center",
            fontSize: "2.2rem",
            fontWeight: 700,
            color: "#1B4332",
            marginBottom: 24,
            letterSpacing: 2,
            minHeight: 48,
          }}>
            {pinValue ? `€ ${pinValue},-` : "€ ..."}
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 12,
            maxWidth: 300,
            margin: "0 auto 16px",
          }}>
            {["1","2","3","4","5","6","7","8","9","","0","←"].map((d, i) => (
              <button
                key={i}
                onClick={() => d !== "" && handlePinPress(d)}
                disabled={d === ""}
                style={{
                  padding: "18px 0",
                  fontSize: "1.4rem",
                  fontWeight: 600,
                  borderRadius: 14,
                  border: d === "←" ? "2px solid #e53e3e" : "2px solid #1B4332",
                  backgroundColor: d === "" ? "transparent" : d === "←" ? "#fff0f0" : "white",
                  color: d === "←" ? "#e53e3e" : "#1B4332",
                  cursor: d === "" ? "default" : "pointer",
                  transition: "background 0.15s",
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
                background: "none",
                border: "none",
                color: "#2D6A4F",
                fontSize: "0.9rem",
                cursor: "pointer",
                textDecoration: "underline",
              }}
            >
              ← Terug naar opties
            </button>
          </div>
        </div>
      ) : isMealType ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {question.options.map((opt) => {
            const isSelected = multi.includes(opt)
            return (
              <div
                key={opt}
                onClick={() => handleChoice(opt)}
                style={{
                  position: "relative",
                  borderRadius: 12,
                  overflow: "hidden",
                  cursor: "pointer",
                  border: isSelected ? "3px solid #2D6A4F" : "3px solid transparent",
                  height: 90,
                }}
              >
                <img
                  src={MEAL_IMAGES[opt] || FALLBACK_IMAGE}
                  alt={opt}
                  onError={handleImgError}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                  }}
                />
                <div style={{
                  position: "absolute",
                  inset: 0,
                  background: "rgba(0,0,0,0.25)",
                }} />
                <div style={{
                  position: "absolute",
                  top: 10,
                  left: 10,
                  width: 20,
                  height: 20,
                  borderRadius: 4,
                  border: "2px solid white",
                  backgroundColor: isSelected ? "#2D6A4F" : "rgba(255,255,255,0.3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                  {isSelected && (
                    <span style={{ color: "white", fontSize: 13, lineHeight: 1, fontWeight: 700 }}>✓</span>
                  )}
                </div>
                <div style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                  <span style={{
                    backgroundColor: "rgba(255,255,255,0.88)",
                    color: "#1A1A18",
                    fontWeight: 600,
                    fontSize: "1rem",
                    padding: "5px 18px",
                    borderRadius: 20,
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
          gridTemplateColumns: isVertical ? "1fr" : "1fr 1fr",
          gap: isVertical ? 10 : 12,
        }}>
          {question.options.map((opt) => (
            <button
              key={opt}
              onClick={() => handleChoice(opt)}
              style={
                isMulti
                  ? multi.includes(opt) ? selectedButtonStyle : baseButtonStyle
                  : singleSelected === opt ? selectedButtonStyle : baseButtonStyle
              }
            >
              {opt}
            </button>
          ))}
        </div>
      )}

      {!showPinpad && (
        <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
          <button
            onClick={goBack}
            disabled={index === 0}
            style={{
              flex: 1, padding: "12px",
              border: "none", borderRadius: 12,
              backgroundColor: index === 0 ? "#ccc" : "#2D6A4F",
              color: "white", fontWeight: 700, fontSize: "1rem",
              cursor: index === 0 ? "not-allowed" : "pointer",
            }}
          >
            ← Terug
          </button>
          <button
            onClick={nextQuestion}
            disabled={!canProceed}
            style={{
              flex: 1, padding: "12px",
              border: "none", borderRadius: 12,
              backgroundColor: !canProceed ? "#ccc" : "#2D6A4F",
              color: "white", fontWeight: 700, fontSize: "1rem",
              cursor: !canProceed ? "not-allowed" : "pointer",
            }}
          >
            Ga verder →
          </button>
        </div>
      )}

      {showPinpad && (
        <div style={{ marginTop: 24 }}>
          <button
            onClick={nextQuestion}
            disabled={!canProceed}
            style={{
              width: "100%", padding: "12px",
              border: "none", borderRadius: 12,
              backgroundColor: !canProceed ? "#ccc" : "#2D6A4F",
              color: "white", fontWeight: 700, fontSize: "1rem",
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
