import { useState, useEffect } from "react"
import productsData from "../data/products.json"
import recipesData from "../data/recipes.json"
import ingredientPrices from "../data/ingredientPrices.json"
import type { Answers } from "../utils/matchRecipes"
import { useCart } from "../context/CartContext"

declare const qz: {
  configs: { create: (printerName: string) => any }
  websocket: { connect: () => Promise<void>; disconnect: () => Promise<void> }
  print: (config: any, data: any[]) => Promise<void>
}

interface Props {
  answers: Answers
  onReset?: () => void
  onAddMore?: () => void
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

export default function MealScreen({ answers, onReset, onAddMore }: Props) {
  const { addItem, removeItem } = useCart()
  const [recipesCart, setRecipesCart] = useState<RecipeCart[]>([])
  const [cartProducts, setCartProducts] = useState<CartItem[]>([])
  const [expandedRecipes, setExpandedRecipes] = useState<{ [key: string]: boolean }>({})
  const [selectedRecipes, setSelectedRecipes] = useState<{ [key: string]: boolean }>({})

  const maxSelections = parseInt(answers.days || "1")

  useEffect(() => {
    if (!answers.mealType) return

    // AVONDETEN → RECEPTEN
    if (answers.mealType === "Avondeten") {
      const persons = parseInt(answers.persons === "4+" ? "4" : answers.persons || "1")

      const matchedRecipes = recipesData.filter((r: any) => {
        if (r.mealType !== "Avondeten") return false
        if (
          answers.diet.length &&
          !answers.diet.includes("Geen voorkeur") &&
          !answers.diet.some((d) => r.diet.includes(d))
        )
          return false
        if (
          answers.allergy.length &&
          !answers.allergy.includes("Geen allergieën") &&
          answers.allergy.some((a) => r.allergens.includes(a))
        )
          return false
        if (
          answers.goal.length &&
          !answers.goal.includes("Geen specifiek doel") &&
          !answers.goal.some((g) => r.goals.includes(g))
        )
          return false
        return true
      })

      const recipeCarts: RecipeCart[] = matchedRecipes.map((recipe: any) => {
        const ingredients: CartItem[] = recipe.ingredients.map((ing: any, index: number) => {
          const priceEntry = (ingredientPrices as any)[ing.name] || {
            price: 0,
            image: "/testimg.jpg",
          }

          return {
            id: `${recipe.id}-${ing.name}-${index}`,
            name: ing.name,
            price: priceEntry.price,
            image: priceEntry.image || "/testimg.jpg",
            quantity: parseFloat((ing.amount * persons).toFixed(1)),
          }
        })

        return {
          id: recipe.id.toString(),
          name: recipe.name,
          image: recipe.image || "/testimg.jpg",
          ingredients,
        }
      })

      // Voeg nieuwe recepten toe bovenop bestaande
      setRecipesCart((prev) => [...prev, ...recipeCarts])
      setSelectedRecipes((prev) => ({ ...prev }))
      return
    }

    // ONTBIJT / LUNCH / SNACKS → PRODUCTEN
    const matchedProducts = productsData.filter((p: any) => {
      if (p.meal_type !== answers.mealType) return false
      if (
        answers.diet.length &&
        !answers.diet.includes("Geen voorkeur") &&
        !answers.diet.some((d) => p.diet.includes(d))
      )
        return false
      if (
        answers.allergy.length &&
        !answers.allergy.includes("Geen allergieën") &&
        answers.allergy.some((a) => p.allergens.includes(a))
      )
        return false
      if (
        answers.goal.length &&
        !answers.goal.includes("Geen specifiek doel") &&
        !answers.goal.some((g) => p.goal.includes(g))
      )
        return false
      return true
    })

    const productsCart: CartItem[] = matchedProducts.map((p: any) => ({
      id: p.id.toString(),
      name: p.name,
      price: p.price,
      image: p.image || "/testimg.jpg",
      quantity: 1,
    }))

    setCartProducts((prev) => [...prev, ...productsCart])
  }, [answers])

  // UI helpers
  const toggleRecipe = (id: string) =>
    setExpandedRecipes((prev) => ({ ...prev, [id]: !prev[id] }))

  const toggleSelectRecipe = (id: string) => {
    const selectedCount = Object.values(selectedRecipes).filter(Boolean).length
    setSelectedRecipes((prev) => {
      const newState = { ...prev }
      const isSelected = !!prev[id]

      if (!isSelected && selectedCount >= maxSelections) return prev

      newState[id] = !isSelected

      const recipe = recipesCart.find((r) => r.id === id)
      if (!recipe) return newState

      if (!isSelected) {
        recipe.ingredients.forEach((ing) => addItem(ing))
      } else {
        recipe.ingredients.forEach((ing) => removeItem(ing.id))
      }

      return newState
    })
  }

  const totalPrice =
    cartProducts.reduce((sum, item) => sum + item.price * item.quantity, 0) +
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
    if (!qz) return
    try {
      await qz.websocket.connect()
      const config = qz.configs.create("EPSON TM-T20II")
      const data: any[] = []

      recipesCart.forEach((recipe) => {
        if (selectedRecipes[recipe.id]) {
          data.push({ type: "raw", format: "plain", data: `--- ${recipe.name} ---\n` })
          recipe.ingredients.forEach((ing) =>
            data.push({
              type: "raw",
              format: "plain",
              data: `${ing.name} x${ing.quantity} - €${(
                ing.price * ing.quantity
              ).toFixed(2)}\n`,
            })
          )
          data.push({ type: "raw", format: "plain", data: `\n` })
        }
      })

      data.push({
        type: "raw",
        format: "plain",
        data: `Totaal: €${totalPrice.toFixed(2)}\n\n\n`,
      })

      await qz.print(config, data)
      await qz.websocket.disconnect()
    } catch (e) {
      console.error("QZ Print Error:", e)
    }
  }

