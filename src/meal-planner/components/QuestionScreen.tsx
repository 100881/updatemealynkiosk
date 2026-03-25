import { useState } from "react"
import questionsData from "../data/questions.json"
import type { Answers } from "../utils/matchRecipes"

interface Question {
  id: number
  question: string
  type: "choice" | "input"
  options?: string[]
}

interface Props {
  onComplete: (answers: Answers) => void
}

const questions = questionsData as Question[]

const answerKeys: (keyof Answers)[] = [
  "persons",
  "days",
  "allergy",
  "diet",
  "goal",
  "budget",
  "mealType",
]

const lunchOptions = [
  "Boterham klassiek",
  "Zoet en hartig",
  "Gezond en belegd",
  "MIX pakket",
]

export default function QuestionScreen({ onComplete }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Partial<Answers>>({})
  const [showLunchType, setShowLunchType] = useState(false)

  const question = questions[currentIndex]
  const key = answerKeys[currentIndex]
  const isLast = currentIndex === questions.length - 1

  const goNext = (updated: Partial<Answers>) => {
    if (key === "mealType" && updated.mealType === "Lunch") {
      setShowLunchType(true)
      return
    }

    if (isLast) {
      onComplete(updated as Answers)
    } else {
      setCurrentIndex(currentIndex + 1)
    }
  }

  const handleChoice = (option: string) => {
    const updated = { ...answers, [key]: option }
    setAnswers(updated)
    goNext(updated)
  }

  const handleLunchChoice = (option: string) => {
    const updated = { ...answers, lunchType: option }
    setAnswers(updated)
    onComplete(updated as Answers)
  }

  return (
    <div>
      <h2>{question.question}</h2>

      {!showLunchType && question.type === "choice" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {question.options?.map((option) => (
            <button key={option} onClick={() => handleChoice(option)}>
              {option}
            </button>
          ))}
        </div>
      )}

      {showLunchType && (
        <>
          <h2>Wat voor lunch wil je?</h2>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {lunchOptions.map((opt) => (
              <button key={opt} onClick={() => handleLunchChoice(opt)}>
                <img
                  src="/testimg.jpg"
                  alt={opt}
                  style={{ width: "100%", height: 120, objectFit: "cover" }}
                />
                <div>{opt}</div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}