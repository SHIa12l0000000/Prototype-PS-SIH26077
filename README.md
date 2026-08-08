# 🚀 TechPulse AI

### Autonomous Technology Intelligence & AI Content Platform

TechPulse AI is a full-stack technology intelligence platform designed to discover technology trends, evaluate topics, maintain topic memory, and manage technology news through an autonomous workflow.

The project combines a modern React frontend with a Node.js/TypeScript backend and Supabase-powered data services.

> **Discover → Analyze → Score → Remember → Create → Publish**

---

## 🌐 Live Demo

### TechPulse AI

https://techpulse-ai-olive.vercel.app/

The live application provides the TechPulse dashboard, technology pulse feed, analytics, model monitoring, autonomous status, and pulse submission interface.

---

## 📦 Source Code

### GitHub Repository

https://github.com/SHIa12l0000000/techpulse-ai

The repository is public and contains the project source code.

---

## 🧠 What Is TechPulse AI?

Technology moves extremely quickly. New AI models, developer tools, research papers, infrastructure technologies, and industry trends appear every day.

TechPulse AI is designed to turn this continuously changing information into an organized technology intelligence workflow.

Instead of treating the application as only a news feed, the system is structured around an autonomous pipeline:

```text
Technology Sources
        ↓
Topic Discovery
        ↓
Topic Analysis
        ↓
Editorial Scoring
        ↓
Topic Selection
        ↓
Memory Check
        ↓
Content Workflow
        ↓
TechPulse Feed
```

---

# ⚡ Core Features

## 🔎 Technology Topic Discovery

TechPulse AI uses technology/news feeds to discover potential topics for the intelligence pipeline.

The backend includes RSS-based feed processing and topic-oriented services.

---

## 📊 Editorial Scoring

Discovered topics can be evaluated using editorial signals such as:

* Topic relevance
* Source volume
* Topic velocity
* Keywords
* Editorial impact
* Technology category

The scoring layer helps determine which topics deserve attention.

---

## 🧠 Topic Memory

TechPulse AI includes a memory-oriented workflow for keeping track of previously processed topics.

The purpose is to reduce unnecessary repetition and allow the autonomous workflow to make decisions using previously processed information.

Conceptually:

```text
New Topic
    ↓
Memory Check
    ↓
Already Processed?
   /       \
 Yes       No
  ↓         ↓
 Skip     Continue
             ↓
        Content Workflow
             ↓
        Store Memory
```

---

## 🤖 Autonomous AI Creator

The application includes an autonomous content-creation workflow designed to coordinate multiple stages of the technology intelligence pipeline.

The workflow is structured around:

```text
Discover
   ↓
Evaluate
   ↓
Decide
   ↓
Remember
   ↓
Create
   ↓
Publish
```

The objective is to reduce the amount of manual work required to turn emerging technology topics into TechPulse content.

---

## 📰 TechPulse News Feed

The frontend provides a technology pulse feed for displaying technology and AI-related content.

Users can explore technology pulses and view information such as:

* Title
* Summary
* Category
* Source
* Sentiment
* Impact score
* Tags
* Publication information

---

## 📈 Technology Analytics

The dashboard includes technology intelligence and analytics components designed to provide a high-level view of the platform.

The frontend includes components for:

* Trend analytics
* Sentiment breakdown
* Hero metrics
* Autonomous status
* Model monitoring
* Technology news feed

---

## 🧪 Pulse Submission

TechPulse AI also provides a manual pulse submission workflow.

A user can submit information such as:

```text
Article Title
Summary
Category
Sentiment
Author
Source URL
```

This provides a manual entry point alongside the autonomous content workflow.

---

# 🏗️ Architecture

```text
                    ┌─────────────────────────┐
                    │ Technology / RSS Feeds  │
                    └────────────┬────────────┘
                                 ↓
                    ┌─────────────────────────┐
                    │   Topic Discovery       │
                    └────────────┬────────────┘
                                 ↓
                    ┌─────────────────────────┐
                    │   Editorial Scoring     │
                    └────────────┬────────────┘
                                 ↓
                    ┌─────────────────────────┐
                    │   Topic Selection       │
                    └────────────┬────────────┘
                                 ↓
                    ┌─────────────────────────┐
                    │    Memory Check         │
                    └────────────┬────────────┘
                                 ↓
                    ┌─────────────────────────┐
                    │ Content Generation      │
                    │       Workflow          │
                    └────────────┬────────────┘
                                 ↓
                    ┌─────────────────────────┐
                    │     Memory Storage      │
                    └────────────┬────────────┘
                                 ↓
                    ┌─────────────────────────┐
                    │     TechPulse Feed      │
                    └─────────────────────────┘
```

---

# 🛠️ Technology Stack

## Frontend

* React
* TypeScript
* Vite
* CSS
* Modern component-based UI

## Backend

* Node.js
* TypeScript
* Express
* REST APIs
* RSS Parser
* Modular service architecture

## Database / Data Services

* Supabase

## Development

* Git
* GitHub
* npm
* TypeScript
* Environment variables

## Deployment

* Vercel

---

