import { useState } from "react"
import { matchRecipes, scaleIngredients } from "../utils/matchRecipes"
import { calculateIngredientPrice } from "../utils/calculatePrice"
import type { Answers, Recipe } from "../utils/matchRecipes"

interface Props {
  answers: Answers
  onReset: () => void
}

export default function MealScreen({ answers, onReset }: Props) {
  const persons = parseInt(answers.persons === "4+" ? "4" : answers.persons) || 1
  const days = parseInt(answers.days) || 1

  const matched = matchRecipes(answers)
  const [openRecipeId, setOpenRecipeId] = useState<number | null>(null)

  return (
    <div>
      <h1>Jouw recepten</h1>

      {matched.map((recipe: Recipe) => {
        const isOpen = openRecipeId === recipe.id
        const scaledIngredients = scaleIngredients(recipe, persons, days)

        let totalPrice = 0

        return (
          <div
            key={recipe.id}
            style={{
              border: "1px solid #ccc",
              padding: 16,
              marginBottom: 20,
              borderRadius: 10,
            }}
          >
            {/* 📸 Recept afbeelding */}
           <img
  src={calculateIngredientPrice(recipe.ingredients[0]?.name || "", 1).image} 
  alt={recipe.name}
  style={{
    width: "100%",
    maxHeight: 200,
    objectFit: "cover",
    borderRadius: 8,
    marginBottom: 12,
  }}
/>

            <h2
              style={{ cursor: "pointer" }}
              onClick={() => setOpenRecipeId(isOpen ? null : recipe.id)}
            >
              {recipe.name}
            </h2>

            <p>{recipe.description}</p>

            {isOpen && (
              <>
                <h3>Ingrediënten & prijzen</h3>

                <ul style={{ listStyle: "none", padding: 0 }}>
                  {scaledIngredients.map((ing, i) => {
                    const { price, image } = calculateIngredientPrice(
                      ing.name,
                      ing.amount
                    )
                    totalPrice += price

                    return (
                      <li
                        key={i}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                          marginBottom: 10,
                        }}
                      >
                        {/* 📸 Ingrediënt afbeelding */}
                        <img
                          src={image}
                          alt={ing.name}
                          width={50}
                          height={50}
                          style={{
                            objectFit: "cover",
                            borderRadius: 6,
                            border: "1px solid #ddd",
                          }}
                        />

                        <div>
                          <div>
                            {ing.amount} {ing.unit} {ing.name}
                          </div>
                          <strong>€{price.toFixed(2)}</strong>
                        </div>
                      </li>
                    )
                  })}
                </ul>

                <p>
                  <strong>Totaal: €{totalPrice.toFixed(2)}</strong>
                </p>
              </>
            )}
          </div>
        )
      })}

      <button onClick={onReset}>Opnieuw beginnen</button>
    </div>
  )
}