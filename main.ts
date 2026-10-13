import Groq from "groq-sdk";

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function main() {
  const compliments = await client.chat.completions.create({
    model: "qwen/qwen3.8-27b",
    temperature: 0,
    messages: [
      {
        role: "system",
        content:
          "You are a helpful assistant that provides compliments. You have to access to following tools: 1. webSearch({query}:{query: string}) => string. You can use this tool to search the latest information and realtime data on the web.",
      },
      {
        role: "user",
        content: "when was iphone 18 released?",
      },
    ],
    tools: [
      {
        type: "function",
        function: {
          name: "webSearch",
          description:
            "Search the latest information and realtime data on the web.",
          parameters: {
            type: "object",
            properties: {
              query: {
                type: "string",
                description: "The search query to look up on the web.",
              },
            },
            required: ["query"],
          },
        },
      },
    ],
    tool_choice: "auto",
  });

  console.log(compliments.choices[0].message);
}

main();

async function webSearch({ query }: { query: string }) {
  return "Iphone 18 was released on September 12, 2026.";
}
