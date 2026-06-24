import "dotenv/config";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

const prompt = "Explain Prompt coaching in two sentences";
const models = ["claude-haiku-4-5", "claude-sonnet-4-6", "claude-opus-4-8"];

for (const model of models) {
    const start = Date.now()

    const response = await client.messages.create({
        model,
        max_tokens: 300,
        messages: [{ role: "user", content: prompt }],
    });

    const ms = Date.now() - start
    console.log(`\n[${model}] ${ms}ms in=${response.usage.input_tokens} out=${response.usage.output_tokens}`);

    for (const block of response.content) {
        if (block.type === "text") {
            console.log(block.text);
        }
    }
}