# 📁 Project Structure

```text
techpulse-ai/
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── services/
│   │   └── types/
│   │
│   ├── package.json
│   ├── index.html
│   └── vite.config.ts
│
├── server/
│   ├── src/
│   │   ├── services/
│   │   ├── models/
│   │   └── ...
│   │
│   ├── package.json
│   └── tsconfig.json
│
├── PROMPTS.md
├── README.md
├── package.json
├── package-lock.json
│
└── .gitignore
```

---

# 🔄 Autonomous Workflow

A typical TechPulse autonomous cycle is designed to follow this sequence:

### 1. Discover

Technology topics are collected from available technology/news sources.

### 2. Analyze

The system processes the discovered information and extracts relevant topic signals.

### 3. Score

Topics receive editorial evaluation based on available signals.

### 4. Select

The strongest candidate is selected for the next stage.

### 5. Remember

The system checks previously processed topics to reduce duplication.

### 6. Create

The selected topic enters the content-generation workflow.

### 7. Store

Relevant topic/content information can be retained as part of the platform's memory workflow.

### 8. Publish

The resulting technology pulse can be added to the TechPulse feed.

---

# 🧠 Memory-Driven Intelligence

One of the important design ideas behind TechPulse AI is that an autonomous system should not treat every execution as completely independent.

Without memory:

```text
Cycle 1 → Topic A
Cycle 2 → Topic A
Cycle 3 → Topic A
```

With topic memory:

```text
Cycle 1 → Topic A → Process → Remember

Cycle 2 → Topic A → Memory Check → Avoid Duplicate

Cycle 3 → New Topic → Process
```

This creates a more useful foundation for continuous autonomous operation.

---

# 🔌 Backend API

The backend exposes REST endpoints used by the frontend and autonomous workflow.

The API layer is responsible for communication between the dashboard and backend services.

The backend is implemented using:

* Node.js
* Express
* TypeScript
* REST APIs
* Supabase services
* RSS processing

---

# 🔐 Environment Variables

Secrets should never be committed to the public repository.

Configure environment variables locally or in the deployment platform.

Typical environment configuration may include:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

Use the exact variable names expected by the current application configuration.

> **Important:** Never place real API keys, passwords, access tokens, or database secrets inside `README.md` or commit them to GitHub.

---

# 🤖 AI Provider Note

TechPulse AI is designed with an AI-powered content workflow.

The repository currently focuses on the autonomous intelligence architecture, topic processing, memory workflow, news feed, and backend services.

An external generative AI provider/API key is **not required to understand or run the basic dashboard and project structure**.

If an AI provider is configured for a particular deployment, its credentials should be supplied through secure environment variables rather than committed to the repository.

---

# 🚀 Running Locally

## 1. Clone the repository

```bash
git clone https://github.com/SHIa12l0000000/techpulse-ai.git
```

```bash
cd techpulse-ai
```

## 2. Install dependencies

For the root project:

```bash
npm install
```

For the frontend:

```bash
cd client
npm install
```

For the backend:

```bash
cd ../server
npm install
```

## 3. Configure environment variables

Create the required local environment configuration for your deployment.

Do not commit secrets.

## 4. Start the backend

From the `server` directory:

```bash
npm run dev
```

## 5. Start the frontend

From the `client` directory:

```bash
npm run dev
```

The exact development port may depend on the local Vite configuration.

---

# 🎥 Vibe-Coding Development Proof

TechPulse AI was developed using AI-assisted programming and iterative prompting.

The complete development prompt history is available in:

### PROMPTS.md

https://github.com/SHIa12l0000000/techpulse-ai/blob/main/PROMPTS.md

This document provides evidence of the AI-assisted development process and shows the iterative workflow used while building the project.

---

# 🏆 Why TechPulse AI?

Most technology dashboards simply display information.

TechPulse AI is designed around a different idea:

> **A technology intelligence system should be able to discover information, evaluate it, remember what it has already processed, and participate in the content workflow.**

The project therefore combines:

* Technology discovery
* Editorial intelligence
* Topic scoring
* Memory
* Autonomous workflow
* Content management
* Analytics
* Technology news

into a single platform.

---

# 🔮 Future Improvements

Potential future improvements include:

* Advanced generative AI integration
* More technology/news sources
* Improved topic-ranking algorithms
* Semantic/vector memory
* Automated fact verification
* Multi-agent editorial workflows
* Personalized technology feeds
* Automated social-media publishing
* Real-time trend detection
* Advanced source credibility scoring

---

# 🌐 Important Links

### 🚀 Live Demo

https://techpulse-ai-olive.vercel.app/

### 💻 GitHub Repository

https://github.com/SHIa12l0000000/techpulse-ai

### 🧠 Vibe-Coding Prompts

https://github.com/SHIa12l0000000/techpulse-ai/blob/main/PROMPTS.md

---

# 👨‍💻 Project

## TechPulse AI

**Autonomous Technology Intelligence Platform**

Built to explore how autonomous software agents can discover, evaluate, remember, and transform technology information into useful content.

### Discover. Analyze. Remember. Create. Publish. 🚀
