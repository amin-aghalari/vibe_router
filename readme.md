# Vibe Router 🗺️✨

Vibe Router is a modern, full-stack web application designed to optimize travel and exploration using AI-driven orchestration and global location mapping. Built with a fast Python backend and a highly responsive, mobile-first frontend dashboard, the app provides a seamless experience for both local exploration and high-density vacation planning.

## 🚀 Key Features

*   **Local Vibe Router:** Leverages real-time device geolocation alongside abstract user mood text and vibe tags. It uses OpenAI to interpret emotions and queries the modern Google Places API to route the user to immediate local destinations matching their vibe.
*   **The Travel Leader (80% Must-See Explorer):** Built for city-wide high-density trip planning. Users input a target destination and an explicit timeframe (12h to 72h). The engine intelligently extracts the top cultural and tourist milestones, hydrates them with precise location metadata, and sequences them sequentially to eliminate backtracking.

---

## 🛠️ Tech Stack

*   **Frontend:** React, Vite, Tailwind CSS, Lucide Icons
*   **Backend:** FastAPI (Python), Uvicorn, Pydantic, HTTPX
*   **AI & Core Data Integrations:** OpenAI API (`gpt-3.5-turbo`), Google Places API (New Engine)

---

## 💻 Installation & Setup

Ensure you have **Python 3.10+** and **Node.js (v18+)** installed on your local machine before getting started.

### 1. Repository & Root Directory
If you haven't already cloned the repository, open your terminal and navigate to your project directory:
```bash
cd C:\pythonprojects\vibe_router


Frontend Setup (React + Vite)
cd C:\pythonprojects\vibe_router\frontend
npm install


🏁 Launching the Application
Step 1: Start the Backend Server

cd C:\pythonprojects\vibe_router\backend
uvicorn app.main:app --reload

Step 2: Start the Frontend App
cd C:\pythonprojects\vibe_router\frontend
npm run dev


Vite will instantly initialize your interface and provide a local web address, typically: http://localhost:5174 (or 5173).