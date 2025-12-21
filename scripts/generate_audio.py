#!/usr/bin/env python3
"""
Generate audio from episode script using TTS
Supports: ElevenLabs, OpenAI TTS, Google TTS
"""
import os
import sys
from pathlib import Path

# Output directories
OUTPUT_DIR = Path("output")
OUTPUT_DIR.mkdir(exist_ok=True)


def generate_audio_elevenlabs(script_text: str, output_file: str):
    """Generate audio using ElevenLabs API"""
    try:
        from elevenlabs import generate, save, Voice
        
        api_key = os.getenv("ELEVENLABS_API_KEY")
        if not api_key:
            raise ValueError("ELEVENLABS_API_KEY not set")
        
        voice_id = os.getenv("ELEVENLABS_VOICE_ID", "21m00Tcm4TlvDq8ikWAM")  # Default: Rachel
        
        print("🎤 Generating audio with ElevenLabs...")
        
        audio = generate(
            text=script_text,
            voice=Voice(voice_id=voice_id),
            model="eleven_multilingual_v2"
        )
        
        save(audio, output_file)
        print(f"✅ Audio saved: {output_file}")
        return True
        
    except Exception as e:
        print(f"❌ ElevenLabs error: {e}")
        return False


def generate_audio_openai(script_text: str, output_file: str):
    """Generate audio using OpenAI TTS"""
    try:
        from openai import OpenAI
        
        client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        
        model = os.getenv("OPENAI_TTS_MODEL", "tts-1-hd")
        voice = os.getenv("OPENAI_TTS_VOICE", "onyx")
        
        print(f"🎤 Generating audio with OpenAI TTS ({voice})...")
        
        response = client.audio.speech.create(
            model=model,
            voice=voice,
            input=script_text
        )
        
        response.stream_to_file(output_file)
        print(f"✅ Audio saved: {output_file}")
        return True
        
    except Exception as e:
        print(f"❌ OpenAI TTS error: {e}")
        return False


def generate_audio_gtts(script_text: str, output_file: str):
    """Generate audio using Google TTS (free fallback)"""
    try:
        from gtts import gTTS
        
        print("🎤 Generating audio with Google TTS (free)...")
        
        tts = gTTS(text=script_text, lang='en', slow=False)
        tts.save(output_file)
        
        print(f"✅ Audio saved: {output_file}")
        return True
        
    except Exception as e:
        print(f"❌ Google TTS error: {e}")
        return False


def generate_audio():
    """Main audio generation function"""
    print("=" * 70)
    print("🎤 Audio Generation for TV.RUSLANMV.COM")
    print("=" * 70)
    
    # Load script
    script_file = OUTPUT_DIR / "episode_script.txt"
    if not script_file.exists():
        print(f"❌ Script not found: {script_file}")
        sys.exit(1)
    
    with open(script_file, 'r') as f:
        script_text = f.read()
    
    print(f"📝 Script length: {len(script_text)} characters")
    
    # Output file
    output_file = OUTPUT_DIR / "episode_audio.mp3"
    
    # Try providers in order of preference
    providers = [
        ("ElevenLabs", generate_audio_elevenlabs, os.getenv("ELEVENLABS_API_KEY")),
        ("OpenAI TTS", generate_audio_openai, os.getenv("OPENAI_API_KEY")),
        ("Google TTS", generate_audio_gtts, True)  # Always available
    ]
    
    success = False
    for name, func, available in providers:
        if not available:
            print(f"⏭️  Skipping {name} (no API key)")
            continue
        
        print(f"\n🎯 Trying {name}...")
        if func(script_text, str(output_file)):
            success = True
            break
    
    if success:
        # Get audio duration
        try:
            from pydub import AudioSegment
            audio = AudioSegment.from_mp3(str(output_file))
            duration = len(audio) / 1000  # Convert to seconds
            print(f"\n📊 Audio duration: {duration:.1f} seconds ({duration/60:.1f} minutes)")
        except:
            pass
        
        print("\n✅ SUCCESS: Audio generation complete!")
        return str(output_file)
    else:
        print("\n❌ ERROR: All TTS providers failed!")
        sys.exit(1)


if __name__ == "__main__":
    generate_audio()
