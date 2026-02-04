# Deploying Mental Math App to a Real URL

## 1. Reset daily challenge (do this before going live)

To clear all submissions for a day (e.g. today) so you can start fresh:

1. **Set a one-time secret** in `backend/.env`:
   ```env
   RESET_DAILY_SECRET=yourSecretStringHere
   ```

2. **Restart the backend** if it’s running.

3. **Call the reset endpoint** (replace date and secret with your values):
   ```bash
   # Reset today (server’s date)
   curl -X DELETE "http://localhost:5001/api/daily-challenge/reset-day?secret=yourSecretStringHere"

   # Or reset a specific date
   curl -X DELETE "http://localhost:5001/api/daily-challenge/reset-day?date=2025-02-02&secret=yourSecretStringHere"
   ```

4. Optionally remove `RESET_DAILY_SECRET` from `.env` after deploying so the route can’t be used in production (or keep it and never share it).

---

## 2. Overview of what you need live

| Piece        | Where it lives now      | Where to host it        |
|-------------|-------------------------|-------------------------|
| Frontend    | `npm run build` → `dist/` | Vercel, Netlify        |
| Backend API | Node (Express)          | Railway, Render, Fly.io |
| Database    | MongoDB                  | MongoDB Atlas (cloud)   |
| Auth        | Firebase                 | Already hosted by Google |

You need a **public URL for the backend** and a **public URL for the frontend**. The frontend must call the backend URL (set in env).

---

## 3. Database: MongoDB Atlas (if not already)

If you’re using a local MongoDB, switch to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) for production:

1. Create a free cluster.
2. Create a database user (username + password).
3. Network Access: add `0.0.0.0/0` (allow from anywhere) or restrict to your hosting IPs later.
4. Copy the connection string (e.g. `mongodb+srv://user:pass@cluster.mongodb.net/mentalmath?retryWrites=true&w=majority`).

Use this as `MONGODB_URI` in your **backend** env on the host you choose below.

---

## 4. Backend: deploy to Railway or Render

### Option A: Railway

1. Go to [railway.app](https://railway.app), sign in with GitHub.
2. New Project → Deploy from GitHub repo → select your repo.
3. Root directory: set to `backend` (or add a monorepo config so Railway runs from `backend`).
4. Variables: add all from `backend/.env`:
   - `MONGODB_URI`
   - `FIREBASE_PROJECT_ID` (and service account or `FIREBASE_SERVICE_ACCOUNT` if you use JSON)
   - `FRONTEND_URL` = your frontend URL (e.g. `https://your-app.vercel.app`) for CORS
   - Optional: `RESET_DAILY_SECRET` if you want to keep the reset endpoint.
5. Build command: `npm install` (or `npm ci`). Start command: `npm start` (or `node src/server.js` / whatever is in `package.json`).
6. Deploy. Copy the generated URL (e.g. `https://your-backend.up.railway.app`).

### Option B: Render

1. Go to [render.com](https://render.com), connect GitHub.
2. New → Web Service → connect repo.
3. Root: `backend`. Build: `npm install`. Start: `npm start`.
4. Add environment variables (same as above).
5. Deploy and copy the URL (e.g. `https://your-backend.onrender.com`).

Use this URL as your **API URL** in the frontend (e.g. `VITE_API_URL=https://your-backend.up.railway.app/api` — no trailing slash, and note some hosts serve the API at root so it might be `https://.../api`).

---

## 5. Frontend: deploy to Vercel or Netlify

### Option A: Vercel

1. Go to [vercel.com](https://vercel.com), sign in with GitHub.
2. Import your repo. Root Directory: leave as repo root (where `package.json` and `vite.config` are).
3. Build settings: Build Command `npm run build`, Output Directory `dist`.
4. Environment variable:
   - `VITE_API_URL` = your backend URL including `/api` (e.g. `https://your-backend.up.railway.app/api`).
5. Deploy. You’ll get a URL like `https://your-app.vercel.app`.

### Option B: Netlify

1. Go to [netlify.com](https://netlify.com), Add new site → Import from Git.
2. Build command: `npm run build`. Publish directory: `dist`.
3. Environment: `VITE_API_URL` = same as above.
4. Deploy. URL like `https://your-app.netlify.app`.

---

## 6. Firebase: allow your production domain

1. [Firebase Console](https://console.firebase.google.com) → your project.
2. **Authentication** → Settings → **Authorized domains**.
3. Add your frontend URL (e.g. `your-app.vercel.app` or `your-app.netlify.app`).

---

## 7. CORS and env checklist

- **Backend** `FRONTEND_URL`: must match your frontend origin (e.g. `https://your-app.vercel.app`) so CORS allows requests.
- **Frontend** `VITE_API_URL`: must be the backend base URL that serves `/api` (e.g. `https://your-backend.up.railway.app/api`).
- Rebuild and redeploy frontend after changing `VITE_API_URL`.

After this, your site is live at the frontend URL and the app will use the real backend and database.
