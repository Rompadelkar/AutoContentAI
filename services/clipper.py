import subprocess
import os

CLIPS_DIR = "clips"



def create_clip(
    video_path,
    start_time,
    end_time,
    clip_name
):

    try:

        os.makedirs(CLIPS_DIR, exist_ok=True)

        output_path = os.path.join(
            CLIPS_DIR,
            f"{clip_name}.mp4"
        )

        command = [
            "ffmpeg",
            "-y",
            "-i", video_path,
            "-ss", start_time,
            "-to", end_time,
            "-c:v", "libx264",
            "-c:a", "aac",
            output_path
        ]

        subprocess.run(command, check=True)

        return output_path

    except Exception as e:

        print("Clip Generation Error:", e)

        return None