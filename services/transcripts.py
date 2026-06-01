import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

TRANSCRIPT_DIR = "transcripts"

client = Groq(
    api_key=os.getenv("GROQ_API_KEY")
)


def transcribe_video(video_path):

    try:

        os.makedirs(
            TRANSCRIPT_DIR,
            exist_ok=True
        )

        with open(
            video_path,
            "rb"
        ) as audio_file:

            transcription = (
                client.audio.transcriptions.create(
                    file=audio_file,
                    model="whisper-large-v3-turbo",
                    response_format="verbose_json"
                )
            )

        print("\n========== GROQ RESPONSE ==========")
        print(type(transcription))
        print(transcription)
        print("===================================\n")

        transcript_text = ""

        segments = []

        if hasattr(
            transcription,
            "segments"
        ):

            for segment in transcription.segments:

                transcript_text += (
                    segment["text"] + " "
                )

                segments.append({

                    "start":
                    segment["start"],

                    "end":
                    segment["end"],

                    "text":
                    segment["text"]
                })

        filename = os.path.basename(
            video_path
        )

        transcript_file = os.path.join(
            TRANSCRIPT_DIR,
            f"{filename}.txt"
        )

        with open(
            transcript_file,
            "w",
            encoding="utf-8"
        ) as f:

            f.write(
                transcript_text
            )

        return {

            "transcript":
            transcript_text,

            "segments":
            segments,

            "transcript_file":
            transcript_file
        }

    except Exception as e:

        print(
            "Groq Transcription Error:",
            e
        )

        return None