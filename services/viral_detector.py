import os
import json

from groq import Groq
from dotenv import load_dotenv

from services.content_classifier import (
    detect_content_type
)

from services.psychology_engine import (
    detect_emotion,
    psychology_score
)

from services.recommendation_engine import (
    generate_recommendations
)

load_dotenv()

client = Groq(
    api_key=os.getenv(
        "GROQ_API_KEY"
    )
)


def create_story_windows(
    transcript_segments,
    window_size=25,
    step=10
):

    windows = []

    if not transcript_segments:
        return windows

    video_end = transcript_segments[-1]["end"]

    current_start = 0

    while current_start < video_end:

        current_end = (
            current_start
            + window_size
        )

        text_parts = []

        for segment in transcript_segments:

            if (
                segment["start"] >= current_start
                and
                segment["end"] <= current_end
            ):

                text_parts.append(
                    segment["text"]
                )

        combined_text = " ".join(
            text_parts
        )

        if len(
            combined_text.strip()
        ) > 80:

            windows.append({

                "start":
                current_start,

                "end":
                current_end,

                "text":
                combined_text
            })

        current_start += step

    return windows


def build_category_prompt(
    content_type
):

    if content_type == "movie":

        return """
Focus on:

- betrayal
- revenge
- conflict
- twists
- emotional scenes
- shocking moments
- breakups
- confessions
"""

    elif content_type == "podcast":

        return """
Focus on:

- life lessons
- business advice
- money
- mindset
- controversial opinions
- personal stories
"""

    elif content_type == "interview":

        return """
Focus on:

- surprising answers
- failures
- success stories
- emotional moments
"""

    elif content_type == "news":

        return """
Focus on:

- urgency
- controversy
- fear
- impact
- breaking developments
"""

    elif content_type == "vlog":

        return """
Focus on:

- relatable moments
- humor
- transformation
- emotional moments
"""

    return """
Focus on:

- emotional impact
- curiosity
- storytelling
- retention
"""


def analyze_transcript(
    transcript_segments,
    number_of_clips
):

    if not transcript_segments:

        return []

    transcript_text = " ".join(

        segment["text"]

        for segment in transcript_segments
    )

    content_type = (
        detect_content_type(
            transcript_text
        )
    )

    windows = create_story_windows(
        transcript_segments,
        window_size=25,
        step=10
    )

    if not windows:

        return []

    windows_payload = []

    for index, window in enumerate(
        windows
    ):

        windows_payload.append({

            "id":
            index,

            "start":
            window["start"],

            "end":
            window["end"],

            "text":
            window["text"][:1000]
        })

    category_rules = (
        build_category_prompt(
            content_type
        )
    )

    prompt = f"""
You are an elite short-form content strategist.

Content Type:
{content_type}

{category_rules}

Analyze all windows.

Find the MOST viral moments.

Score each moment from 1-100.

Prioritize:
- strong hooks
- emotional impact
- curiosity
- storytelling
- conflict
- surprise
- retention

Return ONLY valid JSON.

Example:

[
 {{
   "id":0,
   "viral_score":95,
   "viral_title":"Title",
   "reason":"Why it may go viral"
 }}
]

Windows:

{json.dumps(windows_payload)}
"""

    try:

        response = (
            client.chat.completions.create(

                model=
                "llama-3.3-70b-versatile",

                messages=[
                    {
                        "role":
                        "user",

                        "content":
                        prompt
                    }
                ],

                temperature=0.3
            )
        )

        raw = (
            response
            .choices[0]
            .message
            .content
            .strip()
        )

        raw = (
            raw
            .replace(
                "```json",
                ""
            )
            .replace(
                "```",
                ""
            )
            .strip()
        )

        parsed = json.loads(
            raw
        )

        clips = []

        for item in parsed:

            if item["id"] >= len(windows):
                continue

            window = windows[
                item["id"]
            ]

            emotion = (
                detect_emotion(
                    window["text"]
                )
            )

            psychology = (
                psychology_score(
                    window["text"]
                )
            )

            ai_score = (
                item.get(
                    "viral_score",
                    50
                )
            )

            final_score = (

                ai_score * 0.8

                +

                psychology * 0.2
            )

            recommendations = (
                generate_recommendations(

                    emotion,

                    content_type,

                    final_score
                )
            )

            clips.append({

                "viral_score":
                final_score,

                "viral_title":
                item.get(
                    "viral_title",
                    "Viral Clip"
                ),

                "reason_may_go_viral":
                item.get(
                    "reason",
                    ""
                ),

                "emotion":
                emotion,

                "content_type":
                content_type,

                "audio_style":
                recommendations[
                    "audio_style"
                ],

                "caption_idea":
                recommendations[
                    "caption_idea"
                ],

                "hook_type":
                recommendations[
                    "hook_type"
                ],

                "recommended_platform":
                recommendations[
                    "recommended_platform"
                ],

                "best_posting_time":
                recommendations[
                    "best_posting_time"
                ],

                "start":
                window["start"],

                "end":
                window["end"],

                "text":
                window["text"]
            })

        clips = sorted(

            clips,

            key=lambda x:
            x["viral_score"],

            reverse=True
        )

        return clips[
            :number_of_clips
        ]

    except Exception as e:

        print(
            "Groq Viral Detector Error:",
            e
        )

        return []