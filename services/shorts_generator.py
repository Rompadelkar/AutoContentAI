import subprocess
import os

SHORTS_DIR = "shorts"


def generate_vertical_short(
    input_video,
    subtitle_file,
    output_name
):

    try:

        os.makedirs(SHORTS_DIR, exist_ok=True)

        output_path = os.path.join(
            SHORTS_DIR,
            f"{output_name}.mp4"
        )

        # FIX WINDOWS PATH
        subtitle_file = subtitle_file.replace("\\", "/")

        command = [
            "ffmpeg",
            "-y",
            "-i",
            input_video,

            "-vf",
            (
                f"scale=1080:1920:"
                f"force_original_aspect_ratio=increase,"
                f"crop=1080:1920,"
                f"subtitles='{subtitle_file}':"
                f"force_style='Fontsize=20,"
                f"PrimaryColour=&Hffffff&,"
                f"OutlineColour=&H000000&,"
                f"BorderStyle=3,"
                f"Outline=2'"
            ),

            "-c:v",
            "libx264",

            "-preset",
            "medium",

            "-crf",
            "18",

            "-c:a",
            "aac",

            output_path
        ]

        subprocess.run(command, check=True)

        return output_path

    except Exception as e:

        print("Shorts Generation Error:", e)

        return None