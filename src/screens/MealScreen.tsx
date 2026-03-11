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
    </div>
  )
}