import express from "express";
import cors from "cors";
import OpenAI from "openai";

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.post("/generate-recipe", async (req, res) => {
  const { answers } = req.body;

  try {
    const prompt = `
    Je bent een slimme maaltijdplanner. 
    Kies één recept op basis van deze antwoorden:
    ${JSON.stringify(answers)}
    Geef output in JSON-formaat: { "name": "...", "ingredients": ["...", "..."] }
    `;
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
    });

    const responseText = completion.choices[0].message.content;
    const recipe = JSON.parse(responseText);

    res.json({ recipe });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "AI kon geen recept genereren" });
  }
});

app.listen(5000, () => console.log("Server running on port 5000"));