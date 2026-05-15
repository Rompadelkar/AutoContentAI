from services.downloader import download_video
from services.transcripts import transcribe_video
from services.viral_detector import analyze_transcript
from services.clipper import create_clip
from services.subtitles import generate_subtitles
from services.shorts_generator import generate_vertical_short


def auto_generate_short(
    video_url,
    number_of_clips,
    reel_duration
):

    try:

        final_results = []

        # DOWNLOAD VIDEO
        video_path = download_video(video_url)

        if not video_path:
            return None

        # TRANSCRIBE VIDEO
        transcript_result = transcribe_video(video_path)

        if not transcript_result:
            return None

        transcript_text = transcript_result["transcript"]

        transcript_segments = transcript_result["segments"]

        # AI ANALYSIS
        viral_clips = analyze_transcript(
            transcript_segments,
            number_of_clips
        )

        if not viral_clips:
            return None

        for index, clip_data in enumerate(viral_clips):

            clip_name = f"clip_{index+1}"
            short_name = f"short_{index+1}"

            # REAL TIMESTAMPS
            start_seconds = int(
                clip_data["start"]
            )

            end_seconds = (
                start_seconds
                + reel_duration
            )

            # CONVERT TO HH:MM:SS
            start_time = (
                f"{start_seconds // 3600:02}:"
                f"{(start_seconds % 3600) // 60:02}:"
                f"{start_seconds % 60:02}"
            )

            end_time = (
                f"{end_seconds // 3600:02}:"
                f"{(end_seconds % 3600) // 60:02}:"
                f"{end_seconds % 60:02}"
            )

            print(
                f"Generating clip from "
                f"{start_time} to {end_time}"
            )

            # CREATE CLIP
            clip_path = create_clip(
                video_path,
                start_time,
                end_time,
                clip_name
            )

            if not clip_path:
                continue

            # GENERATE SUBTITLES
            subtitle_path = generate_subtitles(
                clip_path
            )

            if not subtitle_path:
                continue

            # GENERATE VERTICAL SHORT
            short_path = generate_vertical_short(
                clip_path,
                subtitle_path,
                short_name
            )

            if not short_path:
                continue

            final_results.append({

                "viral_title": clip_data.get(
                    "viral_title",
                    f"Clip {index+1}"
                ),

                "reason": clip_data.get(
                    "reason_may_go_viral",
                    "High engagement potential"
                ),

                "start_time": start_time,

                "end_time": end_time,

                "short_path": short_path
            })

        return final_results

    except Exception as e:

        print(
            "Automation Pipeline Error:",
            e
        )

        return None