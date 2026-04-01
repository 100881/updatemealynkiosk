import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

export default defineConfig({
  base: "/mealyn/", // <- belangrijk voor deployment in submap
  plugins: [react()],
})