🚀 RFP Co-pilot: Agentic AI for B2B Sales

Winner/Finalist Project for EY Techathon 6.0

Problem Statement: FMCG (Asian Paints) - Automating B2B Request for Proposals (RFPs)

📖 Overview

RFP Co-pilot is not just a chatbot; it is a multi-agent AI system designed to transform the manual, error-prone process of B2B bidding into a strategic advantage.

Unlike standard text generators, this system employs a team of 5 specialized AI Agents that work together to analyze opportunity costs, draft technical content using internal data (RAG), audit for legal risks, and optimize persuasion strategies.

The "Agentic" Team

Agent 🤖

Role

Function

🧠 The Strategist

Analysis

Reads the RFP to provide a "Bid / No-Bid" decision and calculates Win Probability.

📝 The Drafter

Execution

Uses RAG (Retrieval Augmented Generation) to write technical answers citing internal datasheets.

⚖️ The Compliance

Guardrails

Audits the draft in real-time to flag risks (e.g., "Warranty exceeds 10-year policy").

🎨 The Persuasion

Strategy

Rewrites content to align with client priorities (e.g., Sustainability vs. Cost).

📚 The Librarian

Learning

Monitors human edits to update the Knowledge Base automatically.

🏗️ Architecture

The system uses a Hub-and-Spoke agent architecture orchestrated by a FastAPI backend.

graph TD
    User[User / Sales Manager] -->|Uploads RFP| UI[React/Tailwind Dashboard]
    UI -->|API Request| API[FastAPI Backend]
    
    subgraph "AI Brain (LangChain + Gemini)"
        API --> Strategist
        Strategist -->|Go Decision| Drafter
        Drafter <-->|Retrieve Context| VectorDB[(FAISS Vector DB)]
        Drafter -->|Draft Text| Compliance
        Compliance -->|Risk Flagged| Drafter
        Compliance -->|Approved| Persuasion
    end
    
    Persuasion -->|Final Proposal| UI


🛠️ Tech Stack

Frontend: HTML5, Tailwind CSS, JavaScript (Vanilla ES6) - Lightweight & Fast

Backend: Python 3.12, FastAPI

AI Orchestration: LangChain

LLM Engine: Google Gemini 1.5 Flash

Knowledge Base: FAISS (Vector Database) for RAG

Testing: Pytest

🚀 Installation & Setup

Prerequisites

Python 3.10+

A Google Gemini API Key (Get it here)

1. Clone the Repository

git clone [https://github.com/your-username/rfp-copilot.git](https://github.com/your-username/rfp-copilot.git)
cd rfp-copilot


2. Set up Environment

Create a .env file in the root directory:

GOOGLE_API_KEY=your_actual_api_key_here


3. Install Dependencies

pip install -r requirements.txt


4. Run the Application

Start the Backend Server:

python backend/main.py


Server will start at http://localhost:8000

5. Launch the Dashboard

Simply open frontend/index.html in your browser.

🧪 Testing the Agents

We have included automated test scenarios to verify agent logic.

cd backend
pytest


💡 Key Differentiators (Why this stands out)

Strategic Intelligence: It doesn't just write; it decides if you should write (Bid/No-Bid).

Risk Protection: The Compliance Agent actively prevents the AI from hallucinating false promises (e.g., unlimited warranties).

Closed-Loop Learning: The system gets smarter with every proposal via the Librarian agent.

📜 License

This project is created for educational purposes for the EY Techathon 6.0.
