import os
from moviepy.editor import *
from gtts import gTTS
import textwrap
from PIL import Image, ImageDraw, ImageFont
import numpy as np

# Configuration
OUTPUT_FILENAME = "explainer_video.mp4"
TEMP_AUDIO_DIR = "temp_audio"
VIDEO_SIZE = (1280, 720)
FPS = 24
BG_COLOR_1 = (20, 20, 30)  # Dark Blue/Black
BG_COLOR_2 = (0, 100, 0)    # Naija Trust Green
TEXT_COLOR = (255, 255, 255) # White
FONT_SIZE = 70
# Try to load a standard font
try:
    FONT_PATH = "/System/Library/Fonts/Helvetica.ttc" # macOS standard
    if not os.path.exists(FONT_PATH):
        FONT_PATH = "arial.ttf"
except:
    FONT_PATH = "arial.ttf"

# Script Data: Each item is a slide
script = [
    {
        "text": "Scams. Fake Vendors. Fear.",
        "narration": "In Nigeria's digital market, fear is the enemy. What I ordered versus what I got is killing sales.",
        "duration": 5,
        "color": (50, 0, 0) # Dark Red for "Fear"
    },
    {
        "text": "Trust is the only currency.",
        "narration": "But for legitimate businesses, Trust is the only currency that matters.",
        "duration": 4,
        "color": BG_COLOR_1
    },
    {
        "text": "Naija Trust = Verified.",
        "narration": "Enter Naija Trust. The standard for verification in Nigerian commerce.",
        "duration": 4,
        "color": BG_COLOR_2
    },
    {
        "text": "CAC Registered.\nSEO Optimized.",
        "narration": "We verify your CAC registration. We rank you on Google. We give you the green badge that says, I am real.",
        "duration": 6,
        "color": BG_COLOR_1
    },
    {
        "text": "Control Your Reputation.",
        "narration": "Don't let gossip destroy your brand. Reply to reviews officially. Control your narrative.",
        "duration": 5,
        "color": BG_COLOR_1
    },
    {
        "text": "Get Verified Today.",
        "narration": "Stop convincing strangers in DMs. Let your badge do the selling.",
        "duration": 4,
        "color": BG_COLOR_2
    },
    {
        "text": "NaijaTrust.com\nClaim Free.",
        "narration": "Claim your business profile for free today at Naija Trust dot com.",
        "duration": 5,
        "color": BG_COLOR_1
    }
]

def ensure_dir(directory):
    if not os.path.exists(directory):
        os.makedirs(directory)

def generate_audio(text, index):
    """Generates audio file from text using gTTS."""
    filename = os.path.join(TEMP_AUDIO_DIR, f"narration_{index}.mp3")
    tts = gTTS(text=text, lang='en', tld='com.ng') 
    tts.save(filename)
    return filename

def create_text_image(text, size, bg_color, font_path=None, font_size=60):
    """Creates a PIL Image with centered text."""
    # Create image
    img = Image.new('RGB', size, color=bg_color)
    draw = ImageDraw.Draw(img)
    
    # Load font
    try:
        font = ImageFont.truetype(font_path, font_size)
    except IOError:
        font = ImageFont.load_default()
        print("Warning: Could not load requested font, using default.")

    # Wrap text
    lines = textwrap.wrap(text, width=20) # Character width, approx
    
    # Calculate total height of text block
    # Get line height using getbbox (left, top, right, bottom)
    line_heights = []
    line_widths = []
    for line in lines:
        bbox = draw.textbbox((0, 0), line, font=font)
        line_widths.append(bbox[2] - bbox[0])
        line_heights.append(bbox[3] - bbox[1])
    
    # Add some line spacing
    line_spacing = 10
    total_height = sum(line_heights) + (len(lines) - 1) * line_spacing
    
    # Start drawing from center
    y_text = (size[1] - total_height) / 2
    
    for i, line in enumerate(lines):
        width = line_widths[i]
        x_text = (size[0] - width) / 2
        draw.text((x_text, y_text), line, font=font, fill=TEXT_COLOR)
        y_text += line_heights[i] + line_spacing
        
    return np.array(img)

def create_slide(item, index):
    """Creates a video clip for a single slide."""
    
    # 1. Generate Audio
    audio_file = generate_audio(item["narration"], index)
    audio_clip = AudioFileClip(audio_file)
    
    # Duration is determined by audio length + padding, or manual override
    slide_duration = max(item.get("duration", 0), audio_clip.duration + 0.5)
    
    # 2. Create Image with Pillow
    bg_color = item.get("color", BG_COLOR_1)
    
    # Use Helvetica or Arial if available
    font_path = "/System/Library/Fonts/Helvetica.ttc" 
    if not os.path.exists(font_path):
         font_path = "arial.ttf"

    img_array = create_text_image(item["text"], VIDEO_SIZE, bg_color, font_path=font_path, font_size=FONT_SIZE)
    
    # 3. Create ImageClip
    video = ImageClip(img_array).set_duration(slide_duration)

    # Set Audio
    video = video.set_audio(audio_clip)
    
    return video

def main():
    print("Starting video generation...")
    ensure_dir(TEMP_AUDIO_DIR)
    
    clips = []
    
    for i, item in enumerate(script):
        print(f"Processing slide {i+1}/{len(script)}: {item['text']}")
        clip = create_slide(item, i)
        clips.append(clip)
        
    print("Concatenating clips...")
    final_video = concatenate_videoclips(clips)
    
    print(f"Writing output to {OUTPUT_FILENAME}...")
    final_video.write_videofile(OUTPUT_FILENAME, fps=FPS, codec='libx264', audio_codec='aac')
    
    print("Done!")
    
if __name__ == "__main__":
    main()
