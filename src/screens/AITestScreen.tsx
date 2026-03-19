import { useState } from "react"
import questionsData from "../data/questions.json"
import MealScreen from "./MealScreen"

export default function AITestScreen() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [showMeal, setShowMeal] = useState(false)

  const question = questionsData[currentQuestionIndex]

  const handleAnswer = (answer: string) => {
    const updatedAnswers = { ...answers, [question.question]: answer }
    setAnswers(updatedAnswers)

    if (currentQuestionIndex + 1 < questionsData.length) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    } else {
      setShowMeal(true)
    }
  }

  if (showMeal) {
    return <MealScreen answers={answers} />
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", height: "100vh", fontFamily: "Arial", textAlign: "center", gap: "30px" }}>
      <h2 style={{ fontSize: "32px" }}>{question.question}</h2>

      {question.type === "choice" && question.options ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {question.options.map((option) => (
            <button
              key={option}
              onClick={() => handleAnswer(option)}
              style={{ fontSize: "24px", padding: "20px 60px", cursor: "pointer" }}
            >
              {option}
            </button>
          ))}
        </div>
      ) : question.type === "input" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <input
            type="number"
            placeholder={question.placeholder}
            onChange={(e) => setAnswers({ ...answers, [question.question]: e.target.value })}
            style={{ fontSize: "24px", padding: "15px 20px", width: "200px", textAlign: "center" }}
          />
          <button
            onClick={() => handleAnswer(answers[question.question] || "")}
            style={{ fontSize: "24px", padding: "20px 60px", cursor: "pointer" }}
          >
            Volgende
          </button>
        </div>
      ) : null}
    </div>
  )
}