import { useState } from "react"
import WelcomeScreen from "./components/WelcomeScreen"
import QuestionScreen from "./components/QuestionScreen"
import MealScreen from "./components/MealScreen"
import type { Answers } from "./utils/matchRecipes"

type Screen = "welcome" | "questions" | "meal"

export default function MealPlanner() {
  const [screen, setScreen] = useState<Screen>("welcome")
  const [answers, setAnswers] = useState<Answers | null>(null)

  const handleComplete = (ans: Answers) => {
    setAnswers(ans)
    setScreen("meal")
  }

  const handleReset = () => {
    setAnswers(null)
    setScreen("welcome")
  }

  if (screen === "welcome") {
    return <WelcomeScreen onStart={() => setScreen("questions")} />
  }

  if (screen === "questions") {
    return <QuestionScreen onComplete={handleComplete} />
  }

  if (screen === "meal" && answers) {
    return <MealScreen answers={answers} onReset={handleReset} />
  }

  return null
}