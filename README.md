# 🚌 Twende - AI-Enhanced Travel Booking Platform

**Twende** (Swahili for "Let's Go!") - A modern, full-stack travel booking platform with AI-powered search capabilities, built for the East African market.

## 🎨 Brand Identity

| Element | Value |
|---------|-------|
| **Name** | Twende |
| **Meaning** | "Let's Go!" in Swahili |
| **Primary Color** | Skyblue (#0ea5e9) |
| **Accent Color** | Maroon (#991b1b) |
| **Theme** | Dark with skyblue/maroon accents |

## 🌍 Coverage

| Country | Flag | Major Cities |
|---------|------|--------------|
| Kenya | 🇰🇪 | Nairobi, Mombasa, Kisumu, Nakuru, Eldoret |
| Uganda | 🇺🇬 | Kampala, Jinja, Mbarara, Entebbe |
| Rwanda | 🇷🇼 | Kigali, Butare, Gisenyi |
| Congo (DRC) | 🇨🇩 | Goma, Bukavu, Kinshasa |
| Tanzania | 🇹🇿 | Dar es Salaam, Arusha, Mwanza |

## ✨ Features

### 🤖 AI-Powered Search
- Natural language queries (e.g., "Find me the cheapest bus to Kampala tomorrow")
- Smart parameter extraction from conversational input
- OpenAI GPT integration for query understanding

### 🔍 Travel Search System
- Search buses across East Africa (Safirio API integration)
- Cross-border routes (Kenya-Uganda, Uganda-Rwanda, Rwanda-Congo)
- Advanced filters (date, price range, destination, origin)
- Sort by price, departure time, duration, or rating
- Pagination and loading states

### 📋 Booking Flow
- Step-by-step booking (Select → Review → Confirm)
- Seat selection with availability tracking
- Booking reference generation
- Multi-currency support (KES, UGX, RWF, USD)

### 🔐 Authentication
- JWT-based authentication
- User registration and login
- Profile management

### 💳 Payment System
Secure multi-provider payment integration:

| Provider | Type | Countries | Currency |
|----------|------|-----------|----------|
| **M-Pesa** | Mobile Money | Kenya, Tanzania | KES, TZS |
| **MTN MoMo** | Mobile Money | Uganda, Rwanda | UGX, RWF |
| **Airtel Money** | Mobile Money | Congo, Uganda | CDF, UGX |
| **PayPal** | Digital Wallet | All | USD |
| **Visa** | Card | All | Multi |
| **Mastercard** | Card | All | Multi |

**Features:**
- STK Push for M-Pesa (instant phone prompt)
- Real-time payment status tracking
- Webhook callbacks for all providers
- Secure card tokenization via Stripe
- Automatic currency conversion
- Refund processing

## 🛠️ Tech Stack

### Frontend
- React 18 + TypeScript + Vite
- Tailwind CSS + shadcn/ui
- Framer Motion (animations)
- Zustand (state management)

### Backend
- Node.js + Express + TypeScript
- PostgreSQL
- OpenAI API
- JWT Authentication

## 📁 Project Structure

```
├── frontend/
│   └── src/
│       ├── components/    # UI components
│       ├── pages/         # Page components
│       ├── lib/           # Utils, API client
│       ├── store/         # Zustand stores
│       └── types/         # TypeScript types
│
├── backend/
│   └── src/
│       ├── routes/        # API routes
│       ├── services/      # Business logic
│       ├── middleware/    # Auth, error handling
│       └── db/            # Database setup
│
└── package.json           # Monorepo config
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- OpenAI API key (optional)

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   
   Create `backend/.env`:
   ```env
   PORT=5000
   NODE_ENV=development
   DATABASE_URL=postgresql://postgres:password@localhost:5432/travel_booking
   JWT_SECRET=your-super-secret-key
   JWT_EXPIRES_IN=7d
   OPENAI_API_KEY=your-openai-api-key  # Optional
   FRONTEND_URL=http://localhost:5173

   # M-Pesa (Kenya)
   MPESA_CONSUMER_KEY=your-mpesa-consumer-key
   MPESA_CONSUMER_SECRET=your-mpesa-consumer-secret
   MPESA_PASSKEY=your-mpesa-passkey
   MPESA_SHORTCODE=174379
   MPESA_CALLBACK_URL=https://your-domain.com/api/payments/webhooks/mpesa

   # MTN MoMo (Rwanda/Uganda)
   MTN_API_KEY=your-mtn-api-key
   MTN_USER_ID=your-mtn-user-id
   MTN_ENVIRONMENT=sandbox

   # Airtel Money (Congo)
   AIRTEL_CLIENT_ID=your-airtel-client-id
   AIRTEL_CLIENT_SECRET=your-airtel-client-secret

   # PayPal
   PAYPAL_CLIENT_ID=your-paypal-client-id
   PAYPAL_CLIENT_SECRET=your-paypal-client-secret
   PAYPAL_ENVIRONMENT=sandbox

   # Stripe (Visa/Mastercard)
   STRIPE_SECRET_KEY=your-stripe-secret-key
   ```

3. **Set up PostgreSQL**
   ```bash
   createdb travel_booking
   ```

4. **Start development servers**
   ```bash
   npm run dev
   ```

- Frontend: http://localhost:5173
- Backend: http://localhost:5000

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/me` | Get profile |

### Search & Bookings
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/search` | Search trips |
| GET | `/api/search/destinations` | Get all destinations |
| GET | `/api/search/origins` | Get all origins |
| POST | `/api/ai/recommendations` | AI-powered search |
| POST | `/api/bookings` | Create booking |
| GET | `/api/bookings` | Get bookings |

### Payments
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/payments/methods` | Get payment methods |
| POST | `/api/payments/initiate` | Start payment |
| GET | `/api/payments/:id/verify` | Verify payment |
| GET | `/api/payments/:id` | Get payment details |
| POST | `/api/payments/:id/refund` | Request refund |
| POST | `/api/payments/webhooks/mpesa` | M-Pesa callback |
| POST | `/api/payments/webhooks/stripe` | Stripe webhook |
| POST | `/api/payments/webhooks/mtn` | MTN callback |
| POST | `/api/payments/webhooks/airtel` | Airtel callback |

## 🎯 AI Search Examples

- "Find me the cheapest bus to Kampala"
- "Show VIP buses from Nairobi to Kigali tomorrow"
- "What's the fastest route from Kampala to Goma?"
- "Buses under 5000 KES to Mombasa"
- "Night coaches from Kigali to Kinshasa"

## 🌐 Supported Currencies

| Currency | Code | Countries |
|----------|------|-----------|
| Kenyan Shilling | KES | Kenya |
| Ugandan Shilling | UGX | Uganda |
| Rwandan Franc | RWF | Rwanda |
| US Dollar | USD | DRC, Cross-border |

## 🚌 Popular Routes

### Cross-Border
- Nairobi → Kampala (Kenya → Uganda)
- Nairobi → Kigali (Kenya → Rwanda)
- Kampala → Kigali (Uganda → Rwanda)
- Kigali → Goma (Rwanda → DRC)
- Mombasa → Dar es Salaam (Kenya → Tanzania)

### Domestic
- Nairobi → Mombasa (Kenya)
- Kampala → Jinja (Uganda)
- Kigali → Butare (Rwanda)
- Goma → Bukavu (DRC)

## 🚀 Deployment

### Quick Deploy Guide

| Service | Platform | Recommended |
|---------|----------|-------------|
| Frontend | Vercel | ⭐ Best choice |
| Backend | Render | ⭐ Free tier available |

---

### Step 1: Deploy Backend on Render

1. Go to [render.com](https://render.com) → Sign up with GitHub
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repo
4. Configure:

| Setting | Value |
|---------|-------|
| **Name** | `twende-backend` |
| **Root Directory** | `backend` |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm start` |
| **Instance Type** | `Free` |

5. Add **Environment Variables**:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `JWT_SECRET` | `your-secure-secret-key-at-least-32-characters` |
| `FRONTEND_URL` | `https://your-app.vercel.app` (add after deploying frontend) |
| `OPENAI_API_KEY` | `sk-your-key` (optional, for AI features) |

6. Click **"Create Web Service"**
7. Copy your Render URL (e.g., `https://twende-backend.onrender.com`)

---

### Step 2: Deploy Frontend on Vercel

1. Go to [vercel.com](https://vercel.com) → Sign up with GitHub
2. Click **"Add New Project"**
3. Import your GitHub repo
4. Configure:

| Setting | Value |
|---------|-------|
| **Framework** | Vite |
| **Root Directory** | `frontend` |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |

5. Add **Environment Variable**:

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://your-render-url.onrender.com/api` |

6. Click **"Deploy"**

---

### Step 3: Update Backend CORS

After getting your Vercel URL, go back to Render and update:

| Key | Value |
|-----|-------|
| `FRONTEND_URL` | `https://your-app.vercel.app` |

---

### Environment Variables Reference

#### Frontend (Vercel/Netlify)

```env
# Required - Your deployed backend API URL
VITE_API_URL=https://your-backend.onrender.com/api

# Optional - EmailJS for sending emails
VITE_EMAILJS_SERVICE_ID=service_xxx
VITE_EMAILJS_TEMPLATE_ID=template_xxx
VITE_EMAILJS_PUBLIC_KEY=xxx
```

#### Backend (Render/Railway/Heroku)

```env
# Required
NODE_ENV=production
PORT=5000
JWT_SECRET=your-secure-random-secret-key-min-32-chars
FRONTEND_URL=https://your-frontend-url.vercel.app

# Optional - AI Features (without this, AI uses fallback parsing)
OPENAI_API_KEY=sk-your-openai-api-key

# Optional - Database (uses in-memory if not set)
DATABASE_URL=postgresql://user:password@host:5432/dbname

# Optional - Payment Providers
MPESA_CONSUMER_KEY=xxx
MPESA_CONSUMER_SECRET=xxx
STRIPE_SECRET_KEY=sk_xxx
```

---

### Platform-Specific Instructions

#### Vercel (Frontend)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd frontend
vercel --prod
```

#### Render (Backend)
- Automatic deploys on push to `main`
- Free tier spins down after 15 min of inactivity
- First request after spin-down takes ~30 seconds

#### Railway (Backend Alternative)
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

#### Netlify (Frontend Alternative)
```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
cd frontend
npm run build
netlify deploy --prod --dir=dist
```

---

### Common Deployment Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| **CORS Errors** | `FRONTEND_URL` not set | Set `FRONTEND_URL` on backend to your Vercel URL |
| **401 Unauthorized** | Invalid JWT | Set a strong `JWT_SECRET` (32+ characters) |
| **Network Error** | Wrong API URL | Verify `VITE_API_URL` includes `/api` at the end |
| **AI Not Working** | No OpenAI key | Set `OPENAI_API_KEY` or use fallback parsing |
| **Slow First Load** | Free tier cold start | Wait ~30 seconds for backend to wake up |
| **Build Failed** | Missing dependencies | Check build logs, ensure all packages are in `package.json` |

---

### Testing Your Deployment

1. **Health Check**: Visit `https://your-backend.onrender.com/api/health`
   - Should return: `{"status":"ok","timestamp":"..."}`

2. **Frontend Check**: Visit your Vercel URL
   - Should load the homepage with no console errors

3. **API Connection**: Open browser DevTools → Network tab
   - Login/Register should hit your backend URL
   - No CORS errors in console

---

Built with ❤️ for East Africa's travelers

**Twende!** 🚌
