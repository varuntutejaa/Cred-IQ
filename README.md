<div align="center">

<img src="https://img.shields.io/badge/CredIQ-Developer%20Verification%20Platform-6366f1?style=for-the-badge&logo=shield&logoColor=white" alt="CredIQ" />

# CredIQ — Stop Trusting Resumes. Start Verifying Builders.

**The world's first Developer Verification + Recruiter Intelligence Platform**

*LinkedIn meets GitHub meets HackerRank — verified, not claimed.*

[![React](https://img.shields.io/badge/React_18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Flask](https://img.shields.io/badge/Flask-000000?style=flat-square&logo=flask&logoColor=white)](https://flask.palletsprojects.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://mongodb.com)
[![Python](https://img.shields.io/badge/Python_3.11-3776AB?style=flat-square&logo=python&logoColor=white)](https://python.org)

</div>

---

## The Problem

Every developer resume says *"Proficient in Python, AWS, React"*. But:

- **86% of technical resumes** contain at least one unverifiable or inflated skill claim
- Recruiters spend **4–6 hours per candidate** manually reviewing GitHub profiles
- Developers with genuine skills lose out to well-formatted-but-hollow CVs
- Companies waste **$40,000+ per bad hire** on unverified talent

> **CredIQ makes every claim machine-verifiable in under 10 seconds.**

---

## What CredIQ Does

```
Resume says "Python Expert"     →  CredIQ finds 12 repos, 847 commits, 1 live deployment → VERIFIED ✓
Resume says "AWS Certified"     →  CredIQ finds 0 repos with AWS usage                   → FLAGGED  ⚠
Repo added 2 days ago, 15K LOC  →  CredIQ detects bulk-generated vibe code               → FLAGGED  ⚠
Developer has 9 live projects   →  CredIQ pings each URL, checks HTTPS + uptime          → VERIFIED ✓
```

---

## Key Features

### 👨‍💻 Developer Side
| Feature | Description |
|---|---|
| **Resume Verification Engine** | Upload PDF → Every skill claim verified against real GitHub data |
| **GitHub Deep Analysis** | Commit history, language distribution, code quality radar |
| **Skill Evidence Map** | Each claimed skill traced to concrete repos, commits, deployments |
| **Builder Confidence Score** | Signature feature — answers "can this person actually build?" |
| **Fake Project Detection** | ML flags single-commit repos, copy-pasted code, vibe code |
| **Deployment Verifier** | Pings Vercel, Netlify, Render, Railway — confirms HTTPS + uptime |
| **Certificate Validator** | Validates cert URLs, QR codes, expiry dates against issuer DBs |
| **Code Complexity Evaluator** | Cyclomatic complexity, maintainability index, per-file risk analysis |
| **Dev Timeline** | Auto-generated career story from first commit to latest deployment |
| **Achievements & Milestones** | Gamified progress across GitHub, deployments, certs, trust score |
| **AI Career Insights** | LLM-powered strengths, weaknesses, skill gaps, learning path |
| **Proof Chain** | Full end-to-end chain: Resume → GitHub → Deploy → Cert → Verified |

### 🏢 Recruiter Side
| Feature | Description |
|---|---|
| **One-Click Verification** | Enter GitHub username → Full verified report in <10 seconds |
| **Vibe Code Detector** | Detects AI-generated/vibe-coded repos using linguistic & pattern analysis |
| **Candidate Search** | Filter by trust score, skills, tech stack, experience, verification status |
| **Compare Candidates** | Head-to-head metric bars + radar chart overlay for any two profiles |
| **Shortlists** | Organize verified candidates into named lists |
| **Recruiter Analytics** | Trust score distribution, skill demand vs supply, pipeline trends |
| **Verification Reports** | Downloadable PDF reports for every verified candidate |

---

## Tech Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| **React** | 18.x | UI framework |
| **Vite** | 5.x | Build tool & dev server |
| **Tailwind CSS** | 3.x | Utility-first styling (dark glassmorphism theme) |
| **Framer Motion** | 11.x | Animations, layout transitions, scroll triggers |
| **Recharts** | 2.x | AreaChart, BarChart, RadarChart, PieChart |
| **React Router v6** | 6.x | Client-side routing, nested routes, role guards |
| **Axios** | 1.x | HTTP client for API communication |
| **Lucide React** | 0.x | Icon library (450+ SVG icons) |
| **React Hot Toast** | 2.x | Toast notification system |
| **React Dropzone** | 14.x | PDF drag-and-drop for resume upload |
| **React CountUp** | 6.x | Animated number counters |

### Backend
| Technology | Version | Purpose |
|---|---|---|
| **Python** | 3.11+ | Core runtime |
| **Flask** | 3.x | REST API framework |
| **Flask-JWT-Extended** | 4.x | JWT authentication & role-based access |
| **Flask-CORS** | 4.x | Cross-origin resource sharing |
| **Flask-Limiter** | 3.x | Rate limiting |
| **MongoDB** | 7.x | Primary database (users, profiles, verifications) |
| **PyMongo** | 4.x | MongoDB driver |
| **Motor** | 3.x | Async MongoDB driver for background tasks |
| **PyGitHub** | 2.x | GitHub REST API v3 integration |
| **httpx** | 0.x | Async HTTP client for deployment ping checks |
| **Redis** | 5.x | Caching GitHub API responses, session store |
| **Celery** | 5.x | Background task queue (async repo analysis) |
| **OpenAI / Anthropic SDK** | latest | LLM-powered AI insights & code analysis |
| **Gunicorn** | 21.x | Production WSGI server |
| **Pytest** | 7.x | Test suite |

### Infrastructure / DevOps
| Technology | Purpose |
|---|---|
| **Docker + Docker Compose** | Containerised local + production environment |
| **GitHub Actions** | CI/CD pipeline (lint → test → build → deploy) |
| **Render / Railway** | Backend deployment |
| **Vercel** | Frontend deployment |
| **MongoDB Atlas** | Managed cloud database |
| **Redis Cloud** | Managed Redis instance |

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                        CLIENT                           │
│   React + Vite   │  Tailwind  │  Framer Motion          │
│   Role-Based Routing (Developer / Recruiter)            │
└─────────────────────┬───────────────────────────────────┘
                      │  HTTPS / REST API
┌─────────────────────▼───────────────────────────────────┐
│                   FLASK API SERVER                       │
│  /auth  /verify  /github  /resume  /recruiter           │
│  JWT Auth │ Rate Limiting │ CORS                        │
└──────┬──────────────┬──────────────────┬────────────────┘
       │              │                  │
┌──────▼──────┐ ┌─────▼──────┐ ┌────────▼───────┐
│   MongoDB   │ │   Redis    │ │  Celery Worker  │
│  (Primary   │ │  (Cache +  │ │  (Async GitHub  │
│   Store)    │ │  Sessions) │ │   Analysis)     │
└─────────────┘ └────────────┘ └────────┬────────┘
                                        │
                               ┌────────▼────────┐
                               │  External APIs  │
                               │  GitHub API v3  │
                               │  OpenAI / Claude│
                               │  Cert Issuers   │
                               └─────────────────┘
```

---

## Dual-Role System

```
Landing Page
    │
    ├── Developer Flow ──→ /dashboard/*
    │     ├── Resume Verification
    │     ├── GitHub Analysis
    │     ├── Skill Map
    │     ├── Builder Confidence Score  ← Signature Feature
    │     ├── Code Complexity Evaluator
    │     ├── Deployments, Certs, Proof Chain
    │     └── Timeline, Achievements, Milestones
    │
    └── Recruiter Flow ──→ /recruiter/*
          ├── Candidate Search + Filters
          ├── One-Click Quick Verify
          ├── Vibe Code Detector         ← AI-Generated Code Detection
          ├── Compare Candidates
          ├── Shortlists + Reports
          └── Pipeline Analytics
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- Python 3.11+
- MongoDB 7.x (local or Atlas URI)
- Redis (local or cloud)

### Frontend

```bash
cd frontend
npm install
npm run dev          # http://localhost:5173
```

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate    # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env        # fill in your API keys
flask run                   # http://localhost:5000
```

### With Docker (recommended)

```bash
docker compose up --build
```

Frontend → `http://localhost:5173`  
Backend  → `http://localhost:5000`

---

## Environment Variables

### Backend `.env`
```env
FLASK_ENV=development
SECRET_KEY=your-secret-key
JWT_SECRET_KEY=your-jwt-secret

MONGO_URI=mongodb://localhost:27017/crediq
REDIS_URL=redis://localhost:6379/0

GITHUB_CLIENT_ID=your-github-oauth-client-id
GITHUB_CLIENT_SECRET=your-github-oauth-client-secret
GITHUB_ACCESS_TOKEN=your-personal-access-token

OPENAI_API_KEY=your-openai-key
ANTHROPIC_API_KEY=your-anthropic-key
```

### Frontend `.env`
```env
VITE_API_URL=http://localhost:5000/api
```

---

## Project Structure

```
Cred-IQ/
├── frontend/                          # React + Vite application
│   ├── src/
│   │   ├── components/
│   │   │   ├── dashboard/             # Developer dashboard components
│   │   │   │   ├── BuilderConfidence.jsx   ← Signature feature
│   │   │   │   ├── CodeComplexity.jsx      ← Complexity evaluator
│   │   │   │   ├── GitHubAnalyzer.jsx
│   │   │   │   ├── ResumeVerifier.jsx
│   │   │   │   ├── SkillMap.jsx
│   │   │   │   └── ...15 more components
│   │   │   ├── recruiter/             # Recruiter dashboard components
│   │   │   │   ├── VibeCodeDetector.jsx    ← AI code detection
│   │   │   │   ├── QuickVerify.jsx
│   │   │   │   ├── CandidateSearch.jsx
│   │   │   │   └── ...5 more components
│   │   │   ├── landing/               # Marketing landing page
│   │   │   └── shared/                # TechLogo, ProfileDrawer
│   │   ├── pages/                     # Route-level page components
│   │   ├── context/                   # AuthContext (role-based auth)
│   │   └── main.jsx
│   ├── tailwind.config.js             # Custom design system
│   └── package.json
│
├── backend/                           # Flask REST API
│   ├── app/
│   │   ├── routes/                    # API route handlers
│   │   │   ├── auth.py
│   │   │   ├── github.py
│   │   │   ├── resume.py
│   │   │   ├── verify.py
│   │   │   └── recruiter.py
│   │   ├── models/                    # MongoDB document schemas
│   │   │   ├── user.py
│   │   │   ├── verification.py
│   │   │   └── report.py
│   │   ├── services/                  # Business logic
│   │   │   ├── github_service.py
│   │   │   ├── trust_engine.py
│   │   │   ├── builder_score.py
│   │   │   └── ai_insights.py
│   │   └── utils/                     # Helpers, validators
│   ├── requirements.txt
│   └── run.py
│
├── docker-compose.yml
└── README.md
```

---

## Core Algorithms

### Trust Score Engine
Weighted composite across 6 independent dimensions:
```
Trust Score = (
  GitHub Activity     × 0.20 +
  Project Authenticity× 0.20 +
  Certificates        × 0.15 +
  Live Deployments    × 0.20 +
  Resume Accuracy     × 0.15 +
  Proof Chain         × 0.10
)
```

### Builder Confidence Score
```
Builder Score = (
  Evidence Strength        × 0.20 +
  Consistency              × 0.15 +
  Project Completion Rate  × 0.18 +
  Deployment Quality       × 0.20 +
  Technical Breadth        × 0.12 +
  Technical Depth          × 0.10 +
  Open Source Participation× 0.05
)
```

### Vibe Code Detection
Signals analysed to detect AI-generated code:
- Commit message linguistic entropy
- Variable naming consistency (too uniform = AI)
- Function length variance
- Commit timing distribution (2–4am bulk = red flag)
- Boilerplate signature fingerprinting
- Complexity growth curve vs experience level

---

## Screenshots

> *Demo mode available — no sign-up required*

| Landing Page | Developer Dashboard | Recruiter Dashboard |
|---|---|---|
| Hero + animated skill verification | Builder Confidence Score | Vibe Code Detector |
| Trust Score Breakdown | Code Complexity Evaluator | One-Click Quick Verify |
| Developer & Recruiter flows | Skill Evidence Map | Candidate Comparison |

---

## Roadmap

- [x] Role-based auth (Developer / Recruiter)
- [x] Full developer dashboard (15 tools)
- [x] Full recruiter dashboard (7 tools)
- [x] Builder Confidence Score (signature feature)
- [x] Vibe Code Detector
- [x] Code Complexity Evaluator
- [x] Tech logo system (20+ technologies)
- [ ] Real GitHub OAuth integration
- [ ] Live deployment ping engine
- [ ] Certificate issuer API integrations
- [ ] PDF report generation
- [ ] Team / org accounts
- [ ] Public verified profile page (`crediq.dev/@handle`)
- [ ] Browser extension for LinkedIn integration

---

## Why CredIQ Wins

| Traditional Hiring | CredIQ |
|---|---|
| Trust the resume | Verify the work |
| 4–6 hrs manual review | < 10 seconds automated |
| Subjective gut feel | Objective Trust Score |
| Missed genuine talent | Evidence-based decisions |
| AI resume fraud undetected | Vibe Code Detector flags it |

---

<div align="center">

**Built for the builders who ship, not the writers who claim.**

[![GitHub](https://img.shields.io/badge/GitHub-varuntutejaa-181717?style=flat-square&logo=github)](https://github.com/varuntutejaa)

*Made with obsession, not just code.*

</div>
