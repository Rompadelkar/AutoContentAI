POSTING_TIMES = {

    "podcast":
    "7PM - 10PM IST",

    "interview":
    "6PM - 9PM IST",

    "movie":
    "7PM - 11PM IST",

    "news":
    "8AM - 10AM IST",

    "vlog":
    "5PM - 9PM IST",

    "speech":
    "7PM - 10PM IST",

    "educational":
    "6PM - 9PM IST"
}


EMOTION_CONFIG = {

    "shock": {

        "audio":
        "Trailer Impact",

        "caption":
        "Nobody saw this coming.",

        "hook":
        "Shock"
    },

    "betrayal": {

        "audio":
        "Dark Emotional",

        "caption":
        "Trust takes years. One lie destroys it.",

        "hook":
        "Conflict"
    },

    "revenge": {

        "audio":
        "Aggressive Cinematic",

        "caption":
        "The comeback was personal.",

        "hook":
        "Revenge"
    },

    "fear": {

        "audio":
        "Suspense Thriller",

        "caption":
        "This should scare everyone.",

        "hook":
        "Fear"
    },

    "love": {

        "audio":
        "Romantic Hindi",

        "caption":
        "Some people stay forever in your heart.",

        "hook":
        "Emotion"
    },

    "regret": {

        "audio":
        "Sad Hindi Romantic",

        "caption":
        "The hardest lessons come too late.",

        "hook":
        "Regret"
    },

    "success": {

        "audio":
        "Victory Cinematic",

        "caption":
        "Success leaves clues.",

        "hook":
        "Achievement"
    },

    "failure": {

        "audio":
        "Emotional Piano",

        "caption":
        "Failure is not the end.",

        "hook":
        "Transformation"
    },

    "controversy": {

        "audio":
        "Dark Suspense",

        "caption":
        "Most people won't agree with this.",

        "hook":
        "Controversy"
    },

    "motivation": {

        "audio":
        "Motivational Hindi",

        "caption":
        "Watch this before giving up.",

        "hook":
        "Motivation"
    },

    "curiosity": {

        "audio":
        "Mystery Build-Up",

        "caption":
        "Wait until the end.",

        "hook":
        "Curiosity"
    },

    "humor": {

        "audio":
        "Light Comedy",

        "caption":
        "This made my day.",

        "hook":
        "Humor"
    }
}


def generate_recommendations(

    emotion,
    content_type,
    viral_score

):

    config = EMOTION_CONFIG.get(

        emotion,

        EMOTION_CONFIG[
            "motivation"
        ]
    )

    posting_time = (

        POSTING_TIMES.get(

            content_type,

            "7PM - 10PM IST"
        )
    )

    if viral_score >= 90:

        platform = (
            "Instagram + YouTube Shorts"
        )

    elif viral_score >= 75:

        platform = (
            "Instagram Reels"
        )

    else:

        platform = (
            "Instagram"
        )

    return {

        "audio_style":
        config["audio"],

        "caption_idea":
        config["caption"],

        "hook_type":
        config["hook"],

        "best_posting_time":
        posting_time,

        "recommended_platform":
        platform,

        "viral_score":
        viral_score
    }