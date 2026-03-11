import { useState } from "react"
import questionsData from "../data/questions.json"

type Question = {
  id: number
  question: string
  type: "choice" | "input"
  options?: string[]
  placeholder?: string
}

type Props = {
  onComplete: (answers: Record<number, string>) => void
}

export default function QuestionScreen({ onComplete }: Props) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [inputValue, setInputValue] = useState("")

  const question: Question = questionsData[currentQuestion]

  const handleAnswer = (option?: string) => {
    const answer = option ?? inputValue
    if (!answer) return 
    setAnswers({ ...answers, [question.id]: answer })
    setInputValue("") 
    if (currentQuestion + 1 < questionsData.length) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      onComplete({ ...answers, [question.id]: answer })
    }
  }

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
      fontFamily: "Arial",
      textAlign: "center"
    }}>
      <h2 style={{ fontSize: "32px", marginBottom: "30px" }}>
        {question.question}
      </h2>

      {question.type === "choice" && question.options ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {question.options.map(option => (
            <button
              key={option}
              onClick={() => handleAnswer(option)}
              style={{
                fontSize: "24px",
                padding: "20px 60px",
                cursor: "pointer"
              }}
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
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            style={{
              fontSize: "24px",
              padding: "15px 20px",
              width: "200px",
              textAlign: "center"
            }}
          />
          <button
            onClick={() => handleAnswer()}
            style={{
              fontSize: "24px",
              padding: "20px 60px",
              cursor: "pointer"
            }}
          >
            Volgende
          </button>
        </div>
      ) : null}
    </div>
  )
}