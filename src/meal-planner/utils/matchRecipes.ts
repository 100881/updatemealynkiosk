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
    if (answers.mealType && recipe.mealType !== answers.mealType) return false
    if (answers.allergy && answers.allergy !== "Geen allergieën" && recipe.allergens.includes(answers.allergy))
      return false
    if (answers.diet && answers.diet !== "Geen voorkeur" && !recipe.diet.includes(answers.diet)) return false
    if (answers.goal && answers.goal !== "Geen specifiek doel" && !recipe.goals.includes(answers.goal)) return false
    if (totalBudget !== Infinity && recipe.budgetPerPerson > budgetPerPersonPerDay) return false
    return true
  })
}

export function scaleIngredients(recipe: Recipe, persons: number, days: number): Recipe["ingredients"] {
  return recipe.ingredients.map((ing) => ({
    ...ing,
    amount: parseFloat((ing.amount * persons * days).toFixed(1)),
  }))
}