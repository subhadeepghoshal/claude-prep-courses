// The same two lookups we ran by hand — just plain TypeScript functions
import "dotenv/config";
import Anthropic from "@anthropic-ai/sdk";
import { betaZodTool } from "@anthropic-ai/sdk/helpers/beta/zod";
import { z } from "zod";

const client = new Anthropic();

const WEATHER: Record<string, {
    temp_f: number;
    conditions: string
}> = {
    austin: { temp_f: 88, conditions: "sunny" },
    denver: { temp_f: 54, conditions: "snow_flurries" },
}

const FORECAST: Record<string, {
    day: string;
    high: number;
    low:number
}[]> = {
    denver: [
        { day: "Tue", high: 48,low:28 },
        { day: "Wed", high: 52,low:30 },
        { day: "Thu", high: 60,low:35 },
    ],
}

const getWeather = betaZodTool({
    name: "get_weather",
    description: "Get the current weather for a city.",
    inputSchema: z.object({
        city: z.string().describe("The city to get weather for"),
    }),
    run: ({ city }) => JSON.stringify(WEATHER[city.toLocaleLowerCase()] ?? { error: "unkown city" }),
});

const getForecast = betaZodTool({
    name: "get_forecast",
    description: "Get the multi-day forecast for a city.",
    inputSchema: z.object({
        city: z.string().describe("The city to get the forecast for"),
    }),
    run: ({ city }) => JSON.stringify(FORECAST[city.toLocaleLowerCase()] ?? { error: "unkown city" }),
});

const runner = client.beta.messages.toolRunner({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    messages: [
        {
            role: "user",
            content:
                "I'm packing for a three-day trip to Denver. What's the weather today and over the next few days?",
        },
    ],
    tools: [getWeather, getForecast],
});

// Returns the final assistant message after all the tool ping-pong has settled
const finalMessage = await runner.runUntilDone();

for (const block of finalMessage.content) {
    if (block.type === "text") {
        console.log(block.text);
    }
}
