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

---

Built with ❤️ for East Africa's travelers

**Twende!** 🚌
