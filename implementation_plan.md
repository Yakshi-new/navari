# Deploy: Render (API) + Vercel (Client + Admin)

## Overview

This plan sets up the Vastra e-commerce project for production deployment:
- **Render** → `server/` (Express API + MongoDB via Atlas)
- **Vercel** → `client/` (storefront, React/Vite)
- **Vercel** → `admin/` (CRM panel, React/Vite)

Both frontend apps will auto-connect to the Render API URL via environment variables at build time.

---

## User Review Required

> [!IMPORTANT]
> **File Uploads / Images**: The server currently stores uploaded images in `server/uploads/` (local disk). This **won't persist on Render's free tier** because the filesystem is ephemeral. You have two options:
> - **(Recommended)** Migrate image uploads to **Cloudinary** (free tier, no code changes needed beyond config).
> - Keep local storage — images are lost on every deploy/restart.
> 
> **This plan includes Cloudinary integration.** Let me know if you want to skip it.

> [!IMPORTANT]
> **MongoDB**: You need a **MongoDB Atlas** connection string (free M0 tier works). If you already have one, just paste it into Render's environment variables. If not, create one at https://cloud.mongodb.com.

> [!WARNING]
> **Admin panel security**: The admin panel will be publicly reachable on Vercel. Make sure your JWT secret is strong and the admin account uses a secure password.

---

## Open Questions

> [!NOTE]
> Do you already have a **GitHub repo** set up for this project? Render and Vercel both deploy directly from GitHub. If not, we'll need to push this project to GitHub first (or we can use Render's manual deploy).

---

## Proposed Changes

### 1. Server — Render Deployment Config

#### [NEW] [render.yaml](file:///c:/Harsdiya/web/blackbox-test/Handloom/vastra-ecommerce/render.yaml)
Render's infrastructure-as-code file. Defines the web service, environment, and build/start commands. This lives in the repo root.

#### [MODIFY] [server.js](file:///c:/Harsdiya/web/blackbox-test/Handloom/vastra-ecommerce/server/server.js)
- Add `PORT` from `process.env` (already done ✅)
- Update CORS to read `CLIENT_URL` as comma-separated list (already done ✅)
- **No changes needed** — server is already Render-ready

#### [NEW] [server/.env.production.example](file:///c:/Harsdiya/web/blackbox-test/Handloom/vastra-ecommerce/server/.env.production.example)
Documents all production env vars to set on Render's dashboard:
```
PORT=5000 (Render auto-sets this)
NODE_ENV=production
MONGODB_URI=mongodb+srv://...
JWT_SECRET=<strong-random>
JWT_EXPIRE=7d
CLIENT_URL=https://vastra.vercel.app,https://vastra-admin.vercel.app
RAZORPAY_KEY_ID=rzp_live_...
RAZORPAY_SECRET=...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

---

### 2. Server — Cloudinary Upload Migration (optional but recommended)

#### [MODIFY] [server/package.json](file:///c:/Harsdiya/web/blackbox-test/Handloom/vastra-ecommerce/server/package.json)
Add `cloudinary` and `multer-storage-cloudinary` as dependencies.

#### [MODIFY] [server/routes/uploadRoutes.js](file:///c:/Harsdiya/web/blackbox-test/Handloom/vastra-ecommerce/server/routes/uploadRoutes.js)
Switch multer storage from disk to Cloudinary storage. Return Cloudinary URL instead of local path.

---

### 3. Client — Vercel Config + Env

#### [NEW] [client/vercel.json](file:///c:/Harsdiya/web/blackbox-test/Handloom/vastra-ecommerce/client/vercel.json)
Configures Vercel build settings and SPA routing (all paths → `index.html`).

#### [MODIFY] [client/src/services/api.js](file:///c:/Harsdiya/web/blackbox-test/Handloom/vastra-ecommerce/client/src/services/api.js)
Already uses `VITE_API_URL` env var ✅ — no change needed. Just need to set this in Vercel's dashboard.

#### [NEW] [client/.env.production.example](file:///c:/Harsdiya/web/blackbox-test/Handloom/vastra-ecommerce/client/.env.production.example)
Documents env vars to set in Vercel's dashboard:
```
VITE_API_URL=https://vastra-api.onrender.com/api
```

---

### 4. Admin — Vercel Config + Env

#### [NEW] [admin/vercel.json](file:///c:/Harsdiya/web/blackbox-test/Handloom/vastra-ecommerce/admin/vercel.json)
Same SPA routing config for the admin panel.

#### [MODIFY] [admin/src/services/api.js](file:///c:/Harsdiya/web/blackbox-test/Handloom/vastra-ecommerce/admin/src/services/api.js)
Currently hardcoded to `baseURL: '/api'`. **Must be updated** to use `VITE_API_URL` env var, same as the client, so it points to the Render backend in production.

#### [NEW] [admin/.env.production.example](file:///c:/Harsdiya/web/blackbox-test/Handloom/vastra-ecommerce/admin/.env.production.example)
Documents env vars to set in Vercel's dashboard:
```
VITE_API_URL=https://vastra-api.onrender.com/api
```

---

### 5. Root — GitHub / Monorepo Config

#### [MODIFY] [.gitignore](file:///c:/Harsdiya/web/blackbox-test/Handloom/vastra-ecommerce/.gitignore)
Already ignores `.env`, `node_modules`, `dist/` ✅

---

## Verification Plan

### Automated Tests
- Run `npm run build` inside `client/` and `admin/` to confirm Vite builds succeed before deployment.

### Manual Verification
1. Push code to GitHub
2. Connect Render to `server/` subfolder → check `/api/health` returns `{ status: "ok" }`
3. Connect Vercel to `client/` subfolder → verify storefront loads and API calls succeed
4. Connect Vercel to `admin/` subfolder (separate Vercel project) → verify admin login works
5. Test image upload (if Cloudinary) by uploading a product image

---

## Architecture Diagram

```
┌──────────────────────────────────────────────┐
│                  GitHub Repo                 │
│  /server   /client   /admin                  │
└──────┬─────────┬──────────────┬──────────────┘
       │         │              │
       ▼         ▼              ▼
  ┌─────────┐  ┌─────────┐  ┌────────────┐
  │  Render │  │ Vercel  │  │  Vercel    │
  │  (API)  │  │(Client) │  │  (Admin)   │
  │:5000    │  │ :443    │  │   :443     │
  └────┬────┘  └────┬────┘  └─────┬──────┘
       │             │             │
       │◄────────────┴─────────────┘
       │        VITE_API_URL
       │
  ┌────▼────┐
  │ MongoDB │
  │  Atlas  │
  └─────────┘
```
