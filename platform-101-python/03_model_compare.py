import time

from dotenv import load_dotenv
load_dotenv()

import anthropic

client = anthropic.Anthropic()

prompt = "Explain Prompt coaching in two sentences"
models = ["claude-haiku-4-5", "claude-sonnet-4-6", "claude-opus-4-8"]

for model in models:
    start = time.monotonic()

    response = client.messages.create(
        model=model,
        max_tokens=300,
        messages=[{"role": "user", "content": prompt}],
    )

    ms = (time.monotonic() - start) * 1000
    print(f"\n[{model}] {ms:.0f}ms in={response.usage.input_tokens} out={response.usage.output_tokens}")

    for block in response.content:
        if block.type == "text":
            print(block.text)
