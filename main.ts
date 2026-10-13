import Groq from "groq-sdk";

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function main() {
  const compliments = await client.chat.completions.create({
    model: "qwen/qwen3.8-27b",
    temperature: 0,
    messages: [
      {
        role: "system",
        content: "You are a helpful assistant that provides compliments.",
      },
      {
        role: "user",
        content: "when was iphone 18 released?",
      },
    ],
  });

  console.log(compliments.choices[0].message);
}

main();
