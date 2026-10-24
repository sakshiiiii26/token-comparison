# Binjwa AI Cost Platform

Binjwa AI Cost Platform is an enterprise-grade system designed to manage, monitor, and optimize AI model token usage and costs across different organizations, teams, and employees.

## 🚀 Features
- **User Management**: Hierarchical role-based access control for Super Admins, Client Admins, and Employees.
- **AI Model Management**: Configure, track, and compare multiple AI models & multimodal providers (OpenAI, Google, Groq, ElevenLabs, Deepgram, etc.).
- **Token Management**: Allocate, update, and monitor real-time token balances and budgets.
- **Cost Tracking & Optimization**: Automated usage logs, telemetry, and smart routing cost analysis.

## 🛠️ Tech Stack
- **Frontend**: React 18, Vite, Lucide Icons, Nginx
- **Backend Framework**: FastAPI (Python 3.10+)
- **Database**: MongoDB
- **Validation**: Pydantic v2
- **Server**: Uvicorn & Gunicorn
- **Containerization**: Docker & Docker Compose

## 📂 Project Structure
- `backend/`: Core FastAPI application, security, and API routes.
- `frontend/`: React 18 frontend dashboard and analytics UI.
- `database/`: Database configuration and scripts.
- `docs/`: System architecture, API documentation, and flow diagrams.

---

## ⚡ Quick Deployment (Docker)

To deploy the complete application (Frontend + Backend + MongoDB) in one command:

```bash
# 1. Copy sample environment file
cp .env.example .env

# 2. Build and launch all services
docker compose up -d --build
```

- **Frontend Application**: [http://localhost](http://localhost) (Port 80)
- **API Swagger Documentation**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **Health Check API**: [http://localhost:8000/health](http://localhost:8000/health)

For comprehensive cloud deployment guides (Render, Railway, Vercel, Netlify, Ubuntu/AWS VPS with SSL), see [DEPLOYMENT.md](./DEPLOYMENT.md).

---

## ⚙️ Manual Local Development

### 1. Backend
```bash
cd backend
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### 2. Frontend
```bash
cd frontend
npm install
npm run dev
```
Access frontend dev server at `http://localhost:5173`.
