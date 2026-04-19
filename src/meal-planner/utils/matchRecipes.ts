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
  image: string
  ingredients: {
    name: string
    amount: number
    unit: string
    image: string
  }[]
}

export interface Answers {
  persons: string
  days: string
  allergy: string[]
  diet: string[]
  goal: string[]
  budget: string
  mealType: string
}

export function matchRecipes(answers: Answers): Recipe[] {
  const recipes = recipesData as Recipe[]

  return recipes.filter((r) => {
    if (answers.mealType && r.mealType !== answers.mealType) return false

    if (
      answers.allergy.length &&
      !answers.allergy.includes("Geen allergieën") &&
      answers.allergy.some((a) => r.allergens.includes(a))
    ) {
      return false
    }

    if (
      answers.diet.length &&
      !answers.diet.includes("Geen voorkeur") &&
      !answers.diet.some((d) => r.diet.includes(d))
    ) {
      return false
    }

    if (
      answers.goal.length &&
      !answers.goal.includes("Geen specifiek doel") &&
      !answers.goal.some((g) => r.goals.includes(g))
    ) {
      return false
    }

    return true
  })
}