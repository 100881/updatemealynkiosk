import { useState } from "react"
import WelcomeScreen from "./screens/WelcomeScreen"
import QuestionScreen from "./screens/QuestionScreen"
import MealScreen from "./screens/MealScreen"
import MealPlanner from "./meal-planner/MealPlanner"
import questionsData from "./data/questions.json"

type Route = "app" | "meal-planner"

export default function App() {
  const [route, setRoute] = useState<Route>("app")
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

  // Meal Planner feature
  if (route === "meal-planner") {
    return (
      <div>
        <button onClick={() => setRoute("app")}>← Terug</button>
        <MealPlanner />
      </div>
    )
  }

  // Bestaande app flow
  if (screen === "welcome") {
    return (
      <div>
        <button onClick={() => setRoute("meal-planner")}>Maaltijdplanner</button>
        <WelcomeScreen onStart={() => setScreen("questions")} />
      </div>
    )
  }

  if (screen === "questions") {
    return <QuestionScreen onComplete={handleCompleteQuestions} />
  }

  if (screen === "meal") {
    return <MealScreen answers={answers} />
  }

  return null
}
