import yt_dlp
import os

DOWNLOAD_DIR = "downloads"


def download_video(video_url: str):

    try:

        os.makedirs(DOWNLOAD_DIR, exist_ok=True)

        ydl_opts = {
            "format": "mp4",
            "outtmpl": f"{DOWNLOAD_DIR}/%(title)s.%(ext)s"
        }

        with yt_dlp.YoutubeDL(ydl_opts) as ydl:

            info = ydl.extract_info(video_url, download=True)

            filename = ydl.prepare_filename(info)

        return filename

    except Exception as e:

        print("Download Error:", e)

        return None