import requests
import json

OLLAMA_URL = "http://localhost:11434/api/generate"


def analyze_transcript(
    transcript_segments,
    number_of_clips
):

    clips = []

    for segment in transcript_segments:

        text = segment["text"]

        prompt = f"""
You are a viral content expert.

Rate this transcript segment from 1-10 for viral potential.

Consider:
- emotional impact
- curiosity
- controversy
- storytelling
- motivation
- audience retention
- hooks
- suspense
- shocking statements

Return ONLY JSON:

{{
    "score": 1,
    "viral_title": "short hook title",
    "reason": "why this may go viral"
}}

Transcript:
{text}
"""

        payload = {
            "model": "qwen2.5:3b",
            "prompt": prompt,
            "stream": False
        }

        try:

            response = requests.post(
                OLLAMA_URL,
                json=payload
            )

            result = response.json()

            ai_response = result["response"]

            json_start = ai_response.find("{")
            json_end = ai_response.rfind("}") + 1

            clean_json = ai_response[
                json_start:json_end
            ]

            parsed = json.loads(clean_json)

            clips.append({

                "score": parsed.get(
                    "score",
                    1
                ),

                "viral_title": parsed.get(
                    "viral_title",
                    "Viral Clip"
                ),

                "reason_may_go_viral": parsed.get(
                    "reason",
                    "Potentially engaging"
                ),

                "start": segment["start"],

                "end": segment["end"],

                "text": text
            })

        except Exception as e:

            print(
                "AI Segment Error:",
                e
            )

    # SORT BY SCORE
    clips = sorted(
        clips,
        key=lambda x: x["score"],
        reverse=True
    )

    return clips[:number_of_clips]