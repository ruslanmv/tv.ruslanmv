# AI Video Blog Pipeline (TV.RuslanMV)

This patch adds a working pipeline that can run locally and in GitHub Actions:

- Fetch RSS news → `output/news.json`
- Create package highlights → `output/packages.json`
- Generate narration script with LLM (Ollama default) → `output/episode_script.txt`
- TTS to audio (ElevenLabs/OpenAI/gTTS fallback) → `output/episode_audio.mp3`
- FFmpeg render with subtitles → `output/episode_video.mp4`
- Publish to `frontend/public/episodes/<episode-id>/...` and update `index.json` / `latest.json`

## Local usage

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r scripts/requirements.txt

# install ffmpeg (mac: brew install ffmpeg | ubuntu: apt-get install ffmpeg)
./scripts/run_pipeline_once.sh
```

## Generate two demo episodes

```bash
./scripts/generate_two_demo_episodes.sh
```

## LLM selection

Default (Ollama):

* `NEWS_LLM_MODEL=ollama/gemma:2b`
* `OLLAMA_HOST=http://127.0.0.1:11434`

OpenAI:

* `NEWS_LLM_MODEL=gpt-4o-mini`
* `OPENAI_API_KEY=...`

Anthropic:

* `NEWS_LLM_MODEL=claude-3-5-sonnet-20240620`
* `ANTHROPIC_API_KEY=...`