  const handleAddMore = () => {
    if (onAddMore) onAddMore()
  }

  // RENDER
  return (
    <div style={{ padding: 20, fontFamily: "sans-serif" }}>
      <h1>{answers.mealType === "Avondeten" ? "Avondeten Recepten" : "Jouw producten"}</h1>

      {answers.mealType === "Avondeten" ? (
        recipesCart.length > 0 ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: 20,
            }}
          >
            {recipesCart.map((recipe) => (
              <div
                key={recipe.id}
                style={{
                  border: selectedRecipes[recipe.id] ? "2px solid #4caf50" : "1px solid #ccc",
                  borderRadius: 12,
                  overflow: "hidden",
                }}
              >
                <div
                  onClick={() => toggleRecipe(recipe.id)}
                  style={{ cursor: "pointer", position: "relative" }}
                >
                  <img
                    src={recipe.image}
                    style={{ width: "100%", height: 150, objectFit: "cover" }}
                    alt={recipe.name}
                  />
                  <h3 style={{ padding: 12 }}>{recipe.name}</h3>
                </div>

                {expandedRecipes[recipe.id] && (
                  <div style={{ padding: 12 }}>
                    <button onClick={() => toggleSelectRecipe(recipe.id)}>
                      {selectedRecipes[recipe.id]
                        ? "Geselecteerd ✅"
                        : "Voeg Product toe aan winkelwagen"}
                    </button>

                    {recipe.ingredients.map((item) => (
                      <div
                        key={item.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          marginTop: 8,
                        }}
                      >
                        <img
                          src={item.image}
                          alt={item.name}
                          style={{
                            width: 50,
                            height: 50,
                            objectFit: "cover",
                            borderRadius: 6,
                          }}
                        />
                        <span>
                          {item.name} – {item.quantity} × €{item.price.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p>Geen recepten gevonden.</p>
        )
      ) : (
        cartProducts.map((item) => (
          <div
            key={item.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 12,
              border: "1px solid #ccc",
              padding: 8,
              borderRadius: 8,
            }}
          >
            <img
              src={item.image}
              alt={item.name}
              style={{ width: 60, height: 60, objectFit: "cover", borderRadius: 6 }}
            />
            <div style={{ flexGrow: 1 }}>
              <h3>{item.name}</h3>
              <button onClick={() => addItem(item)}>Voeg toe aan winkelmandje</button>
            </div>
            <span>€{item.price.toFixed(2)}</span>
          </div>
        ))
      )}

      {answers.mealType === "Avondeten" &&
        Object.values(selectedRecipes).some(Boolean) && (
          <button onClick={printSelectedRecipes} style={{ marginTop: 20 }}>
            Print geselecteerde recepten
          </button>
        )}

      <h2 style={{ color: overBudget ? "red" : "black" }}>
        Totaal: €{totalPrice.toFixed(2)}
      </h2>

      {onAddMore && (
        <button onClick={handleAddMore} style={{ marginTop: 20 }}>
          Nieuwe maaltijd toevoegen
        </button>
      )}

      {onReset && (
        <button onClick={onReset} style={{ marginTop: 20 }}>
          Opnieuw beginnen
        </button>
      )}
    </div>
  )
}