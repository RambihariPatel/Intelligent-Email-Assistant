# ?? Intelligent Email Assistant (AI-Powered)

An advanced, full-stack email management application that integrates seamlessly with your Gmail account. Powered by Google's Gemini AI, this assistant goes beyond a standard inbox by automatically summarizing long threads, drafting intelligent replies in various tones, extracting action items, and proactively detecting spam.

## ? Key Features

- **OAuth 2.0 Gmail Integration**: Securely log in with Google and manage your real inbox without exposing your credentials.
- **AI-Powered Summarization**: Instantly summarize long emails into concise bullet points using Gemini AI.
- **Smart Reply Generation**: Automatically draft email replies. Choose from 4 unique tones: *Professional, Friendly, Formal, or Concise*.
- **Action Item Extraction**: AI scans the email body and extracts tasks, deadlines, and action items into a clean checklist.
- **AI Categorization & Tagging**: Automatically classify incoming emails (e.g., *Important, Newsletter, Promotional*) with a single click.
- **Spam & Phishing Shield**: AI analyzes the tone, links, and urgency of emails to flag potential phishing attempts or spam before you click.
- **Full Email Management**: Read, send, reply, and move emails to trash directly from the beautiful UI.

## ??? Tech Stack

**Frontend:**
- React (Vite)
- TypeScript
- Tailwind CSS (for modern, responsive UI)
- Zustand (State Management)
- Lucide React (Icons)
- React Router DOM

**Backend:**
- Node.js & Express.js
- TypeScript
- MongoDB & Mongoose
- Google APIs (`googleapis`) for Gmail integration
- Google GenAI SDK (`@google/genai`) for Gemini 2.5 Flash

## ?? Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB account (MongoDB Atlas)
- Google Cloud Console Project (with Gmail API enabled and OAuth credentials)
- Google Gemini API Key

### 1. Clone the repository
```bash
git clone https://github.com/RambihariPatel/Intelligent-Email-Assistant.git
cd Intelligent-Email-Assistant
```

### 2. Environment Setup

**Backend `.env` (in `/backend`):**
```env
PORT=5000
FRONTEND_URL=http://localhost:5173
JWT_SECRET=your_jwt_secret
MONGODB_URI=your_mongodb_connection_string
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:5000/api/auth/google/callback
GEMINI_API_KEY=your_gemini_api_key
```

**Frontend `.env` (in `/frontend`):**
```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Installation & Running Locally

**Install and start Backend:**
```bash
cd backend
npm install
npm run dev
```

**Install and start Frontend:**
```bash
cd frontend
npm install
npm run dev
```

The frontend will run at `http://localhost:5173` and backend at `http://localhost:5000`.

## ?? Deployment

This project is configured for cloud deployment:
- **Backend (Render):** Uses the `build` (`tsc`) and `start` (`node dist/server.js`) scripts. Set the root directory to `backend`.
- **Frontend (Vercel):** Select Vite as the preset and set the root directory to `frontend`. Note: Ensure a `vercel.json` rewrite rule is applied for SPA routing.

*(Make sure to update the `FRONTEND_URL` and `GOOGLE_REDIRECT_URI` environment variables and Google Cloud Credentials for the production URLs).*

## ?? Security & Privacy
This application requests read, write, and send access to your Gmail. Tokens are securely encrypted and handled via standard OAuth 2.0 flows. No email content is stored permanently in the MongoDB database; it is fetched on-the-fly from Google's servers.

---
*Built as a showcase for integrating LLMs into daily productivity tools.*
