# 🚀 TechPulse AI

### Autonomous AI-Powered Tech Intelligence & Content Creator

TechPulse AI is an autonomous technology intelligence engine that discovers emerging AI and technology topics, evaluates their editorial importance, checks previous memory to avoid repetition, generates content with AI, and publishes the resulting tech pulse automatically.

The goal is simple:

> **Discover → Analyze → Remember → Create → Publish**

---

## 🌐 Live Demo

**Try TechPulse AI:**
https://techpulse-ai-olive.vercel.app/

---

## 📦 Source Code

**GitHub Repository:**
https://github.com/SHIa12l0000000/techpulse-ai

The repository is public and contains the complete project source code.

---

## 🧠 What Makes TechPulse AI Autonomous?

Traditional content systems require a person to manually choose a topic, write an article, and publish it.

TechPulse AI is designed to automate this workflow.

### Autonomous workflow

```text
Live Technology Discovery
        ↓
Topic Analysis
        ↓
Editorial Scoring
        ↓
Best Topic Selection
        ↓
Memory Check
        ↓
AI Content Generation
        ↓
Memory Storage
        ↓
Publish to TechPulse Feed
```

The system can continuously evaluate technology topics and decide what content should be generated next.

---

## ⚡ Core Features

### 🔎 Autonomous Topic Discovery

TechPulse AI discovers technology and AI topics from available news/feed sources and identifies potential topics for the content pipeline.

### 📊 Editorial Intelligence

Topics are evaluated using editorial signals such as:

* Topic relevance
* Source volume
* Growth/velocity
* Keywords
* Editorial impact

The system selects the topic with the strongest editorial potential.

### 🧠 Long-Term Memory

Before generating content, TechPulse AI checks its existing memory.

This helps prevent the system from repeatedly creating content about the same topic.

```text
New Topic
   ↓
Memory Check
   ↓
Already Known?
 ┌───────┴───────┐
 Yes             No
 ↓                ↓
Skip             Generate
                  ↓
              Store Memory
```

### 🤖 AI Content Generation

Selected topics are passed to the AI content-generation layer to create a complete technology news pulse.

The generated content can include:

* Article text
* Summary/rationale
* Sources
* Category
* Tags
* Editorial impact information

### 📰 Autonomous Publishing

After generation, the article is added to the TechPulse feed automatically.

No manual copy-paste publishing step is required in the autonomous workflow.

### 👤 Consistent AI Persona

The content-generation system uses the **TechPulse AI** identity to maintain a consistent editorial personality across generated content.

---

## 🏗️ Architecture

```text
                    ┌──────────────────────┐
                    │  Technology Sources  │
                    └──────────┬───────────┘
                               ↓
                    ┌──────────────────────┐
                    │ Topic Discovery      │
                    └──────────┬───────────┘
                               ↓
                    ┌──────────────────────┐
                    │ Editorial Scoring    │
                    └──────────┬───────────┘
                               ↓
                    ┌──────────────────────┐
                    │ Topic Selection      │
                    └──────────┬───────────┘
                               ↓
                    ┌──────────────────────┐
                    │ Memory Check         │
                    └──────────┬───────────┘
                               ↓
                    ┌──────────────────────┐
                    │ AI Content Generator │
                    └──────────┬───────────┘
                               ↓
                    ┌──────────────────────┐
                    │ Memory Storage       │
                    └──────────┬───────────┘
                               ↓
                    ┌──────────────────────┐
                    │ TechPulse Feed       │
                    └──────────────────────┘
```

---

## 🎯 Autonomous Decision Loop

The core idea behind TechPulse AI is that the system should not simply respond to a button click.

It should be able to operate as an intelligent workflow:

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
   ↓
Repeat
```

This transforms the project from a simple AI article generator into an **autonomous content-creation workflow**.

---

## 🧩 Main Components

The project is organized around separate services responsible for different stages of the autonomous pipeline.

### Editorial Scoring

Responsible for evaluating discovered topics and determining which topic deserves attention.

### AI Content Generation

Responsible for transforming the selected topic into a publishable TechPulse article.

### Memory Service

Responsible for remembering previously processed topics and providing previous context to the AI workflow.

### News Service

Responsible for managing generated technology news items and the TechPulse feed.

### Agent / Autonomous Workflow

Coordinates the different stages of the autonomous process.

### Gemini Integration

Provides the generative AI capability used for creating the content.

---

## 🔄 Example Autonomous Cycle

A typical cycle looks like this:

```text
1. Discover emerging AI topic

