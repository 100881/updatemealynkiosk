import { useState } from "react"
import WelcomeScreen from "./meal-planner/components/WelcomeScreen"
import QuestionScreen from "./meal-planner/components/QuestionScreen"
import MealScreen from "./meal-planner/components/MealScreen"
import type { Answers } from "./meal-planner/utils/matchRecipes"
import { CartProvider } from "./meal-planner/context/CartContext"

export default function App() {
  const [screen, setScreen] = useState<"welcome" | "questions" | "meal">("welcome")
  const [answers, setAnswers] = useState<Answers | null>(null)

  return (
    <CartProvider>
      <div style={{ maxWidth: 480, margin: "0 auto" }}>
        {screen === "welcome" && (
          <WelcomeScreen onStart={() => setScreen("questions")} />
        )}
        {screen === "questions" && (
          <QuestionScreen
            onComplete={(ans) => {
              setAnswers(ans)
              setScreen("meal")
            }}
          />
        )}
        {screen === "meal" && answers && (
          <MealScreen
            answers={answers}
            onAddMore={() => setScreen("questions")}
            onReset={() => {
              setAnswers(null)
              setScreen("welcome")
            }}
          />
        )}
      </div>
    </CartProvider>
  )
}