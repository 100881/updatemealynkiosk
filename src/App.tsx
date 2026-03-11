import { useState } from "react"
import WelcomeScreen from "./screens/WelcomeScreen"
import QuestionScreen from "./screens/QuestionScreen"
import MealScreen from "./screens/MealScreen"
import questionsData from "./data/questions.json"

export default function App() {
  const [screen, setScreen] = useState("welcome")
  const [answers, setAnswers] = useState<Record<string, string>>({})

  const handleCompleteQuestions = (ans: Record<number, string>) => {
    const mappedAnswers: Record<string, string> = {}
    questionsData.forEach(q => {
      if (ans[q.id] !== undefined) mappedAnswers[q.question] = ans[q.id]
    })
    setAnswers(mappedAnswers)
    setScreen("meal")
  }

  if (screen === "welcome") {
    return <WelcomeScreen onStart={() => setScreen("questions")} />
  }

  if (screen === "questions") {
    return <QuestionScreen onComplete={handleCompleteQuestions} />
  }

  if (screen === "meal") {
    return <MealScreen answers={answers} />
  }

  return null
}