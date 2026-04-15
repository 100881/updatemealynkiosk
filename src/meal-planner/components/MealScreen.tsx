import { useState, useEffect } from "react"
import productsData from "../data/products.json"
import recipesData from "../data/recipes.json"
import ingredientPrices from "../data/ingredientPrices.json"
import type { Answers } from "../utils/matchRecipes"
import { useCart } from "../context/CartContext"

interface Props {
  answers: Answers
  onReset?: () => void
  onAddMore?: () => void
  onBack?: () => void
}

interface CartItem {
  id: string
  name: string
  price: number
  image: string
  quantity: number
  brand?: string
}

interface RecipeCart {
  id: string
  name: string
  image: string
  ingredients: CartItem[]
}

interface Package {
  id: string
  name: string
  image: string
  price: number
  products: { name: string; image: string }[]
  meal_type: string
}

const FALLBACK_IMAGE = "/assets/klassiek.png"
const safeImage = (img?: string) => (img && img.trim() !== "" ? img : FALLBACK_IMAGE)
const handleImgError = (e: React.SyntheticEvent<HTMLImageElement>) => {
  const target = e.currentTarget
  if (target.src !== window.location.origin + FALLBACK_IMAGE) target.src = FALLBACK_IMAGE
}

const packageImages: Record<string, string> = {
  "Boterham Klassiek": "/mealyn/assets/klassiek.png",
  "Zoet & Hartig": "/mealyn/assets/klassiek.png",
  "Gezond Belegd": "/mealyn/assets/klassiek.png",
  "Mix Pakket": "/mealyn/assets/klassiek.png",
}

type Phase = "pakket" | "select" | "list"

const PACKAGE_MEAL_TYPES = ["Ontbijt", "Lunch", "Snacks"]

