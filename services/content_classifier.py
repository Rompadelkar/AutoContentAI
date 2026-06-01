import os
import json

from groq import Groq
from dotenv import load_dotenv

load_dotenv()

client = Groq(
    api_key=os.getenv(
        "GROQ_API_KEY"
    )
)


def detect_content_type(
    transcript_text
):

    try:

        prompt = f"""
You are an expert content classifier.

Classify this content into ONE category:

podcast
interview
movie
news
vlog
speech
educational

Return ONLY JSON.

Example:

{{
    "content_type":"podcast"
}}

Transcript:

{transcript_text[:8000]}
"""

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

                temperature=0.1
            )
        )

        text = (
            response
            .choices[0]
            .message
            .content
            .strip()
        )

        text = (
            text
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
            text
        )

        content_type = (
            parsed.get(
                "content_type",
                "podcast"
            )
            .lower()
            .strip()
        )

        allowed = [

            "podcast",
            "interview",
            "movie",
            "news",
            "vlog",
            "speech",
            "educational"
        ]

        if content_type not in allowed:

            return "podcast"

        return content_type

    except Exception as e:

        print(
            "Content Classification Error:",
            e
        )

        return "podcast"