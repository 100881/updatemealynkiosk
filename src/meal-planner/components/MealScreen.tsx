import { useState, useEffect } from "react"
import productsData from "../data/products.json"
import recipesData from "../data/recipes.json"
import ingredientPrices from "../data/ingredientPrices.json"
import type { Answers } from "../utils/matchRecipes"

// QZ Print declaratie
declare const qz: {
  configs: { create: (printerName: string) => any }
  websocket: { connect: () => Promise<void>; disconnect: () => Promise<void> }
  print: (config: any, data: any[]) => Promise<void>
}

interface Props {
  answers: Answers
  onReset?: () => void
}

interface CartItem {
  id: string
  name: string
  price: number
  image: string
  quantity: number
}

interface RecipeCart {
  id: string
  name: string
  image: string
  ingredients: CartItem[]
}

export default function MealScreen({ answers, onReset }: Props) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [recipesCart, setRecipesCart] = useState<RecipeCart[]>([])
  const [expandedRecipes, setExpandedRecipes] = useState<{ [key: string]: boolean }>({})
  const [selectedRecipes, setSelectedRecipes] = useState<{ [key: string]: boolean }>({})

  const maxSelections = parseInt(answers.days || "1")

  useEffect(() => {
    if (!answers.mealType) return

    if (answers.mealType === "Avondeten") {
      const persons = parseInt(answers.persons === "4+" ? "4" : answers.persons || "1")
      const matchedRecipes = recipesData.filter((r: any) => {
        if (r.mealType !== "Avondeten") return false
        if (answers.diet && answers.diet !== "Geen voorkeur" && !r.diet.includes(answers.diet)) return false
        if (answers.allergy && answers.allergy !== "Geen allergieën" && r.allergens.includes(answers.allergy)) return false
        if (answers.goal && answers.goal !== "Geen specifiek doel" && !r.goals.includes(answers.goal)) return false
        return true
      })

      const recipeCarts: RecipeCart[] = matchedRecipes.map((recipe: any) => {
        const ingredients: CartItem[] = recipe.ingredients.map((ing: any, index: number) => {
          const priceEntry = (ingredientPrices as any)[ing.name] || { price: 0, image: "/testimg.jpg" }
          return {
            id: `${recipe.id}-${ing.name}-${index}`,
            name: ing.name,
            price: priceEntry.price * ing.amount,
            image: priceEntry.image,
            quantity: parseFloat((ing.amount * persons).toFixed(1)),
          }
        })
        return { id: recipe.id, name: recipe.name, image: recipe.image, ingredients }
      })
      setRecipesCart(recipeCarts)
      setSelectedRecipes({})
    } else {
      const matchedProducts = productsData.filter((p: any) => {
        if (answers.mealType && p.meal_type !== answers.mealType) return false
        if (answers.diet && answers.diet !== "Geen voorkeur" && !p.diet.includes(answers.diet)) return false
        if (answers.allergy && answers.allergy !== "Geen allergieën" && p.allergens.includes(answers.allergy)) return false
        if (answers.goal && answers.goal !== "Geen specifiek doel" && !p.goal.includes(answers.goal)) return false
        return true
      })
      const productsCart: CartItem[] = matchedProducts.map((p: any) => ({
        id: p.id.toString(),
        name: p.name,
        price: p.price,
        image: p.image,
        quantity: 1,
      }))
      setCart(productsCart)
      setRecipesCart([])
    }
  }, [answers])

  const toggleRecipe = (id: string) => setExpandedRecipes((prev) => ({ ...prev, [id]: !prev[id] }))
  const toggleSelectRecipe = (id: string) => {
    const selectedCount = Object.values(selectedRecipes).filter(Boolean).length
    setSelectedRecipes((prev) => {
      if (prev[id]) return { ...prev, [id]: false }
      if (selectedCount < maxSelections) return { ...prev, [id]: true }
      return prev
    })
  }

  const increaseQty = (id: string) =>
    setCart((prev) => prev.map((item) => (item.id === id ? { ...item, quantity: item.quantity + 1 } : item)))
  const decreaseQty = (id: string) =>
    setCart((prev) =>
      prev.map((item) => (item.id === id && item.quantity > 1 ? { ...item, quantity: item.quantity - 1 } : item))
    )
  const removeItem = (id: string) => setCart((prev) => prev.filter((item) => item.id !== id))

  const totalPrice =
    cart.reduce((sum, item) => sum + item.price * item.quantity, 0) +
    recipesCart.reduce(
      (sumR, recipe) =>
        sumR +
        (selectedRecipes[recipe.id]
          ? recipe.ingredients.reduce((sumI, item) => sumI + item.price * item.quantity, 0)
          : 0),
      0
    )

  const budget = answers.budget ? parseFloat(answers.budget) : null
  const overBudget = budget !== null && totalPrice > budget

  const printSelectedRecipes = async () => {
    if (!window || !qz) return
    try {
      await qz.websocket.connect()
      const config = qz.configs.create("EPSON TM-T20II")
      const data: any[] = []
      recipesCart.forEach((recipe) => {
        if (selectedRecipes[recipe.id]) {
          data.push({ type: "raw", format: "plain", data: `--- ${recipe.name} ---\n` })
          recipe.ingredients.forEach((ing) => {
            data.push({
              type: "raw",
              format: "plain",
              data: `${ing.name} x${ing.quantity} - €${(ing.price * ing.quantity).toFixed(2)}\n`,
            })
          })
          data.push({ type: "raw", format: "plain", data: `\n` })
        }
      })
      data.push({ type: "raw", format: "plain", data: `Totaal: €${totalPrice.toFixed(2)}\n\n\n\n` })
      await qz.print(config, data)
      await qz.websocket.disconnect()
    } catch (e) {
      console.error("QZ Print Error:", e)
    }
  }

  return (
    <div style={{ padding: 20, fontFamily: "sans-serif" }}>
      <h1>{answers.mealType === "Avondeten" ? "Avondeten Recepten" : "Jouw producten"}</h1>

      <div style={{ marginBottom: 16, fontSize: 14, color: "#666" }}>
        {answers.mealType && <span>🍽 {answers.mealType} &nbsp;</span>}
        {answers.diet && answers.diet !== "Geen voorkeur" && <span>🥗 {answers.diet} &nbsp;</span>}
        {answers.allergy && answers.allergy !== "Geen allergieën" && <span>⚠️ Zonder {answers.allergy} &nbsp;</span>}
        {answers.goal && answers.goal !== "Geen specifiek doel" && <span>🎯 {answers.goal} &nbsp;</span>}
        {budget && <span>💰 Budget: €{budget} &nbsp;</span>}
        {answers.mealType === "Avondeten" && (
          <span>
            ✅ Selecteer max {maxSelections} recepten &nbsp;({Object.values(selectedRecipes).filter(Boolean).length}/{maxSelections})
          </span>
        )}
      </div>

      {answers.mealType === "Avondeten" ? (
        recipesCart.length > 0 ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 20 }}>
            {recipesCart.map((recipe) => (
              <div
                key={recipe.id}
                style={{
                  border: selectedRecipes[recipe.id] ? "2px solid #4caf50" : "1px solid #ccc",
                  borderRadius: 12,
                  overflow: "hidden",
                  cursor: "pointer",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  transition: "transform 0.2s, border 0.2s",
                }}
              >
                <div onClick={() => toggleRecipe(recipe.id)}>
                  <img src={recipe.image} alt={recipe.name} style={{ width: "100%", height: 150, objectFit: "cover" }} />
                  <div style={{ padding: 12 }}>
                    <h2 style={{ margin: "8px 0" }}>{recipe.name}</h2>
                  </div>
                </div>
                {expandedRecipes[recipe.id] && (
                  <div style={{ padding: 12, borderTop: "1px solid #ddd" }}>
                    <button
                      onClick={() => toggleSelectRecipe(recipe.id)}
                      style={{
                        background: selectedRecipes[recipe.id] ? "#4caf50" : "#eee",
                        color: selectedRecipes[recipe.id] ? "#fff" : "#000",
                        padding: "6px 12px",
                        border: "none",
                        borderRadius: 6,
                        marginBottom: 8,
                        cursor: "pointer",
                      }}
                    >
                      {selectedRecipes[recipe.id] ? "Geselecteerd ✅" : "Selecteer"}
                    </button>

                    {recipe.ingredients.map((item) => (
                      <div key={item.id} style={{ display: "flex", alignItems: "center", marginBottom: 8, gap: 10 }}>
                        <img src={item.image} alt={item.name} style={{ width: 50, height: 50, objectFit: "cover", borderRadius: 6 }} />
                        <div style={{ flex: 1 }}>
                          <p style={{ margin: 0 }}>{item.name}</p>
                          <p style={{ margin: 0, fontSize: 12 }}>
                            {item.quantity} × €{item.price.toFixed(2)} = €{(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p>Geen recepten gevonden voor jouw keuzes.</p>
        )
      ) : cart.length > 0 ? (
        cart.map((item) => (
          <div key={item.id} style={{ border: "1px solid #ccc", padding: 16, marginBottom: 20, borderRadius: 10, display: "flex", alignItems: "center", gap: 16 }}>
            <img src={item.image} alt={item.name} style={{ width: 100, height: 100, objectFit: "cover", borderRadius: 8 }} />
            <div style={{ flex: 1 }}>
              <h2>{item.name}</h2>
              <p>Prijs per stuk: €{item.price.toFixed(2)}</p>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <button onClick={() => decreaseQty(item.id)}>-</button>
                <span>{item.quantity}</span>
                <button onClick={() => increaseQty(item.id)}>+</button>
              </div>
              <p>Subtotaal: €{(item.price * item.quantity).toFixed(2)}</p>
            </div>
            <button onClick={() => removeItem(item.id)}>❌</button>
          </div>
        ))
      ) : (
        <p>Geen items gevonden voor jouw keuzes. Probeer andere filters.</p>
      )}

      {answers.mealType === "Avondeten" && Object.values(selectedRecipes).some(Boolean) && (
        <button
          onClick={printSelectedRecipes}
          style={{ marginTop: 20, padding: "10px 20px", fontSize: 16, borderRadius: 6, cursor: "pointer" }}
        >
          Print geselecteerde recepten
        </button>
      )}

      <h2 style={{ color: overBudget ? "red" : "inherit", marginTop: 20 }}>
        Totaal: €{totalPrice.toFixed(2)}
        {overBudget && <span> ⚠️ Boven budget (€{budget})</span>}
      </h2>

      {onReset && <button onClick={onReset}>Opnieuw beginnen</button>}
    </div>
  )
}