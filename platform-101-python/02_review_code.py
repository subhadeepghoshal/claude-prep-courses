from dotenv import load_dotenv
load_dotenv()

import anthropic

client = anthropic.Anthropic()

buggy_code = """
function add(a, b) {
  return a + b;
}
"""

response = client.messages.create(
    model="claude-opus-4-8",
    max_tokens=1024,
    system="You are a terse senior code reviewer. Give feedback in one paragraph.",
    messages=[
        {"role": "user", "content": f"Review this code:\n{buggy_code}"},
    ],
)

for block in response.content:
    if block.type == "text":
        print(block.text)
