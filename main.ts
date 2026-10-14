import { tavily } from "@tavily/core";
import Groq from "groq-sdk";

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });
const tavilyClient = tavily({ apiKey: process.env.TAVILY_API_KEY });

async function main() {
  const messages = [
    {
      role: "system",
      content:
        "You are a helpful assistant that provides compliments. You have to access to following tools: 1. webSearch({query}:{query: string}) => string. You can use this tool to search the latest information and realtime data on the web. Try to anser small and simple questions by yourself, and use the tool only when necessary.",
    },
    {
      role: "user",
      content: "when was iphone 18 released?",
    },
  ];

  const compliments = await client.chat.completions.create({
    model: "qwen/qwen3.8-27b",
    temperature: 0,
    messages: messages,
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

  messages.push(compliments.choices[0].message);

  const toolCall = compliments.choices[0].message.tool_calls;

  if (!toolCall || toolCall.length === 0) {
    console.log("Assistance: " + compliments.choices[0].message.content);
    return;
  }
  for (const call of toolCall) {
    console.log("Tool Call: " + JSON.stringify(call));
    const functionName = call.function.name;
    const functionArgs = call.function.arguments;

    if (functionName === "webSearch") {
      const searchResult = await webSearch(JSON.parse(functionArgs));
      messages.push({
        tool_call_id: call.id,
        role: "tool",
        name: functionName,
        content: searchResult,
      });
    }
  }

  const compliments2 = await client.chat.completions.create({
    model: "qwen/qwen3.8-27b",
    temperature: 0,
    messages: messages,
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

  console.log(compliments2.choices[0].message);
}

main();

async function webSearch({ query }: { query: string }) {
  console.log("Searching the web for: " + query);
  const searchResults = await tavilyClient.search(query);
  const topResult = searchResults.results
    .map((result) => result.content)
    .join("\n");
  return topResult;
}
