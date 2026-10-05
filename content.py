"""All portfolio content lives here. Edit this file to update the site.

Projects and skills are taken from the project folders in C:\\Dev.
"""

PROFILE = {
    "name": "Phil Samakayi",
    "initials": "PS",
    "role": "Software Developer",
    "typed_roles": ["Software Developer", "Elixir & Phoenix Developer", "Python & Django Developer", "CS Student at UNZA"],
    "tagline": "I build real-time web platforms for everyday problems in Zambia.",
    "location": "Lusaka, Zambia",
    "email": "philsamakayi@gmail.com",
    "github": "https://github.com/Phil-Samakayi",
    "linkedin": "",  # add your LinkedIn URL to show the link
    "available": True,
    "about": [
        "I'm a final-year Computer Science student at the University of Zambia. "
        "I work mainly in two ecosystems: Elixir and Phoenix LiveView for "
        "real-time systems, and Python with Django and React for APIs and "
        "web apps.",
        "I care about software that is useful where I live. What I build starts "
        "from a local problem: knowing whether the power and water are on, what "
        "staples cost at the nearest market, or how health data can reach the "
        "people who need to act on it.",
    ],
    "stats": [
        {"value": 3, "suffix": "", "label": "Projects built"},
        {"value": 4, "suffix": "", "label": "Languages"},
        {"value": 4, "suffix": "th", "label": "Year at UNZA"},
    ],
}

SKILLS = [
    {"group": "Languages", "items": ["Elixir", "Python", "JavaScript", "SQL"]},
    {"group": "Frontend", "items": ["Phoenix LiveView", "React", "Vite", "Tailwind CSS"]},
    {"group": "Backend", "items": ["Phoenix", "Django", "Django REST Framework", "Phoenix PubSub", "Oban", "Broadway", "JWT auth"]},
    {"group": "Data & ML", "items": ["PostgreSQL", "PostGIS", "SQLite", "Ecto", "scikit-learn", "NumPy", "Nx"]},
    {"group": "Tools", "items": ["Git & GitHub", "Docker", "Render"]},
]

# category must match a key in CATEGORIES
PROJECTS = [
    {
        "id": "pulse",
        "title": "Pulse",
        "category": "elixir",
        "year": "2026",
        "summary": "Live, crowdsourced tracker for power outages, water outages and market prices in Zambia.",
        "description": "Pulse lets anyone check a location's current power and water "
        "status and what staples cost at nearby markets, and lets signed-in residents "
        "submit reports. It is built in Elixir "
        "and Phoenix so that every report appears instantly for "
        "everyone viewing that location, with no polling or refresh.",
        "highlights": [
            "Live updates through Phoenix PubSub on every location page",
            "Hand-written authentication with PBKDF2 password hashing",
            "Community flagging and an admin moderation queue",
            "Duplicate-report cooldown and server-side timestamps",
            "Dockerised, with deployment guides for production",
        ],
        "stack": ["Elixir", "Phoenix LiveView", "PubSub", "PostgreSQL", "Tailwind CSS", "Docker"],
        "role": "Solo developer",
        "link": "",
    },
    {
        "id": "zamhealthwatch",
        "title": "ZamHealthWatch",
        "category": "elixir",
        "year": "2026 · In progress",
        "summary": "Public health intelligence platform for Zambia, from SMS case reports to a live dashboard.",
        "description": "A modular public health platform that began as a final-year "
        "project proposal and grew into a broader system. A health worker's case "
        "report arrives over SMS or USSD, is stored with its location, and one "
        "PubSub broadcast both triggers community alerts and updates the "
        "epidemiology dashboard live. Currently in its first build iteration.",
        "highlights": [
            "Event-driven design: one broadcast feeds alerts and the live dashboard",
            "PostgreSQL with PostGIS for district and facility mapping",
            "Oban background jobs and Broadway for SMS/USSD ingestion",
            "Twelve planned modules, from disease surveillance to predictive analytics",
            "Built iteratively with a living build log",
        ],
        "stack": ["Elixir", "Phoenix LiveView", "PostgreSQL", "PostGIS", "Oban", "Broadway", "Nx"],
        "role": "Solo developer",
        "link": "",
    },
    {
        "id": "study-planner",
        "title": "Study Planner",
        "category": "python",
        "year": "2026",
        "summary": "Study planner that matches students into study groups by complementary strengths.",
        "description": "Students rate their strengths and weaknesses per subject, "
        "and the system matches them into study groups where one person's strength "
        "covers another's weakness. It also handles weekly availability, study "
        "sessions and feedback on each match.",
        "highlights": [
            "Peer matching with cosine similarity (scikit-learn)",
            "Self-assessment API with bulk submission in one request",
            "JWT authentication; students can only access their own data",
            "Weekly availability slots and group study sessions",
        ],
        "stack": ["Python", "Django REST Framework", "scikit-learn", "NumPy", "React", "Vite"],
        "role": "Team project",
        "link": "",
    },
]

CATEGORIES = [
    {"key": "all", "label": "All"},
    {"key": "elixir", "label": "Elixir"},
    {"key": "python", "label": "Python"},
]

JOURNEY = [
    {
        "period": "2026",
        "title": "Moving to Elixir and real-time systems",
        "text": "Rebuilt Pulse in Phoenix LiveView and started ZamHealthWatch, a "
        "public health intelligence platform.",
    },
    {
        "period": "2026",
        "title": "Full-stack Python",
        "text": "Built the Study Planner with Django REST Framework, scikit-learn and React.",
    },
    {
        "period": "2021 – present",
        "title": "BSc Computer Science, University of Zambia",
        "text": "School of Natural and Applied Sciences, Department of Computing and Informatics.",
    },
]
