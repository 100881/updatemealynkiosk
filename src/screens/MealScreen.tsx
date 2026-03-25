import recipesData from "../data/recipes.json"
import productsData from "../data/products.json"

type Props = {
  answers: Record<string, string>
}

export default function MealScreen({ answers }: Props) {
  const diet = answers["Wat is je dieetvoorkeur?"] || "Geen"
  const mealTypes = answers["Welke maaltijden wil je plannen?"]
    ? answers["Welke maaltijden wil je plannen?"].split(",").map((m) => m.trim())
    : ["Diner"]
  const budget = parseFloat(answers["Wat is je budget per dag in euro?"]) || 0
  const people = parseInt(answers["Voor hoeveel personen plan je de maaltijden?"]) || 1

  const filtered = recipesData.filter((r: any) => {
    const matchesDiet =
      r.diet.toLowerCase() === diet.toLowerCase() || r.diet === "Geen"
    const matchesMeal = mealTypes.includes(r.meal_type)

    const totalPrice = r.ingredients.reduce((sum: number, ing: string) => {
      const product = productsData.find((p: any) => p.name === ing)
      return sum + (product?.price || 0)
    }, 0) * people

    const matchesBudget = totalPrice <= budget || budget === 0

    return matchesDiet && matchesMeal && matchesBudget
  })

  if (filtered.length === 0) {
    return (
      <div style={{ padding: 40, fontFamily: "Arial", textAlign: "center" }}>
        <h1 style={{ fontSize: "36px" }}>Geen recepten gevonden</h1>
        <p style={{ fontSize: "22px" }}>Probeer je filters aan te passen.</p>
      </div>
    )
  }

  return (
    <div style={{ padding: 40, fontFamily: "Arial", backgroundColor: "#f9f9f9", minHeight: "100vh" }}>
      <h1 style={{ fontSize: "36px", marginBottom: 40, textAlign: "center", color: "#333" }}>Je geplande maaltijden</h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
          gap: 30,
        }}
      >
        {filtered.map((recipe: any, idx: number) => {
          const ingredientPrices = recipe.ingredients.map((ing: string) => {
            const product = productsData.find((p: any) => p.name === ing)
            return {
              name: ing,
              price: (product?.price || 0) * people,
              image: product?.image || "/assets/images/mealynfototest.jpg"
            }
          })

          const totalPrice = ingredientPrices.reduce((sum, i) => sum + i.price, 0)

          return (
            <div
              key={idx}
              style={{
                borderRadius: 15,
                padding: 20,
                boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
                backgroundColor: "#fff",
                transition: "transform 0.2s, box-shadow 0.2s",
              }}
              onMouseEnter={e => {
                const target = e.currentTarget
                target.style.transform = "translateY(-5px)"
                target.style.boxShadow = "0 8px 25px rgba(0,0,0,0.15)"
              }}
              onMouseLeave={e => {
                const target = e.currentTarget
                target.style.transform = "translateY(0)"
                target.style.boxShadow = "0 4px 15px rgba(0,0,0,0.1)"
              }}
            >
              <h2 style={{ fontSize: "26px", marginBottom: 8, color: "#222" }}>{recipe.name}</h2>
              <p style={{ fontSize: 16, fontStyle: "italic", marginBottom: 12, color: "#555" }}>
                {recipe.description}
              </p>

              <div style={{ fontSize: 15, marginBottom: 12, color: "#555" }}>
                <strong>Type maaltijd:</strong> {recipe.meal_type} |{" "}
                <strong>Dieet:</strong> {recipe.diet}
              </div>
              <div style={{ fontSize: 15, marginBottom: 12, color: "#555" }}>
                <strong>Bereidingstijd:</strong> {recipe.prep_time_min} min |{" "}
                <strong>Calorieën:</strong> {recipe.calories} kcal |{" "}
                <strong>Kosten per persoon:</strong> €{recipe.cost_per_person.toFixed(2)}
              </div>

              <h3 style={{ fontSize: "20px", marginBottom: 8 }}>Ingrediënten:</h3>
              <ul style={{ padding: 0, listStyle: "none", marginBottom: 12 }}>
                {ingredientPrices.map((i, idx2) => (
                  <li
                    key={idx2}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginBottom: 6,
                      fontSize: 16,
                      color: "#333"
                    }}
                  >
                    <img
                      src={i.image}
                      alt={i.name}
                      style={{ width: 40, height: 40, objectFit: "cover", marginRight: 10, borderRadius: 5 }}
                    />
                    <span>{i.name} - €{i.price.toFixed(2)}</span>
                  </li>
                ))}
              </ul>

              <div style={{ fontSize: 17, fontWeight: "bold", marginBottom: 10, color: "#222" }}>
                Totale prijs: €{totalPrice.toFixed(2)}
              </div>

              <h3 style={{ fontSize: "19px", marginBottom: 6 }}>Bereidingsstappen:</h3>
              <ol style={{ fontSize: 15, paddingLeft: 20, color: "#555" }}>
                {recipe.steps.map((step: string, stepIdx: number) => (
                  <li key={stepIdx} style={{ marginBottom: 4 }}>{step}</li>
                ))}
              </ol>
            </div>
          )
        })}
      </div>
    </div>
  )
}