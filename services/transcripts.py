import whisper
import os

TRANSCRIPT_DIR = "transcripts"

model = whisper.load_model("base")



def transcribe_video(video_path: str):

    try:

        os.makedirs(TRANSCRIPT_DIR, exist_ok=True)

        result = model.transcribe(
            video_path,
            word_timestamps=True
        )

        transcript_text = result["text"]

        filename = os.path.basename(video_path)

        transcript_file = os.path.join(
            TRANSCRIPT_DIR,
            f"{filename}.txt"
        )

        with open(transcript_file, "w", encoding="utf-8") as f:
            f.write(transcript_text)

        return {
            "transcript": transcript_text,
            "segments": result["segments"],
            "transcript_file": transcript_file
        }

    except Exception as e:

        print("Transcription Error:", e)

        return None