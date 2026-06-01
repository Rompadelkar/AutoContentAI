import subprocess
import os

SHORTS_DIR = "shorts"


def generate_vertical_short(
    input_video,
    subtitle_file,
    output_name
):

    try:

        os.makedirs(
            SHORTS_DIR,
            exist_ok=True
        )

        output_path = os.path.join(
            SHORTS_DIR,
            f"{output_name}.mp4"
        )

        video_filter = (

            "[0:v]scale=1080:1920:"
            "force_original_aspect_ratio=increase,"

            "crop=1080:1920,"

            "boxblur=20:10[bg];"

            "[0:v]scale=1080:-2:"
            "force_original_aspect_ratio=decrease[fg];"

            "[bg][fg]overlay="
            "(W-w)/2:(H-h)/2"
        )

        command = [
            "ffmpeg",
            "-y",
            "-i",
            input_video,
            "-filter_complex",
            video_filter,
            "-c:v",
            "libx264",
            "-preset",
            "medium",
            "-crf",
            "22",
            "-c:a",
            "aac",
            "-b:a",
            "128k",
            output_path
        ]

        subprocess.run(
            command,
            check=True
        )

        return output_path

    except Exception as e:

        print(
            "Shorts Generation Error:",
            e
        )

        return None