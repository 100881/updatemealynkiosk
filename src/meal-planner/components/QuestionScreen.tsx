import { useState } from "react"
import questionsData from "../data/questions.json"
import type { Answers } from "../utils/matchRecipes"

interface Question {
  id: number
  question: string
  type: "choice"
  options: string[]
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

export default function QuestionScreen({ onComplete }: Props) {
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState<Partial<Answers>>({
    allergy: [],
    diet: [],
    goal: [],
  })
  const [multi, setMulti] = useState<string[]>([])

  const key = answerKeys[index]
  const isMulti = ["allergy", "diet", "goal"].includes(key)
  const question = questions[index]

  const handleChoice = (option: string) => {
    if (isMulti) {
      if (option.startsWith("Geen")) {
        const updated = { ...answers, [key]: [option] }
        setAnswers(updated)
        nextQuestion(updated)
        return
      }

      const updatedMulti = multi.includes(option)
        ? multi.filter((o) => o !== option)
        : [...multi, option]

      setMulti(updatedMulti)
      setAnswers({ ...answers, [key]: updatedMulti })
      return
    }

    const updated = { ...answers, [key]: option }
    setAnswers(updated)
    nextQuestion(updated)
  }

  const nextQuestion = (updatedAnswers: Partial<Answers>) => {
    setMulti([])
    if (index === questions.length - 1) {
      onComplete(updatedAnswers as Answers)
    } else {
      setIndex(index + 1)
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>{question.question}</h2>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {question.options.map((opt) => (
          <button
            key={opt}
            onClick={() => handleChoice(opt)}
            style={{
              padding: "10px",
              background: multi.includes(opt) ? "#4caf50" : "#eee",
            }}
          >
            {opt}
          </button>
        ))}
      </div>

      {isMulti && multi.length > 0 && (
        <button
          style={{ marginTop: 20, padding: "10px 20px" }}
          onClick={() => nextQuestion(answers)}
        >
          Volgende
        </button>
      )}
    </div>
  )
}