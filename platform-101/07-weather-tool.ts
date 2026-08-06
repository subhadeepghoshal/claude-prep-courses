// A minimal tool-runner agent: one tool, one question, no manual loop.
import "dotenv/config";
import Anthropic from "@anthropic-ai/sdk";
import { betaZodTool } from "@anthropic-ai/sdk/helpers/beta/zod";
import { z } from "zod";

const client = new Anthropic();

const WEATHER: Record<string, { temp_f: number; conditions: string }> = {
    austin: { temp_f: 88, conditions: "sunny" },
    denver: { temp_f: 54, conditions: "snow flurries" },
    seattle: { temp_f: 61, conditions: "light rain" },
};

// Accepts a city, returns its temperature and conditions.
function getWeather(city: string): { temp_f: number; conditions: string } {
    return WEATHER[city.toLowerCase()] ?? { temp_f: 70, conditions: "unknown" };
}

const weatherTool = betaZodTool({
    name: "get_weather",
    description: "Get the current temperature and conditions for a city.",
    inputSchema: z.object({
        city: z.string().describe("The city to get weather for"),
    }),
    run: ({ city }) => JSON.stringify(getWeather(city)),
});

// Uses the tool runner to drive the agentic loop: sends the question,
// lets Claude call get_weather as needed, and returns the final answer.
async function run(question: string): Promise<string> {
    const runner = client.beta.messages.toolRunner({
        model: "claude-sonnet-4-6",
        max_tokens: 1024,
        messages: [{ role: "user", content: question }],
        tools: [weatherTool],
    });

    const finalMessage = await runner.runUntilDone();

    return finalMessage.content
        .filter((block): block is Anthropic.TextBlock => block.type === "text")
        .map((block) => block.text)
        .join("\n");
}

const answer = await run("What's the weather like in Seattle right now?");
console.log(answer);
