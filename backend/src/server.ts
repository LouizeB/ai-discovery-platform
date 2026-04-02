import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { classifyProject } from "./ai.js";
import { calculateScore, applyRules } from "./decisionEngine.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.post("/analyze", async (req, res) => {
  try {
    const { description } = req.body;

    if (!description || typeof description !== "string") {
      res.status(400).json({ error: "A valid 'description' field is required." });
      return;
    }

    const aiData = await classifyProject(description);
    const score = calculateScore(aiData);
    const decision = applyRules(aiData, score);

    res.json({
      input: aiData,
      score,
      flow: decision.flow,
      stage: decision.stage,
    });
  } catch (error) {
    console.error("Error in /analyze:", error);
    const message =
      error instanceof Error ? error.message : "Internal server error";
    res.status(500).json({ error: message });
  }
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`AI Discovery Platform backend running on port ${PORT}`);
});
