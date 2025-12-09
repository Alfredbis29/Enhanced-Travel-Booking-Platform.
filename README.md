# 🚌 SafariRides - AI-Enhanced Travel Booking Platform

A modern, full-stack travel booking platform with AI-powered search capabilities, built for the East African market.

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

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/me` | Get profile |
| GET | `/api/search` | Search trips |
| GET | `/api/search/destinations` | Get all destinations |
| GET | `/api/search/origins` | Get all origins |
| POST | `/api/ai/recommendations` | AI-powered search |
| POST | `/api/bookings` | Create booking |
| GET | `/api/bookings` | Get bookings |

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
