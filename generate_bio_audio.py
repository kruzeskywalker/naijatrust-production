import asyncio
import edge_tts

OUTPUT_FILE = "bio_apreala.mp3"
INPUT_FILE = "bio.txt"
VOICE = "en-NG-AbeoNeural" # Nigerian Male
RATE = "-10%" # Slower speed

async def generate_audio():
    print(f"Reading text from {INPUT_FILE}...")
    with open(INPUT_FILE, "r") as f:
        text = f.read()

    print(f"Generating audio using voice '{VOICE}' at rate '{RATE}'...")
    communicate = edge_tts.Communicate(text, VOICE, rate=RATE)
    
    await communicate.save(OUTPUT_FILE)
    print(f"Successfully created {OUTPUT_FILE}")

if __name__ == "__main__":
    asyncio.run(generate_audio())
