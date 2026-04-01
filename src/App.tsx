import { useState } from "react"
import WelcomeScreen from "./meal-planner/components/WelcomeScreen"
import QuestionScreen from "./meal-planner/components/QuestionScreen"
import MealScreen from "./meal-planner/components/MealScreen"
import type { Answers } from "./meal-planner/utils/matchRecipes"

export default function App() {
  const [screen, setScreen] = useState<"welcome" | "questions" | "meal">("welcome")
  const [answers, setAnswers] = useState<Answers | null>(null)

  const handleCompleteQuestions = (ans: Answers) => {
    setAnswers(ans)
    setScreen("meal")
  }

  return (
    <div>
      {screen === "welcome" && (
        <WelcomeScreen onStart={() => setScreen("questions")} />
      )}

      {screen === "questions" && (
        <QuestionScreen onComplete={(ans) => handleCompleteQuestions(ans)} />
      )}

      {screen === "meal" && answers && (
        <MealScreen
          answers={answers}
          onReset={() => {
            setAnswers(null)
            setScreen("welcome")
          }}
        />
      )}
    </div>
  )
}