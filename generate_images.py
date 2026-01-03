#!/usr/bin/env python3
"""Generate D&D adventure images using OpenAI DALL-E API."""

import base64
import requests
from openai import OpenAI

client = OpenAI()  # Set OPENAI_API_KEY env var

IMAGES = {
    "mountains.png": "Rocky mountain path in fantasy style, mysterious atmosphere, dungeons and dragons aesthetic, dramatic lighting, no text",
    "rat-cave.png": "Dark cave entrance with glowing eyes in the darkness, ominous fantasy art, dungeons and dragons style, dramatic lighting, no text",
    "rat-swarm.png": "Swarm of dozens of rats rushing forward, fantasy horror art style, dramatic lighting, dungeons and dragons, no text",
    "two-rats.png": "Two giant menacing rats side by side in a dark cave, aggressive stance, fantasy art, dungeons and dragons style, no text",
    "victory.png": "Victorious fantasy hero standing on mountain peak at golden sunrise, triumphant pose, epic fantasy art, no text",
}

def generate_image(prompt: str, filename: str):
    """Generate an image using DALL-E and save it."""
    print(f"Generating {filename}...")
    
    response = client.images.generate(
        model="gpt-image-1",
        prompt=prompt,
        size="1024x1024",
        quality="medium",
        n=1,
    )
    
    # Handle both URL and base64 responses
    image_data = response.data[0]
    
    if image_data.url:
        # Download from URL
        img_response = requests.get(image_data.url)
        with open(filename, "wb") as f:
            f.write(img_response.content)
    elif image_data.b64_json:
        # Decode base64
        img_bytes = base64.b64decode(image_data.b64_json)
        with open(filename, "wb") as f:
            f.write(img_bytes)
    else:
        raise ValueError("No image data in response")
    
    print(f"  ✓ Saved {filename}")

def main():
    print("🎨 Generating D&D adventure images with DALL-E 3...\n")
    
    for filename, prompt in IMAGES.items():
        try:
            generate_image(prompt, filename)
        except Exception as e:
            print(f"  ✗ Error generating {filename}: {e}")
    
    print("\n✨ Done!")

if __name__ == "__main__":
    main()

