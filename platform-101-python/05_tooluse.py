import json

from dotenv import load_dotenv
load_dotenv()

import anthropic
from anthropic import beta_tool

client = anthropic.Anthropic()

WEATHER = {
    "austin": {"temp_f": 88, "conditions": "sunny"},
    "denver": {"temp_f": 54, "conditions": "snow_flurries"},
}

FORECAST = {
    "denver": [
        {"day": "Tue", "high": 48, "low": 28},
        {"day": "Wed", "high": 52, "low": 30},
        {"day": "Thu", "high": 60, "low": 35},
    ],
}


@beta_tool
def get_weather(city: str) -> str:
    """Get the current weather for a city.

    Args:
        city: The city to get weather for.
    """
    return json.dumps(WEATHER.get(city.lower(), {"error": "unkown city"}))


@beta_tool
def get_forecast(city: str) -> str:
    """Get the multi-day forecast for a city.

    Args:
        city: The city to get the forecast for.
    """
    return json.dumps(FORECAST.get(city.lower(), {"error": "unkown city"}))


runner = client.beta.messages.tool_runner(
    model="claude-sonnet-4-6",
    max_tokens=1024,
    messages=[
        {
            "role": "user",
            "content": "I'm packing for a three-day trip to Denver. What's the weather today and over the next few days?",
        },
    ],
    tools=[get_weather, get_forecast],
)

# Iterating the runner drives the tool-call loop; the last message yielded
# is the final assistant message after all the tool ping-pong has settled.
final_message = None
for message in runner:
    final_message = message

for block in final_message.content:
    if block.type == "text":
        print(block.text)
