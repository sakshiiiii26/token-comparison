# 🚀 Binjwa AI Cost Platform - Deployment Guide

This guide covers everything required to deploy the **Binjwa AI Cost Platform** to any environment — from a single local Docker command to managed cloud providers (Render, Railway, Vercel) and production Linux VPS servers (AWS, DigitalOcean, Hetzner, etc.).

---

## 📋 Architecture Overview

The system consists of three coordinated tiers:
1. **Frontend**: React 18 + Vite SPA, served via an optimized Nginx container with gzip compression, security headers, and reverse proxy routing.
2. **Backend**: FastAPI (Python 3.10+) ASGI server running Uvicorn/Gunicorn with automated database seeding on startup and `/health` monitoring.
3. **Database**: MongoDB (v6.0+) persistent document store.

---

## ⚡ Option 1: One-Command Docker Deployment (Recommended)

The easiest way to run the entire stack with MongoDB, Backend, and Frontend configured and networked:

### Prerequisites
- [Docker](https://docs.docker.com/get-docker/) & [Docker Compose](https://docs.docker.com/compose/) installed.

### Steps
1. **Clone the repository and enter the directory**:
   ```bash
   git clone <repo-url>
   cd Binjwa-ai-cost-platform
   ```

2. **Configure your environment**:
   ```bash
   cp .env.example .env
   ```
   *(Optionally edit `.env` to set your `OPENROUTER_API_KEY` and a unique `JWT_SECRET_KEY`)*

3. **Start all services**:
   ```bash
   docker compose up -d --build
   ```

4. **Verify running containers**:
   ```bash
   docker compose ps
   ```

5. **Access the application**:
   | Component | URL | Details |
   |-----------|-----|---------|
   | **Web Application** | [http://localhost](http://localhost) | Main UI (served via port 80) |
   | **Backend API Docs** | [http://localhost:8000/docs](http://localhost:8000/docs) | Interactive Swagger UI |
   | **System Health API** | [http://localhost:8000/health](http://localhost:8000/health) | Status & MongoDB ping check |
   | **MongoDB** | `mongodb://localhost:27017` | Local DB connection |

---

## 🔑 Pre-Seeded Default Accounts

The platform automatically initializes the following credentials upon first startup:

| Role | Email | Password | Access Level |
|------|-------|----------|--------------|
| **Super Admin** | `admin@binjwa.com` | `Admin@123` | Full system control, platform wallets, global telemetry |
| **Client Admin** | `clientadmin@binjwa.com` | `Admin@123` | Organization tokens, team members, budget allocation |
| **Employee** | `employee@binjwa.com` | `Admin@123` | Token usage, AI playgrounds, model testing |

> ⚠️ **Security Tip for Production**: After your initial login, update these default passwords in the database or via the admin UI.

---

## ☁️ Option 2: Cloud Deployment (Render Blueprint)

The repository includes a ready-to-use [`render.yaml`](./render.yaml) blueprint:

1. Push your repository to **GitHub** or **GitLab**.
2. Create a free MongoDB database at [MongoDB Atlas](https://www.mongodb.com/atlas/database) and copy your connection string (e.g. `mongodb+srv://user:pass@cluster.mongodb.net/binjwa_ai_cost`).
3. Log into [Render.com](https://render.com).
4. Go to **Blueprints** -> **New Blueprint Instance**.
5. Connect your repository. Render will automatically detect [`render.yaml`](./render.yaml) and provision:
   - `binjwa-ai-cost-backend` (Docker Web Service)
   - `binjwa-ai-cost-frontend` (Static Site with SPA routing)
6. Under environment variables, supply your `MONGODB_URI` and optional `OPENROUTER_API_KEY`.
7. Click **Apply**. Render will build and deploy both services!

---

## 🌐 Option 3: Decoupled Deployment (Vercel Frontend + Render/Railway Backend)

If you prefer hosting the React frontend on **Vercel** or **Netlify** for global CDN speed:

### 1. Deploy Backend (Render, Railway, or Fly.io)
- Root Directory: `backend`
- Build Command: `pip install -r requirements.txt`
- Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- Set Environment Variables:
  - `MONGODB_URI`: Your MongoDB Atlas URI
  - `DATABASE_NAME`: `binjwa_ai_cost`
  - `JWT_SECRET_KEY`: Long random string (32+ chars)
  - `CORS_ORIGINS`: `https://your-frontend.vercel.app` (or `*`)
  - `OPENROUTER_API_KEY`: Your key

### 2. Deploy Frontend (Vercel)
- Root Directory: `frontend`
- Framework Preset: **Vite**
- Build Command: `npm run build`
- Output Directory: `dist`
- Environment Variables:
  - `VITE_API_BASE_URL`: `https://your-backend.onrender.com` (your backend URL without trailing slash)
- The included [`vercel.json`](./frontend/vercel.json) automatically takes care of SPA routing!

---

## 🖥️ Option 4: Production Linux VPS (Ubuntu / Debian / EC2 / DigitalOcean)

For a self-hosted production server with automatic HTTPS using Let's Encrypt:

### 1. Install Docker & Compose
```bash
sudo apt update && sudo apt upgrade -y
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER
```

### 2. Clone Repository & Setup .env
```bash
git clone <your-repo-url> /opt/binjwa-ai-cost-platform
cd /opt/binjwa-ai-cost-platform
cp .env.example .env
nano .env # Set your domain, secrets, and keys
```

### 3. Run with Docker Compose
```bash
docker compose up -d --build
```

### 4. Enable SSL with Host Nginx & Certbot (Optional)
If running host Nginx with a domain name (e.g., `app.yourcompany.com`):
```bash
sudo apt install nginx certbot python3-certbot-nginx -y
```

Create `/etc/nginx/sites-available/binjwa.conf`:
```nginx
server {
    server_name app.yourcompany.com;

    location / {
        proxy_pass http://127.0.0.1:80; # Points to frontend docker container
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable site and acquire SSL:
```bash
sudo ln -s /etc/nginx/sites-available/binjwa.conf /etc/nginx/sites-enabled/
sudo certbot --nginx -d app.yourcompany.com
sudo systemctl reload nginx
```

---

## ⚙️ Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `MONGODB_URI` | **Yes** | `mongodb://localhost:27017` | MongoDB connection string (local or Atlas) |
| `DATABASE_NAME` | No | `binjwa_ai_cost` | MongoDB database name |
| `JWT_SECRET_KEY` | **Yes** | `binjwa_secret_key` | Secret key for signing JWT tokens |
| `JWT_ALGORITHM` | No | `HS256` | JWT signing algorithm |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | No | `60` | Token expiration time in minutes |
| `OPENROUTER_API_KEY` | Optional | `""` | OpenRouter API Key for live AI completions |
| `CORS_ORIGINS` | No | `*` | Allowed CORS origins (e.g. `https://app.com,https://api.com`) |
| `PORT` | No | `8000` | Port for the FastAPI server |
| `HOST` | No | `0.0.0.0` | Host binding for Uvicorn |
| `VITE_API_BASE_URL` | No | `""` | Base API URL for frontend (empty when proxied by Nginx) |

---

## 🗄️ Database Backup & Restore

### Backup
```bash
docker compose exec mongodb mongodump --db binjwa_ai_cost --out /data/db/backup
```

### Restore
```bash
docker compose exec mongodb mongorestore --db binjwa_ai_cost /data/db/backup/binjwa_ai_cost
```

---

## 🛠️ Health Check & Troubleshooting

1. **Verify Backend Status**:
   ```bash
   curl http://localhost:8000/health
   # Expected response: {"status": "Running Successfully", "database": "healthy"}
   ```

2. **Inspect Container Logs**:
   ```bash
   # All services
   docker compose logs -f

   # Specific service
   docker compose logs -f backend
   docker compose logs -f frontend
   docker compose logs -f mongodb
   ```

3. **Rebuild after updates**:
   ```bash
   docker compose down
   docker compose up -d --build
   ```
