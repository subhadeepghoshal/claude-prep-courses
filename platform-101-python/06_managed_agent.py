# The smallest possible managed agent: Anthropic runs the agentic loop and
# the sandbox for us — we just create it, kick it off, and read the event stream.
from dotenv import load_dotenv
load_dotenv()

import anthropic

client = anthropic.Anthropic()

# 1. Create the agent (a reusable, versioned config — model/system/tools live here)
agent = client.beta.agents.create(
    name="Smallest Agent",
    model="claude-sonnet-4-6",
)

# 2. Create the environment (the sandboxed container the agent's tools run in)
environment = client.beta.environments.create(
    name="smallest-agent-env",
    config={"type": "cloud", "networking": {"type": "unrestricted"}},
)

# 3. Start a session — this is the actual run, referencing both by ID
session = client.beta.sessions.create(
    agent=agent.id,
    environment_id=environment.id,
)
print(f"Trace: https://platform.claude.com/workspaces/default/sessions/{session.id}")

# 4. Open the event stream *before* sending the kickoff message, so nothing is missed
with client.beta.sessions.events.stream(session_id=session.id) as stream:
    client.beta.sessions.events.send(
        session_id=session.id,
        events=[
            {
                "type": "user.message",
                "content": [
                    {
                        "type": "text",
                        "text": "Create a file in the temp directory, count its lines, and report back.",
                    }
                ],
            },
        ],
    )

    # 5. Consume the stream as Anthropic runs the loop and reports back
    for event in stream:
        if event.type == "agent.message":
            for block in event.content:
                if block.type == "text":
                    print(block.text)
        elif event.type == "session.status_idle":
            break
