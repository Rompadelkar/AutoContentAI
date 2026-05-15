import whisper
import os

SUBTITLE_DIR = "subtitles"

model = whisper.load_model("base")



def format_timestamp(seconds):

    hrs = int(seconds // 3600)
    mins = int((seconds % 3600) // 60)
    secs = int(seconds % 60)
    millis = int((seconds - int(seconds)) * 1000)

    return f"{hrs:02}:{mins:02}:{secs:02},{millis:03}"



def generate_subtitles(video_path):

    try:

        os.makedirs(SUBTITLE_DIR, exist_ok=True)

        result = model.transcribe(
            video_path,
            word_timestamps=True
        )

        segments = result["segments"]

        filename = os.path.basename(video_path)

        subtitle_path = os.path.join(
            SUBTITLE_DIR,
            f"{filename}.srt"
        )

        with open(subtitle_path, "w", encoding="utf-8") as srt_file:

            for i, segment in enumerate(segments, start=1):

                start = segment["start"]
                end = segment["end"]
                text = segment["text"]

                srt_file.write(f"{i}\n")
                srt_file.write(
                    f"{format_timestamp(start)} --> {format_timestamp(end)}\n"
                )
                srt_file.write(f"{text.strip()}\n\n")

        return subtitle_path

    except Exception as e:

        print("Subtitle Error:", e)

        return None