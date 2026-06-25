import "dotenv/config";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

// Call 1: web search — Anthropic runs the search server-side
const search_response = await client.messages.create({
  model: "claude-opus-4-8",
  max_tokens: 1024,
  tools: [{ type: "web_search_20260209", name: "web_search" }],
  messages: [
    {
      role: "user",
      content:
        "What is Anthropic's latest model release? Answer in one sentence.",
    },
  ],
});

for (const block of search_response.content) {
  if (block.type === "server_tool_use") {
    console.log(`Tool call: ${block.name} — ${JSON.stringify(block.input)}`);
  } else if (block.type === "text") {
    console.log(block.text);
  }
}

// Call 2: code execution — Claude writes and runs Python in a sandbox
const code_response = await client.messages.create({
  model: "claude-opus-4-8",
  max_tokens: 1024,
  tools: [{ type: "code_execution_20260120", name: "code_execution" }],
  messages: [
    {
      role: "user",
      content:
        "Calculate the mean and standard deviation of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]",
    },
  ],
});

for (const block of code_response.content) {
  if (block.type === "server_tool_use") {
    console.log(`Tool call: ${block.name} — ${JSON.stringify(block.input)}`);
  } else if (block.type === "bash_code_execution_tool_result") {
    if ("stdout" in block.content) {
      console.log(`stdout: ${block.content.stdout}`);
    } else if ("error" in block.content) {
      console.log(`Error: ${block.content.error}`);
    }
  } else if (block.type === "text") {
    console.log(block.text);
  }
}
