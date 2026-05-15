from fastapi import FastAPI, HTTPException

from services.automation_pipeline import auto_generate_short

app = FastAPI()


@app.get("/")
def home():

    return {
        "message": "AutoContentAI Running"
    }


@app.post("/auto-generate")
def auto_generate(
    video_url: str,
    number_of_clips: int = 2,
    reel_duration: int = 30
):

    try:

        # VALIDATION
        if number_of_clips > 10:

            raise HTTPException(
                status_code=400,
                detail="Maximum allowed clips is 10"
            )

        if number_of_clips < 1:

            raise HTTPException(
                status_code=400,
                detail="Minimum clips is 1"
            )

        if reel_duration < 10:

            raise HTTPException(
                status_code=400,
                detail="Minimum reel duration is 10 seconds"
            )

        if reel_duration > 60:

            raise HTTPException(
                status_code=400,
                detail="Maximum reel duration is 60 seconds"
            )

        result = auto_generate_short(
            video_url,
            number_of_clips,
            reel_duration
        )

        if not result:

            raise HTTPException(
                status_code=500,
                detail="Automation pipeline failed"
            )

        return {
            "generated_clips": result
        }

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )