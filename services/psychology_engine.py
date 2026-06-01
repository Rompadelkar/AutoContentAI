EMOTION_PATTERNS = {

    "shock": [

        "can't believe",
        "unbelievable",
        "shocking",
        "what happened next",
        "nobody expected"
    ],

    "betrayal": [

        "lied",
        "betrayed",
        "cheated",
        "trust",
        "backstab"
    ],

    "revenge": [

        "revenge",
        "payback",
        "proved them wrong",
        "came back",
        "returned stronger"
    ],

    "fear": [

        "warning",
        "danger",
        "risk",
        "death",
        "afraid"
    ],

    "love": [

        "love",
        "heart",
        "relationship",
        "romantic",
        "miss you"
    ],

    "regret": [

        "regret",
        "mistake",
        "lost",
        "failure",
        "wish i had"
    ],

    "success": [

        "success",
        "million",
        "crore",
        "achieved",
        "winner"
    ],

    "failure": [

        "failed",
        "failure",
        "lost everything",
        "bankrupt",
        "rejected"
    ],

    "controversy": [

        "truth",
        "scam",
        "fraud",
        "exposed",
        "lie"
    ],

    "motivation": [

        "dream",
        "goal",
        "never give up",
        "discipline",
        "hard work"
    ],

    "curiosity": [

        "secret",
        "nobody knows",
        "hidden",
        "revealed",
        "never told"
    ],

    "humor": [

        "funny",
        "laugh",
        "joke",
        "hilarious",
        "comedy"
    ]
}


def detect_emotion(text):

    lower_text = text.lower()

    best_emotion = "motivation"

    best_score = 0

    for emotion, keywords in EMOTION_PATTERNS.items():

        score = 0

        for keyword in keywords:

            if keyword in lower_text:

                score += 1

        if score > best_score:

            best_score = score

            best_emotion = emotion

    return best_emotion


def psychology_score(text):

    lower_text = text.lower()

    score = 0

    for emotion, keywords in EMOTION_PATTERNS.items():

        for keyword in keywords:

            if keyword in lower_text:

                score += 8

    return min(score, 100)