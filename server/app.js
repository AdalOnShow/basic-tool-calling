import express from "express";
import { generate } from "./chatboat.js";

const app = express();
const port = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Hello, World!");
});
app.use(express.json());

app.post("/chat", async (req, res) => {
  const userMessage = req.body.message;
  const response = await generate(userMessage);
  res.json({ response });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
