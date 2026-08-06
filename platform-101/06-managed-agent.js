// The smallest possible managed agent: Anthropic runs the agentic loop and
// the sandbox for us — we just create it, kick it off, and read the event stream.
import "dotenv/config";
import Anthropic from "@anthropic-ai/sdk";
const client = new Anthropic();
// 1. Create the agent (a reusable, versioned config — model/system/tools live here)
const agent = await client.beta.agents.create({
    name: "Smallest Agent",
    model: "claude-sonnet-4-6",
});
// 2. Create the environment (the sandboxed container the agent's tools run in)
const environment = await client.beta.environments.create({
    name: "smallest-agent-env",
    config: { type: "cloud", networking: { type: "unrestricted" } },
});
// 3. Start a session — this is the actual run, referencing both by ID
const session = await client.beta.sessions.create({
    agent: agent.id,
    environment_id: environment.id,
});
console.log(`Trace: https://platform.claude.com/workspaces/default/sessions/${session.id}`);
// 4. Open the event stream *before* sending the kickoff message, so nothing is missed
const stream = await client.beta.sessions.events.stream(session.id);
await client.beta.sessions.events.send(session.id, {
    events: [
        {
            type: "user.message",
            "content": [
                {
                    "type": "text",
                    "text": "Create a file in the temp directory, count its lines, and report back.",
                }
            ],
        },
    ],
});
// 5. Consume the stream as Anthropic runs the loop and reports back
for await (const event of stream) {
    if (event.type === "agent.message") {
        for (const block of event.content) {
            if (block.type === "text")
                console.log(block.text);
        }
    }
    else if (event.type === "session.status_idle") {
        break;
    }
}
