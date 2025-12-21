#!/usr/bin/env python3
"""
Generate audio from episode script using TTS
Priority:
  1) ElevenLabs (ELEVENLABS_API_KEY)
  2) OpenAI TTS (OPENAI_API_KEY)
  3) Google gTTS (free fallback)
"""
from __future__ import annotations
import os
import sys
from pathlib import Path
from scripts._common import OUTPUT_DIR
from dotenv import load_dotenv

def generate_audio_elevenlabs(script_text: str, output_file: str) -> bool:
    try:
        from elevenlabs import VoiceSettings
        from elevenlabs.client import ElevenLabs

        api_key = os.getenv("ELEVENLABS_API_KEY")
        if not api_key:
            return False

        voice_id = os.getenv("ELEVENLABS_VOICE_ID", "21m00Tcm4TlvDq8ikWAM")  # Rachel
        model_id = os.getenv("ELEVENLABS_MODEL", "eleven_multilingual_v2")

        print("🎤 Generating audio with ElevenLabs...")
        client = ElevenLabs(api_key=api_key)

        audio = client.text_to_speech.convert(
            voice_id=voice_id,
            model_id=model_id,
            text=script_text,
            voice_settings=VoiceSettings(stability=0.4, similarity_boost=0.75),
        )

        with open(output_file, "wb") as f:
            for chunk in audio:
                f.write(chunk)

        print(f"✅ Audio saved: {output_file}")
        return True
    except Exception as e:
        print(f"❌ ElevenLabs error: {e}")
        return False

def generate_audio_openai(script_text: str, output_file: str) -> bool:
    try:
        from openai import OpenAI
        if not os.getenv("OPENAI_API_KEY"):
            return False

        client = OpenAI()
        model = os.getenv("OPENAI_TTS_MODEL", "tts-1-hd")
        voice = os.getenv("OPENAI_TTS_VOICE", "onyx")

        print(f"🎤 Generating audio with OpenAI TTS ({voice})...")
        response = client.audio.speech.create(model=model, voice=voice, input=script_text)
        response.stream_to_file(output_file)

        print(f"✅ Audio saved: {output_file}")
        return True
    except Exception as e:
        print(f"❌ OpenAI TTS error: {e}")
        return False

def generate_audio_gtts(script_text: str, output_file: str) -> bool:
    try:
        from gtts import gTTS
        print("🎤 Generating audio with Google gTTS (fallback)...")
        tts = gTTS(text=script_text, lang="en", slow=False)
        tts.save(output_file)
        print(f"✅ Audio saved: {output_file}")
        return True
    except Exception as e:
        print(f"❌ gTTS error: {e}")
        return False

def main() -> None:
    load_dotenv()

    script_file = OUTPUT_DIR / "episode_script.txt"
    if not script_file.exists():
        print(f"❌ Missing: {script_file}")
        sys.exit(1)

    script_text = script_file.read_text(encoding="utf-8").strip()
    if not script_text:
        print("❌ Script is empty.")
        sys.exit(1)

    out_file = OUTPUT_DIR / "episode_audio.mp3"

    providers = [
        ("ElevenLabs", generate_audio_elevenlabs),
        ("OpenAI", generate_audio_openai),
        ("gTTS", generate_audio_gtts),
    ]

    for name, fn in providers:
        print(f"➡️  Trying {name}...")
        if fn(script_text, str(out_file)):
            return

    print("❌ All TTS providers failed. Configure ELEVENLABS_API_KEY or OPENAI_API_KEY, or use gTTS.")
    sys.exit(1)

if __name__ == "__main__":
    main()
