import { useState, useEffect, useRef } from "react"
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
  "Traditioneel Ontbijt": "/mealyn/assets/traditioneel_ontbijt.png",
  "Gezond Kwart Ontbijt": "/mealyn/assets/gezond_kwart_ontbijt.png",
  "Yoghurt & Fruit Combo": "/mealyn/assets/yoghurt_fruit_combo.png",
  "Pancake & Fruit Ontbijt": "/mealyn/assets/pancake_fruit_ontbijt.png",
  "De Dagelijkse Lunch": "/mealyn/assets/vegan_lunch_box.png",
  "De Fitte Lunch": "/mealyn/assets/koolhydraatarm_lunch.png",
  "De Sterke Lunch": "/mealyn/assets/spieropbouw_lunch.png",
  "De Verse Lunch": "/mealyn/assets/salade_lunch.png",
  "Hartig & Chips": "/mealyn/assets/hartig_chips.png",
  "Gezond Tussendoor": "/mealyn/assets/gezond_tussendoor.png",
  "Zoet & Chocolade": "/mealyn/assets/zoet_chocolade.png",
  "Eiwitrijk Snack Pakket": "/mealyn/assets/eiwitrijk_snack.png",
}

type Phase = "pakket" | "select" | "list" | "search"

const PACKAGE_MEAL_TYPES = ["Ontbijt", "Lunch", "Snacks"]

