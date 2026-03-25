import recipesData from "../data/recipes.json"

export interface Recipe {
  id: number
  name: string
  mealType: string
  diet: string[]
  allergens: string[]
  goals: string[]
  budgetPerPerson: number
  description: string
  ingredients: { name: string; amount: number; unit: string }[]
  steps: string[]
}

export interface Answers {
  persons: string        // vraag 1
  days: string           // vraag 2
  allergy: string        // vraag 3
  diet: string           // vraag 4
  goal: string           // vraag 5
  budget: string         // vraag 6
  mealType: string       // vraag 7
}

export function matchRecipes(answers: Answers): Recipe[] {
  const recipes = recipesData as Recipe[]

  const persons = parseInt(answers.persons === "4+" ? "4" : answers.persons) || 1
  const days = parseInt(answers.days) || 1
  const totalBudget = parseFloat(answers.budget) || Infinity
  const budgetPerPersonPerDay = totalBudget / persons / days

  return recipes.filter((recipe) => {
    // Filter op maaltijdtype
    if (answers.mealType && recipe.mealType !== answers.mealType) {
      return false
    }

    // Filter op allergie: als gebruiker allergie heeft, mag recept die allergen NIET bevatten
    if (answers.allergy && answers.allergy !== "Geen allergieën") {
      if (recipe.allergens.includes(answers.allergy)) {
        return false
      }
    }

    // Filter op dieet: recept moet het dieet ondersteunen
    if (answers.diet && answers.diet !== "Geen voorkeur") {
      if (!recipe.diet.includes(answers.diet)) {
        return false
      }
    }

    // Filter op voedingsdoel
    if (answers.goal && answers.goal !== "Geen specifiek doel") {
      if (!recipe.goals.includes(answers.goal)) {
        return false
      }
    }

    // Filter op budget
    if (totalBudget !== Infinity) {
      if (recipe.budgetPerPerson > budgetPerPersonPerDay) {
        return false
      }
    }

    return true
  })
}

// Schaal ingrediënten op basis van aantal personen en dagen
export function scaleIngredients(
  recipe: Recipe,
  persons: number,
  days: number
): Recipe["ingredients"] {
  return recipe.ingredients.map((ing) => ({
    ...ing,
    amount: parseFloat((ing.amount * persons * days).toFixed(1)),
  }))
}
