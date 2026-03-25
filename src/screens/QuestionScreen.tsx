import recipesData from "../data/recipes.json"
import productsData from "../data/products.json"

type Props = {
  answers: Record<string, string>
}

export default function MealScreen({ answers }: Props) {
 
  const diet = answers["Wat is je dieetvoorkeur?"] || "Geen"
  const mealType = answers["Welke maaltijden wil je plannen?"] || "Diner"
  const budget = parseFloat(answers["Wat is je budget per dag in euro?"]) || 0
  const people = parseInt(answers["Voor hoeveel personen plan je de maaltijden?"]) || 1


<<<<<<< HEAD
  const filtered = recipesData.filter((r: any) => {
    const matchesDiet = r.diet === diet || r.diet === "Geen"
    const matchesMeal = r.meal_type === mealType

 
    const totalPrice = r.ingredients.reduce((sum: number, ing: string) => {
      const price = productsData[ing] || 0
      return sum + price
    }, 0) * people

    const matchesBudget = totalPrice <= budget

    return matchesDiet && matchesMeal && matchesBudget
  })


  const recipe = filtered[0] || { name: "Geen recept gevonden", ingredients: [] }

 
  const ingredientPrices = recipe.ingredients.map((ing: string) => ({
    name: ing,
    price: (productsData[ing] || 0) * people
  }))

  const totalPrice = ingredientPrices.reduce((sum, i) => sum + i.price, 0)

  return (
    <div style={{
      padding: 40,
      fontFamily: "Arial",
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-start"
    }}>
      <h1 style={{ fontSize: "36px", marginBottom: "20px" }}>{recipe.name}</h1>

      <h2 style={{ fontSize: "28px", marginBottom: "10px" }}>Ingrediënten:</h2>
      <ul style={{ fontSize: "22px", marginBottom: "20px" }}>
        {ingredientPrices.map((i, idx) => (
          <li key={idx}>
            {i.name} - €{i.price.toFixed(2)}
          </li>
        ))}
      </ul>

      <h3 style={{ fontSize: "24px" }}>
        Totale prijs: €{totalPrice.toFixed(2)}
      </h3>
=======
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
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        fontFamily: "Arial",
        textAlign: "center",
      }}
    >
      <h2 style={{ fontSize: "32px", marginBottom: "30px" }}>
        {question.question}
      </h2>

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
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            style={{ fontSize: "24px", padding: "15px 20px", width: "200px", textAlign: "center" }}
          />
          <button
            onClick={() => handleAnswer()}
            style={{ fontSize: "24px", padding: "20px 60px", cursor: "pointer" }}
          >
            Volgende
          </button>
        </div>
      ) : null}
>>>>>>> 1044f5029be9c727a69d33bb43c14759e8b5c099
    </div>
  )
}