export default function MealScreen({ answers, onReset, onBack }: Props) {
  const { addItem, removeItem, cart, totalPrice } = useCart()
  const [recipesCart, setRecipesCart] = useState<RecipeCart[]>([])
  const [packages, setPackages] = useState<Package[]>([])
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null)
  const [cartProducts] = useState<CartItem[]>([])
  const [selectedProducts, setSelectedProducts] = useState<{ [key: string]: boolean }>({})
  const [selectedRecipeIds, setSelectedRecipeIds] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [addedFeedback, setAddedFeedback] = useState<string | null>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

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

  const allIngredients: CartItem[] = Object.entries(ingredientPrices as Record<string, { price: number; image: string }>).map(
    ([name, data]) => ({
      id: `ingredient-${name.toLowerCase().replace(/\s+/g, "-")}`,
      name,
      price: data.price,
      image: safeImage(data.image),
      quantity: 1,
    })
  )

  const filteredIngredients = allIngredients.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  useEffect(() => {
    if (phase === "search") {
      setTimeout(() => searchInputRef.current?.focus(), 100)
    }
  }, [phase])

  useEffect(() => {
    if (!activeMealType) return

    if (PACKAGE_MEAL_TYPES.includes(activeMealType)) {
     const matched = (productsData as any[]).filter((p) => {
  if (p.meal_type !== activeMealType) return false
  if (!p.package) return false

  const allergyList = answers.allergy.includes("Geen allergieën") ? [] : answers.allergy
  const dietList = answers.diet.includes("Geen voorkeur") ? [] : answers.diet
  const goalList = answers.goal.includes("Geen specifiek doel") ? [] : answers.goal

  if (allergyList.length > 0) {
    if (allergyList.some((a: string) => p.allergens.includes(a))) return false
  }

  if (dietList.length > 0) {
    if (!dietList.some((d: string) => p.diet.includes(d))) return false
  }

  if (goalList.length > 0) {
    if (!goalList.some((g: string) => p.goal.includes(g))) return false
  }

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
        if (
          answers.diet.length &&
          !answers.diet.includes("Geen voorkeur") &&
          !answers.diet.some((d: string) => r.diet.includes(d))
        ) return false
        if (
          answers.allergy.length &&
          !answers.allergy.includes("Geen allergieën") &&
          answers.allergy.some((a: string) => r.allergens.includes(a))
        ) return false
        if (
          answers.goal.length &&
          !answers.goal.includes("Geen specifiek doel") &&
          !answers.goal.some((g: string) => r.goals.includes(g))
        ) return false
        return true
      })
      const recipeCarts: RecipeCart[] = matchedRecipes.map((recipe: any) => {
        const ingredients: CartItem[] = recipe.ingredients.map((ing: any) => {
          const priceEntry = (ingredientPrices as any)[ing.name] || { price: 0, image: FALLBACK_IMAGE }
          const totalIngredientPrice = parseFloat((priceEntry.price * persons).toFixed(2))
          return {
            id: `ingredient-${ing.name.toLowerCase().replace(/\s+/g, "-")}`,
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

    const allergyList = answers.allergy.includes("Geen allergieën") ? [] : answers.allergy
    const dietList = answers.diet.includes("Geen voorkeur") ? [] : answers.diet

    const ALLERGEN_PRODUCT_MAP: Record<string, string[]> = {
      "Gluten": ["Brood", "Volkoren brood", "Pancakemix", "Crackers", "Stroopwafels", "Koekjes", "Kipfilet wrap"],
      "Lactose/Melk": ["Melk", "Kaas", "Yoghurt", "Boter", "Slagroom", "Kwark", "Feta"],
      "Noten/Pinda": ["Notenmix", "Noten", "Amandelen", "Nootjes"],
      "Ei": ["Ei", "Hardgekookt ei"],
    }

    const VEGAN_EXCLUDED = ["Ham", "Kaas", "Melk", "Ei", "Hardgekookt ei", "Yoghurt", "Boter", "Slagroom", "Kwark", "Feta", "Kipsalade", "Kipfilet", "Kipfilet wrap", "Tonijn", "Eiwitshake"]
    const VEGETARIAN_EXCLUDED = ["Ham", "Kipsalade", "Kipfilet", "Kipfilet wrap", "Tonijn"]

 const activeReasons = [...allergyList, ...dietList]

const resolvedProducts = pkg.products.map((product: any) => {
  const naam = product.name

  const isBlocked =
    allergyList.some((a: string) => {
      const blocked = ALLERGEN_PRODUCT_MAP[a] || []
      return blocked.some((b: string) => naam.toLowerCase().includes(b.toLowerCase()))
    }) ||
    (dietList.includes("Vegan") && VEGAN_EXCLUDED.some((e) => naam.toLowerCase().includes(e.toLowerCase()))) ||
    (dietList.includes("Vegetarisch") && !dietList.includes("Vegan") && VEGETARIAN_EXCLUDED.some((e) => naam.toLowerCase().includes(e.toLowerCase())))

  if (!isBlocked) return product

  const alternative = product.alternatives?.find((alt: any) =>
    alt.for?.some((f: string) => activeReasons.includes(f))
  )

  return alternative ? { name: alternative.name, image: alternative.image } : null
}).filter(Boolean)

const pkgProducts: CartItem[] = resolvedProducts.map((product: any, i: number) => {
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

  const handleAddIngredient = (item: CartItem) => {
    addItem(item)
    setAddedFeedback(item.name)
    setTimeout(() => setAddedFeedback(null), 1500)
  }

  const budget = answers.budget ? parseFloat(answers.budget) : null
  const overBudget = budget !== null && totalPrice > budget

  const headerStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 20px 12px",
    marginBottom: 0,
  }

  // ── ZOEK SCHERM ────────────────────────────────────────────────────
  if (phase === "search") {
    return (
      <div style={{ fontFamily: "sans-serif", maxWidth: 480, margin: "0 auto", backgroundColor: "#fff", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "12px 20px 12px", backgroundColor: "#fff", position: "sticky", top: 0, zIndex: 10, borderBottom: "1px solid #f0f0f0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
            <button
              onClick={() => { setPhase("list"); setSearchQuery("") }}
              style={{
                background: "none", border: "none",
                cursor: "pointer", color: "#2D6A4F", padding: 0,
                display: "flex", alignItems: "center", gap: 6,
                fontSize: "0.95rem", fontWeight: 600,
              }}
            >
              ← Terug naar boodschappenlijst
            </button>
            <h2 style={{ margin: 0, fontSize: "1.3rem", fontWeight: 700, color: "#1A1A18" }}>
              Product toevoegen
            </h2>
            <img src="/mealyn/assets/mealynlogo.png" alt="Mealyn" style={{ height: 40, marginLeft: "auto" }} onError={handleImgError} />
          </div>
          <div style={{ position: "relative", width: "100%" }}>
            <span style={{
              position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)",
              fontSize: "1.1rem", color: "#aaa", pointerEvents: "none", zIndex: 1,
            }}>🔍</span>
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Zoek een product..."
              style={{
                width: "100%",
                padding: "14px 50px 14px 42px",
                borderRadius: 14,
                border: "2px solid #d1e8dc",
                fontSize: "1rem",
                outline: "none",
                boxSizing: "border-box",
                backgroundColor: "#f8fdf9",
                color: "#1A1A18",
              }}
            />
            {searchQuery.length > 0 && (
              <button
                onClick={() => setSearchQuery("")}
                style={{
                  position: "absolute", right: 14, top: "20%", transform: "translateY(-50%)",
                  background: "none", border: "none", fontSize: "1rem",
                  color: "#2D6A4F", cursor: "pointer", padding: 0, lineHeight: 1, zIndex: 2,
                  width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >✕</button>
            )}
          </div>
        </div>

        {addedFeedback && (
          <div style={{
            position: "fixed", top: 16, left: "50%", transform: "translateX(-50%)",
            backgroundColor: "#2D6A4F", color: "white",
            padding: "10px 22px", borderRadius: 24,
            fontWeight: 600, fontSize: "0.95rem",
            zIndex: 999, boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
            pointerEvents: "none",
          }}>
            ✓ {addedFeedback} toegevoegd
          </div>
        )}

        <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px 32px" }}>
          {filteredIngredients.length === 0 ? (
            <p style={{ color: "#888", textAlign: "center", marginTop: 32 }}>Geen producten gevonden.</p>
          ) : (
            filteredIngredients.map((item) => {
              const inCart = cart.find((c) => c.id === item.id)
              return (
                <div
                  key={item.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "12px 4px",
                    borderBottom: "1px solid #f0f0f0",
                  }}
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    onError={handleImgError}
                    style={{ width: 52, height: 52, objectFit: "contain", borderRadius: 8, flexShrink: 0 }}
                  />
                  <div style={{ flexGrow: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: "0.95rem", color: "#1A1A18" }}>{item.name}</div>
                    <div style={{ fontSize: "0.85rem", color: "#666", marginTop: 2 }}>€ {item.price.toFixed(2)}</div>
                  </div>
                  <button
                    onClick={() => handleAddIngredient(item)}
                    style={{
                      width: 36, height: 36, borderRadius: 10,
                      backgroundColor: inCart ? "#e8f5ee" : "#2D6A4F",
                      color: inCart ? "#2D6A4F" : "white",
                      border: inCart ? "2px solid #2D6A4F" : "none",
                      fontSize: "1.3rem", cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontWeight: 700, flexShrink: 0,
                      transition: "background 0.15s",
                    }}
                  >
                    +
                  </button>
                </div>
              )
            })
          )}
        </div>
      </div>
    )
  }

  // ── BOODSCHAPPENLIJST ──────────────────────────────────────────────
  if (phase === "list") {
    return (
      <div style={{ fontFamily: "sans-serif", maxWidth: 480, margin: "0 auto", backgroundColor: "#fff", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 20px 8px" }}>
          <h2 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 700, color: "#1A1A18" }}>Boodschappenlijst</h2>
          <img src="/mealyn/assets/mealynlogo.png" alt="Mealyn" style={{ height: 75 }} onError={handleImgError} />
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", padding: "4px 20px 12px" }}>
          <button
            onClick={() => setPhase("search")}
            title="Product toevoegen"
            style={{
              width: 36, height: 36, borderRadius: 8,
              backgroundColor: "#2D6A4F", color: "white",
              border: "none", fontSize: "1.4rem", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 700,
            }}
          >+</button>
        </div>

        <div style={{ flex: 1, padding: "0 16px", display: "flex", flexDirection: "column" }}>
          {cart.length === 0 && <p style={{ color: "#888", padding: "0 4px" }}>Je boodschappenlijst is leeg.</p>}
          {cart.map((item, index) => (
            <div
              key={item.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "14px 4px",
                borderBottom: index < cart.length - 1 ? "1px solid #f0f0f0" : "none",
              }}
            >
              <button
                onClick={() => removeItem(item.id)}
                style={{
                  width: 28, height: 28, borderRadius: "50%",
                  backgroundColor: "#e53e3e", color: "white",
                  border: "none", fontSize: "1.2rem", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0, lineHeight: 1,
                }}
              >−</button>
              <img
                src={item.image}
                alt={item.name}
                onError={handleImgError}
                style={{ width: 56, height: 56, objectFit: "contain", borderRadius: 6, flexShrink: 0 }}
              />
              <div style={{ flexGrow: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: "1rem", color: "#1A1A18" }}>
                  {item.quantity > 1 && (
                    <span style={{ color: "#2D6A4F", marginRight: 6 }}>{item.quantity}x</span>
                  )}
                  {item.name}
                </div>
              </div>
              <div style={{ fontWeight: 500, fontSize: "1rem", color: "#1A1A18", flexShrink: 0 }}>
                € {(item.price * item.quantity).toFixed(2)}
              </div>
            </div>
          ))}
        </div>

        <div style={{ padding: "16px 20px 24px", borderTop: "1px solid #f0f0f0", marginTop: 8 }}>
          {budget !== null && (
            <div style={{ marginBottom: 4, fontSize: "0.9rem", color: "#666" }}>
              Budget: € {budget.toFixed(2)}
            </div>
          )}
          <div style={{ marginBottom: 16, fontWeight: 600, fontSize: "1rem", color: overBudget ? "red" : "#1A1A18" }}>
            Totaal: € {totalPrice.toFixed(2)}
            {overBudget && (
              <span style={{ fontSize: "0.85rem", marginLeft: 8, color: "red" }}>
                (€ {(totalPrice - budget!).toFixed(2)} boven budget)
              </span>
            )}
          </div>
          <button
            onClick={onReset}
            style={{
              width: "100%", padding: "16px", border: "none",
              borderRadius: 14, backgroundColor: "#2D6A4F",
              color: "white", fontWeight: 700, fontSize: "1.1rem", cursor: "pointer",
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
                    style={{ width: 56, height: 56, objectFit: "contain", borderRadius: 8 }}
                  />
                  <div style={{ flexGrow: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: "0.95rem" }}>{item.name}</div>
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