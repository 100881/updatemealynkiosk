import prices from "../data/ingredientPrices.json"

export function calculateIngredientPrice(
  name: string,
  amount: number
): { price: number; image: string } {
  const item = (prices as Record<string, { price: number; image: string }>)[name]

  if (!item) return { price: 0, image: "/testimg.jpg" }

  return {
    price: parseFloat((item.price * amount).toFixed(2)),
    image: item.image
  }
}