import readline from "node:readline/promises";
import { tavily } from "@tavily/core";
import Groq from "groq-sdk";

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });
const tavilyClient = tavily({ apiKey: process.env.TAVILY_API_KEY });

async function main() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const messages = [
    {
      role: "system",
      content: `You are a helpful assistant that provides compliments. Answer users question with most simple and direct answers possible. And do not use any formatting only answer with plain text. If you don't know the answer, you can use the webSearch tool to find the answer.
      You have to access to following tools: 
      1. webSearch({query}:{query: string}) => string. You can use this tool to search the latest information and realtime data on the web. Try to anser small and simple questions by yourself, and use the tool only when necessary.
      2. current datetime: ${new Date().toUTCString()}. if anyone asks for the current date and time, you can provide it directly without using any tools. You must answer in user readable format.`,
    },
  ];

  while (true) {
    const userInput = await rl.question("User: ");
    if (userInput.toLowerCase() === "exit") {
      console.log("Exiting...");
      break;
    }
    messages.push({ role: "user", content: userInput });
    while (true) {
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
        const assistantMessage = compliments.choices[0].message.content;
        console.log("Assistant: " + assistantMessage);
        break;
      }

      for (const call of toolCall) {
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
    }
  }

  rl.close();
}

main();

async function webSearch({ query }: { query: string }) {
  console.log("Searching the web for: " + query + "...");
  const searchResults = await tavilyClient.search(query);
  const topResult = searchResults.results
    .map((result) => result.content)
    .join("\n");
  return topResult;
}
