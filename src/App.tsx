import { useState } from "react"
import WelcomeScreen from "./screens/WelcomeScreen"
import QuestionScreen from "./screens/QuestionScreen"
import MealScreen from "./screens/MealScreen"
import questionsData from "./data/questions.json"
import AITestScreen from "./screens/AITestScreen"

export default function App() {
  const [screen, setScreen] = useState<
    "welcome" | "questions" | "meal" | "ai-test"
  >("welcome")

  const [answers, setAnswers] = useState<Record<string, string>>({})

  const handleCompleteQuestions = (ans: Record<number, string>) => {
    const mappedAnswers: Record<string, string> = {}
    questionsData.forEach((q) => {
      if (ans[q.id] !== undefined) mappedAnswers[q.question] = ans[q.id]
    })
    setAnswers(mappedAnswers)
    setScreen("meal")
  }

  if (screen === "welcome") {
    return (
      <WelcomeScreen
        onStart={() => setScreen("questions")}
        onAITest={() => setScreen("ai-test")}
      />
    )
  }

  if (screen === "questions") {
    return <QuestionScreen onComplete={handleCompleteQuestions} />
  }

  if (screen === "meal") {
    return <MealScreen answers={answers} />
  }

  if (screen === "ai-test") {
    return <AITestScreen />
  }

  return null
}