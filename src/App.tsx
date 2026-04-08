// App.tsx
import { useState } from "react"
import WelcomeScreen from "./meal-planner/components/WelcomeScreen"
import QuestionScreen from "./meal-planner/components/QuestionScreen"
import MealScreen from "./meal-planner/components/MealScreen"
import type { Answers } from "./meal-planner/utils/matchRecipes"
import { CartProvider } from "./meal-planner/context/CartContext"
import CartSidebar from "./meal-planner/components/CartSidebar"

export default function App() {
  const [screen, setScreen] =
    useState<"welcome" | "questions" | "meal">("welcome")
  const [answers, setAnswers] = useState<Answers | null>(null)

  return (
    <CartProvider>
      <div style={{ display: "flex", gap: 20 }}>
        {/* Hoofd content */}
        <div style={{ flex: 2 }}>
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

        {/* Sidebar alleen zichtbaar bij vragen of meal */}
        {(screen === "questions" || screen === "meal") && (
          <div style={{ flex: 1, padding: 20 }}>
            <CartSidebar />
          </div>
        )}
      </div>
    </CartProvider>
  )
}