export default function MealScreen({ answers, onReset, onAddMore, onBack }: Props) {
  const { addItem, removeItem, cart, totalPrice } = useCart()
  const [recipesCart, setRecipesCart] = useState<RecipeCart[]>([])
  const [packages, setPackages] = useState<Package[]>([])
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null)
  const [cartProducts] = useState<CartItem[]>([])
  const [selectedProducts, setSelectedProducts] = useState<{ [key: string]: boolean }>({})
  const [selectedRecipeIds, setSelectedRecipeIds] = useState<string[]>([])

  const mealTypes = Array.isArray(answers.mealType) ? answers.mealType : [answers.mealType]
  const [currentMealTypeIndex, setCurrentMealTypeIndex] = useState(0)
  const activeMealType = mealTypes[currentMealTypeIndex]

  const [phase, setPhase] = useState<Phase>(
    PACKAGE_MEAL_TYPES.includes(mealTypes[0]) ? "pakket" : "select"
  )

  const maxRecipes = answers.days
    ? parseInt(answers.days.replace(/[^0-9]/g, "")) || 1
    : 1

  const mealLabel: Record<string, string> = {
    Ontbijt: "ontbijt",
    Lunch: "lunch",
    Snacks: "snack",
  }

  useEffect(() => {
    if (!activeMealType) return

    if (PACKAGE_MEAL_TYPES.includes(activeMealType)) {
      const matched = (productsData as any[]).filter((p) => {
        if (p.meal_type !== activeMealType) return false
        if (!p.package) return false
        if (answers.diet.length && !answers.diet.includes("Geen voorkeur") && !answers.diet.some((d: string) => p.diet.includes(d))) return false
        if (answers.allergy.length && !answers.allergy.includes("Geen allergieën") && answers.allergy.some((a: string) => p.allergens.includes(a))) return false
        if (answers.goal.length && !answers.goal.includes("Geen specifiek doel") && !answers.goal.some((g: string) => p.goal.includes(g))) return false
        return true
      })
      setPackages(matched.map((p: any) => ({
        id: p.id.toString(),
        name: p.name,
        image: packageImages[p.name] || safeImage(p.image),
        price: p.price,
        products: p.products || [],
        meal_type: p.meal_type,
      })))
      return
    }

    if (activeMealType === "Avondeten") {
      const persons = parseInt(answers.persons === "4+" ? "4" : answers.persons || "1")
      const matchedRecipes = (recipesData as any[]).filter((r) => {
        if (r.mealType !== "Avondeten") return false
        if (answers.diet.length && !answers.diet.includes("Geen voorkeur") && !answers.diet.some((d: string) => r.diet.includes(d))) return false
        if (answers.allergy.length && !answers.allergy.includes("Geen allergieën") && answers.allergy.some((a: string) => r.allergens.includes(a))) return false
        if (answers.goal.length && !answers.goal.includes("Geen specifiek doel") && !answers.goal.some((g: string) => r.goals.includes(g))) return false
        return true
      })
      const recipeCarts: RecipeCart[] = matchedRecipes.map((recipe: any) => {
        const ingredients: CartItem[] = recipe.ingredients.map((ing: any, index: number) => {
          const priceEntry = (ingredientPrices as any)[ing.name] || { price: 0, image: FALLBACK_IMAGE }
          const totalIngredientPrice = parseFloat((priceEntry.price * persons).toFixed(2))
          return {
            id: `${recipe.id}-${ing.name}-${index}`,
            name: ing.name,
            price: totalIngredientPrice,
            image: safeImage(ing.image || priceEntry.image),
            quantity: 1,
          }
        })
        return {
          id: recipe.id.toString(),
          name: recipe.name,
          image: safeImage(recipe.image),
          ingredients,
        }
      })
      setRecipesCart(recipeCarts)
    }
  }, [activeMealType])

  const goToNextMealType = () => {
    const nextIndex = currentMealTypeIndex + 1
    if (nextIndex < mealTypes.length) {
      setCurrentMealTypeIndex(nextIndex)
      const nextMeal = mealTypes[nextIndex]
      setSelectedPackage(null)
      setSelectedRecipeIds([])
      setPhase(PACKAGE_MEAL_TYPES.includes(nextMeal) ? "pakket" : "select")
    } else {
      setPhase("list")
    }
  }

  const handleSelectPackage = (pkg: Package) => {
    setSelectedPackage(pkg)
    const pkgProducts: CartItem[] = pkg.products.map((product, i) => {
      const found = (productsData as any[]).find(
        (p) => p.name.toLowerCase() === product.name.toLowerCase()
      ) || (productsData as any[]).find(
        (p) =>
          p.name.toLowerCase().includes(product.name.toLowerCase()) ||
          product.name.toLowerCase().includes(p.name.toLowerCase())
      )
      return {
        id: found ? found.id.toString() : `pkg-${pkg.id}-${i}`,
        name: product.name,
        price: found ? found.price : 0,
        image: safeImage(product.image || found?.image),
        quantity: 1,
        brand: found?.brand || "",
      }
    })
    pkgProducts.forEach((item) => addItem(item))
    goToNextMealType()
  }

  const toggleRecipe = (recipe: RecipeCart) => {
    if (selectedRecipeIds.includes(recipe.id)) {
      setSelectedRecipeIds((prev) => prev.filter((id) => id !== recipe.id))
    } else {
      if (selectedRecipeIds.length >= maxRecipes) return
      setSelectedRecipeIds((prev) => [...prev, recipe.id])
    }
  }

  const handleAddSelectedRecipes = () => {
    recipesCart
      .filter((r) => selectedRecipeIds.includes(r.id))
      .forEach((recipe) => recipe.ingredients.forEach((ing) => addItem(ing)))
    goToNextMealType()
  }

  const toggleSelectProduct = (id: string) => {
    setSelectedProducts((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const handleGaVerder = () => {
    if (selectedPackage) {
      addItem({
        id: `pakket-${selectedPackage.id}`,
        name: selectedPackage.name,
        price: selectedPackage.price,
        image: selectedPackage.image,
        quantity: 1,
      })
    }
    cartProducts.forEach((item) => {
      if (selectedProducts[item.id]) addItem(item)
    })
    goToNextMealType()
  }

  const budget = answers.budget ? parseFloat(answers.budget) : null
  const overBudget = budget !== null && totalPrice > budget

  const headerStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 20px",
    borderBottom: "1px solid #eee",
    marginBottom: 16,
  }

  // ── BOODSCHAPPENLIJST ──────────────────────────────────────────────
  if (phase === "list") {
    return (
      <div style={{ fontFamily: "sans-serif", maxWidth: 480, margin: "0 auto" }}>
        <div style={headerStyle}>
          <h2 style={{ margin: 0, fontSize: "1.1rem" }}>Boodschappenlijst</h2>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button
              onClick={() => onAddMore?.()}
              title="Meer toevoegen"
              style={{
                width: 32, height: 32, borderRadius: "50%",
                backgroundColor: "#2D6A4F", color: "white",
                border: "none", fontSize: "1.3rem", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >+</button>
            <img src="/mealyn/assets/mealynlogo.png" alt="Mealyn" style={{ height: 32 }} onError={handleImgError} />
          </div>
        </div>

        <div style={{ padding: "0 20px", display: "flex", flexDirection: "column", gap: 10 }}>
          {cart.length === 0 && <p style={{ color: "#888" }}>Je boodschappenlijst is leeg.</p>}
          {cart.map((item) => (
            <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <button
                onClick={() => removeItem(item.id)}
                style={{
                  width: 26, height: 26, borderRadius: "50%",
                  backgroundColor: "#e53e3e", color: "white",
                  border: "none", fontSize: "1.1rem", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}
              >−</button>
              <img
                src={item.image}
                alt={item.name}
                onError={handleImgError}
                style={{ width: 48, height: 48, objectFit: "cover", borderRadius: 8 }}
              />
              <div style={{ flexGrow: 1 }}>
                <div style={{ fontWeight: 600, fontSize: "0.95rem" }}>{item.name}</div>
              </div>
              <div style={{ fontWeight: 600 }}>€{item.price.toFixed(2)}</div>
            </div>
          ))}
        </div>

        <div style={{ padding: 20, marginTop: 8 }}>
          {budget !== null && (
            <div style={{ marginBottom: 6, fontSize: "0.9rem", color: "#666" }}>
              Budget: €{budget.toFixed(2)}
            </div>
          )}
          <div style={{ marginBottom: 12, fontWeight: 600, color: overBudget ? "red" : "#1A1A18" }}>
            Totaal: €{totalPrice.toFixed(2)}
            {overBudget && (
              <span style={{ fontSize: "0.85rem", marginLeft: 8, color: "red" }}>
                (€{(totalPrice - budget!).toFixed(2)} boven budget)
              </span>
            )}
          </div>
          <button
            onClick={onReset}
            style={{
              width: "100%", padding: "0.9rem", border: "none",
              borderRadius: 12, backgroundColor: "#2D6A4F",
              color: "white", fontWeight: 700, fontSize: "1rem", cursor: "pointer",
            }}
          >
            Klaar
          </button>
        </div>
      </div>
    )
  }

  // ── PAKKET SELECTIE ────────────────────────────────────────────────
  if (phase === "pakket") {
    return (
      <div style={{ fontFamily: "sans-serif", maxWidth: 480, margin: "0 auto" }}>
        <div style={headerStyle}>
          <div>
            <h2 style={{ margin: 0, fontSize: "1.1rem" }}>
              Selecteer {activeMealType.toLowerCase()}pakket
            </h2>
            <p style={{ margin: 0, fontSize: "0.85rem", color: "#666" }}>
              Selecteer 1 {mealLabel[activeMealType] || activeMealType.toLowerCase()}pakket
            </p>
          </div>
          <img src="/mealyn/assets/mealynlogo.png" alt="Mealyn" style={{ height: 32 }} onError={handleImgError} />
        </div>

        <div style={{ padding: "0 20px", display: "flex", flexDirection: "column", gap: 10 }}>
          {packages.length === 0 && (
            <p style={{ color: "#888" }}>Geen pakketten gevonden voor jouw voorkeuren.</p>
          )}
          {packages.map((pkg) => {
            const isSelected = selectedPackage?.id === pkg.id
            return (
              <div
                key={pkg.id}
                onClick={() => handleSelectPackage(pkg)}
                style={{
                  position: "relative", borderRadius: 12, overflow: "hidden",
                  cursor: "pointer",
                  border: isSelected ? "3px solid #2D6A4F" : "3px solid transparent",
                  height: 90,
                }}
              >
                <img
                  src={pkg.image} alt={pkg.name} onError={handleImgError}
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                />
                <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.25)" }} />
                <div style={{
                  position: "absolute", top: 10, left: 10,
                  width: 20, height: 20, borderRadius: 4, border: "2px solid white",
                  backgroundColor: isSelected ? "#2D6A4F" : "rgba(255,255,255,0.3)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {isSelected && (
                    <span style={{ color: "white", fontSize: 13, lineHeight: 1, fontWeight: 700 }}>✓</span>
                  )}
                </div>
                <div style={{
                  position: "absolute", inset: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <span style={{
                    backgroundColor: "rgba(255,255,255,0.88)", color: "#1A1A18",
                    fontWeight: 600, fontSize: "1rem", padding: "5px 18px", borderRadius: 20,
                  }}>
                    {pkg.name} — €{pkg.price.toFixed(2)}
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        <div style={{ padding: "20px", marginTop: 8 }}>
          <button
            onClick={() => onBack?.()}
            style={{
              width: "100%", padding: "12px", border: "none",
              borderRadius: 12, backgroundColor: "#2D6A4F",
              color: "white", fontWeight: 700, fontSize: "1rem", cursor: "pointer",
            }}
          >
            ← Terug
          </button>
        </div>
      </div>
    )
  }

  // ── RECEPT / PRODUCT SELECTIE ──────────────────────────────────────
  return (
    <div style={{ fontFamily: "sans-serif", maxWidth: 480, margin: "0 auto" }}>
      <div style={headerStyle}>
        <div>
          <h2 style={{ margin: 0, fontSize: "1.1rem" }}>
            {activeMealType === "Avondeten" ? "Avondeten" : selectedPackage?.name || activeMealType}
          </h2>
          <p style={{ margin: 0, fontSize: "0.85rem", color: "#666" }}>
            {activeMealType === "Avondeten"
              ? `Kies ${maxRecipes} recept${maxRecipes > 1 ? "en" : ""}`
              : "Selecteer wat je wilt toevoegen"}
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {PACKAGE_MEAL_TYPES.includes(activeMealType) && (
            <button
              onClick={() => { setSelectedPackage(null); setPhase("pakket") }}
              style={{
                fontSize: "0.8rem", color: "#2D6A4F", background: "none",
                border: "none", cursor: "pointer", textDecoration: "underline",
              }}
            >
              ← Pakket wijzigen
            </button>
          )}
          <img src="/mealyn/assets/mealynlogo.png" alt="Mealyn" style={{ height: 32 }} onError={handleImgError} />
        </div>
      </div>

      {budget !== null && (
        <div style={{
          margin: "0 20px 12px", padding: "8px 14px", borderRadius: 10,
          backgroundColor: overBudget ? "#fff0f0" : "#f0faf5",
          border: `1px solid ${overBudget ? "#ffcccc" : "#b7e4c7"}`,
          fontSize: "0.9rem", color: overBudget ? "red" : "#2D6A4F", fontWeight: 600,
        }}>
          Budget: €{budget.toFixed(2)} — Totaal: €{totalPrice.toFixed(2)}
          {overBudget && ` (€${(totalPrice - budget).toFixed(2)} over)`}
        </div>
      )}

      <div style={{ padding: "0 20px", display: "flex", flexDirection: "column", gap: 12 }}>
        {activeMealType === "Avondeten" ? (
          recipesCart.length === 0 ? (
            <p style={{ color: "#888" }}>Geen recepten gevonden.</p>
          ) : (
            <>
              <div style={{
                textAlign: "center", padding: "8px 14px", borderRadius: 10,
                backgroundColor: "#f0faf5", border: "1px solid #b7e4c7",
                fontSize: "0.9rem", color: "#2D6A4F", fontWeight: 600, marginBottom: 4,
              }}>
                {selectedRecipeIds.length} van {maxRecipes} recept{maxRecipes > 1 ? "en" : ""} gekozen
              </div>

              {recipesCart.map((recipe) => {
                const isSelected = selectedRecipeIds.includes(recipe.id)
                const isDisabled = !isSelected && selectedRecipeIds.length >= maxRecipes
                return (
                  <div
                    key={recipe.id}
                    onClick={() => !isDisabled && toggleRecipe(recipe)}
                    style={{
                      borderRadius: 12,
                      border: isSelected ? "2px solid #2D6A4F" : "1px solid #ddd",
                      overflow: "hidden", background: "white",
                      cursor: isDisabled ? "not-allowed" : "pointer",
                      opacity: isDisabled ? 0.45 : 1,
                      transition: "opacity 0.2s, border 0.2s",
                    }}
                  >
                    <div style={{ position: "relative" }}>
                      <img
                        src={recipe.image} alt={recipe.name} onError={handleImgError}
                        style={{ width: "100%", height: 160, objectFit: "cover", display: "block" }}
                      />
                      {isSelected && (
                        <div style={{
                          position: "absolute", top: 10, right: 10,
                          width: 28, height: 28, borderRadius: "50%",
                          backgroundColor: "#2D6A4F",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          color: "white", fontSize: "1rem", fontWeight: 700,
                        }}>✓</div>
                      )}
                    </div>
                    <div style={{ padding: "10px 14px 14px" }}>
                      <h3 style={{ margin: 0, fontSize: "1rem" }}>{recipe.name}</h3>
                    </div>
                  </div>
                )
              })}

              <button
                onClick={handleAddSelectedRecipes}
                disabled={selectedRecipeIds.length !== maxRecipes}
                style={{
                  width: "100%", padding: "0.9rem", border: "none",
                  borderRadius: 12, marginTop: 8,
                  backgroundColor: selectedRecipeIds.length !== maxRecipes ? "#ccc" : "#2D6A4F",
                  color: "white", fontWeight: 700, fontSize: "1rem",
                  cursor: selectedRecipeIds.length !== maxRecipes ? "not-allowed" : "pointer",
                }}
              >
                {selectedRecipeIds.length === maxRecipes
                  ? "Voeg toe aan boodschappenlijst →"
                  : `Nog ${maxRecipes - selectedRecipeIds.length} recept${maxRecipes - selectedRecipeIds.length > 1 ? "en" : ""} te kiezen`}
              </button>
            </>
          )
        ) : (
          cartProducts.length === 0 ? (
            <p style={{ color: "#888" }}>Geen producten gevonden.</p>
          ) : (
            <>
              {cartProducts.map((item) => (
                <div
                  key={item.id}
                  onClick={() => toggleSelectProduct(item.id)}
                  style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "10px 14px", borderRadius: 12,
                    border: selectedProducts[item.id] ? "2px solid #2D6A4F" : "1px solid #ddd",
                    background: "white", cursor: "pointer",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={!!selectedProducts[item.id]}
                    onChange={() => {}}
                    style={{ accentColor: "#2D6A4F", width: 18, height: 18 }}
                  />
                  <img
                    src={item.image} alt={item.name} onError={handleImgError}
                    style={{ width: 52, height: 52, objectFit: "cover", borderRadius: 8 }}
                  />
                  <div style={{ flexGrow: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: "0.95rem" }}>{item.name}</div>
                    {item.brand && <div style={{ fontSize: "0.8rem", color: "#888" }}>{item.brand}</div>}
                  </div>
                  <div style={{ fontWeight: 600, color: "#2D6A4F" }}>€{item.price.toFixed(2)}</div>
                </div>
              ))}

              <button
                onClick={handleGaVerder}
                style={{
                  width: "100%", padding: "0.9rem", border: "none",
                  borderRadius: 12, marginTop: 8, backgroundColor: "#2D6A4F",
                  color: "white", fontWeight: 700, fontSize: "1rem", cursor: "pointer",
                }}
              >
                Ga verder →
              </button>
            </>
          )
        )}
      </div>
    </div>
  )
}