2. Analyze the topic

3. Calculate editorial score

4. Select the strongest topic

5. Check long-term memory

6. Skip if the topic has already been processed

7. Send new topic + context to AI

8. Generate TechPulse article

9. Store topic in memory

10. Publish article to the feed
```

---

## 🛠️ Technology Stack

TechPulse AI is built as a modern web application with a separate frontend/backend architecture.

### Frontend

* React
* TypeScript
* Vite
* Modern web UI

### Backend

* Node.js
* TypeScript
* Autonomous services
* REST API

### AI

* Google Gemini
* AI-powered content generation

### Development

* Git
* GitHub
* Environment variables
* Modular service architecture

### Deployment

* Vercel for the live web application

---

## 📁 Project Structure

The repository is organized into frontend and backend components.

```text
techpulse-ai/
│
├── client/
│   └── Frontend application
│
├── server/
│   └── Backend and autonomous services
│
├── PROMPTS.md
│   └── AI-assisted development history
│
├── package.json
│
└── README.md
```

The backend contains the autonomous intelligence services responsible for discovery, scoring, memory, AI generation, and publishing.

---

## 🔐 Environment Variables

API keys and other secrets should **not** be committed to GitHub.

For local development, configure the required environment variables in your local environment.

Example:

```env
GEMINI_API_KEY=your_api_key_here
```

> Never commit real API keys, tokens, passwords, or other secrets to the repository.

---

## 🚀 Running Locally

Clone the repository:

```bash
git clone https://github.com/SHIa12l0000000/techpulse-ai.git
```

Enter the project:

```bash
cd techpulse-ai
```

Install dependencies:

```bash
npm install
```

Configure your environment variables.

Then start the application using the project's configured development commands.

---

## 🧪 Autonomous AI Creator

The project includes an **Autonomous AI Creator** workflow.

Its purpose is to demonstrate that AI can perform multiple stages of a content workflow rather than only generating text from a manually supplied prompt.

The autonomous pipeline combines:

* Discovery
* Evaluation
* Decision making
* Memory
* Generative AI
* Publishing

---

## 🧠 Why Memory Matters

Without memory:

```text
Topic A → Generate
Topic A → Generate again
Topic A → Generate again
```

With memory:

```text
Topic A → Generate → Remember

Topic A → Memory Check → Skip
```

This allows the autonomous agent to maintain continuity across content-generation cycles.

---

## 📈 Vision

TechPulse AI is designed as a foundation for a future autonomous technology intelligence platform.

Potential future capabilities include:

* More technology sources
* Better topic-ranking algorithms
* Deeper long-term memory
* Multi-agent editorial workflows
* Automatic fact verification
* More advanced personalization
* Automated social-media distribution
* Real-time technology trend detection

---

## 🎥 Vibe-Coding / AI Development Proof

The project was developed with AI-assisted coding and iterative prompting.

The development prompts and workflow are documented here:

**PROMPTS.md**

https://github.com/SHIa12l0000000/techpulse-ai/blob/main/PROMPTS.md

This document provides the development history and demonstrates how AI assistance was used during the build process.

---

## 🌐 Links

### Live Application

https://techpulse-ai-olive.vercel.app/

### GitHub

https://github.com/SHIa12l0000000/techpulse-ai

### AI Development Prompts

https://github.com/SHIa12l0000000/techpulse-ai/blob/main/PROMPTS.md

---

## 🏆 Project Summary

**TechPulse AI** is an autonomous AI technology-intelligence and content-generation system.

Instead of requiring a human to manually select a topic, write content, and publish it, the system aims to automate the complete pipeline:

```text
DISCOVER
   ↓
ANALYZE
   ↓
DECIDE
   ↓
REMEMBER
   ↓
GENERATE
   ↓
PUBLISH
```

### Built with AI. Designed to act autonomously. 🚀

---

## 👨‍💻 Project

**TechPulse AI**

An autonomous technology intelligence engine for discovering, understanding, and creating technology content.
