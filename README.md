<h1 align="center">🩺 ContextCare AI</h1>
<p align="center">
  <img src="https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js 14" />
  <img src="https://img.shields.io/badge/TypeScript-5.6-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Prisma-5.22-2D3748?style=for-the-badge&logo=prisma&logoColor=white" alt="Prisma" />
  <img src="https://img.shields.io/badge/Socket.IO-4.8-010101?style=for-the-badge&logo=socket.io&logoColor=white" alt="Socket.IO" />
  <img src="https://img.shields.io/badge/License-MIT-22C55E?style=for-the-badge" alt="MIT License" />
</p>
<p align="center">
  <strong>Digitize physical lab reports into structured, doctor-ready clinical data — in seconds.</strong>
</p>

<p align="center">
  A full-stack healthcare workflow application that uses OCR to extract diagnostic metrics from photographed lab reports, pairs patients with doctors via QR code, and delivers real-time dashboards with trend analysis, clinical notes, and PDF export.
</p>

<p align="center">
  <a href="https://contextcare.onrender.com"><strong>🚀 Live Demo →</strong></a>
</p>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [How It Works](#-how-it-works)
- [Tech Stack](#%EF%B8%8F-tech-stack)
- [Architecture](#-architecture)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [API Reference](#-api-reference)
- [Database Schema](#-database-schema)
- [Environment Variables](#-environment-variables)
- [Scripts](#-scripts)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🔍 Overview

**ContextCare AI** bridges the gap between physical lab reports and digital clinical workflows. In many healthcare settings — especially in emerging markets — lab results still arrive as printed or handwritten documents. Doctors manually re-enter this data, which is slow, error-prone, and impossible to trend over time.

ContextCare solves this by letting patients photograph their reports on any smartphone. The built-in OCR engine extracts key diagnostic values, which are then surfaced on a real-time doctor dashboard with historical trends, reference ranges, and clinical notes — no manual data entry required.

---

## ✨ Key Features

| Feature | Description |
|:---|:---|
| 📸 **Smart OCR Extraction** | Powered by Tesseract.js with Sharp preprocessing — extracts 6 key diagnostic metrics (FBS, Cholesterol, HDL, LDL, Triglycerides, Hemoglobin) from photographed lab reports |
| 🔗 **QR Code Pairing** | Patients scan a doctor-specific QR code to securely link their reports to the right physician |
| 📊 **Real-time Dashboard** | Doctor dashboard updates instantly via Socket.IO with metric cards, status indicators, and trend charts |
| 📈 **Trend Analysis** | Recharts-powered line charts with reference bands show how patient metrics evolve over multiple scans |
| 📝 **Clinical Notes** | Append-only notes ledger lets doctors record observations directly alongside patient data |
| 📄 **PDF Export** | One-click PDF report generation using `@react-pdf/renderer` for sharing or archival |
| 🔒 **Secure Auth** | PIN-based doctor authentication with encrypted session cookies via `iron-session` |
| ⚡ **Rate Limiting** | Built-in in-memory rate limiter to protect OCR and auth endpoints from abuse |

---

## 🔄 How It Works

```
+-------------+     +--------------+     +------------+     +------------------+
|   Patient   |     |  OCR Engine  |     |  Database  |     | Doctor Dashboard |
|   (Phone)   |---->|  (Extract)   |---->|  (Store)   |---->|   (Real-time)    |
+-------------+     +--------------+     +------------+     +------------------+
       |                   |                   |                     |
  1. Photo           2. Parse           3. Persist            4. Display
  lab report         6 diagnostic       patient data +        metric cards,
                     metrics with       extracted metrics     trends, notes,
                   reference ranges                           PDF export
```

**Step-by-step flow:**

1. **📸 Capture** — Patient photographs their lab report using their phone's camera
2. **🔍 Extract** — Tesseract.js OCR engine with Sharp image preprocessing identifies and parses 6 key diagnostic metrics
3. **✅ Review** — Patient reviews the extracted values for accuracy before submission
4. **🔗 Pair** — Patient scans a doctor-specific QR code to link results to their physician
5. **⚡ Notify** — Socket.IO pushes a real-time event to the doctor's dashboard
6. **📊 Analyze** — Doctor views metric cards with normal/borderline/critical status, trend charts with reference bands, appends clinical notes, and exports PDF reports

---

## 🛠️ Tech Stack

<table>
  <thead>
    <tr>
      <th>Layer</th>
      <th>Technology</th>
      <th>Purpose</th>
    </tr>
  </thead>
  <tbody>
    <tr><td><strong>Framework</strong></td><td>Next.js 14 (App Router)</td><td>Full-stack React framework with server-side rendering</td></tr>
    <tr><td><strong>Language</strong></td><td>TypeScript 5.6</td><td>Type-safe development across the entire codebase</td></tr>
    <tr><td><strong>Styling</strong></td><td>Tailwind CSS 3.4</td><td>Utility-first CSS for rapid, responsive UI development</td></tr>
    <tr><td><strong>Database</strong></td><td>SQLite + Prisma ORM</td><td>Zero-config embedded database with type-safe queries</td></tr>
    <tr><td><strong>Real-time</strong></td><td>Socket.IO 4.8</td><td>Bi-directional WebSocket communication for live updates</td></tr>
    <tr><td><strong>OCR</strong></td><td>Tesseract.js 5 + Sharp</td><td>Client-side OCR with server-side image preprocessing</td></tr>
    <tr><td><strong>PDF</strong></td><td>@react-pdf/renderer</td><td>React-based PDF document generation</td></tr>
    <tr><td><strong>Auth</strong></td><td>iron-session</td><td>Encrypted, stateless session cookies</td></tr>
    <tr><td><strong>Charts</strong></td><td>Recharts</td><td>Composable charting library built on D3</td></tr>
    <tr><td><strong>Icons</strong></td><td>Lucide React</td><td>Beautiful, consistent open-source icon set</td></tr>
    <tr><td><strong>QR</strong></td><td>qrcode + html5-qrcode</td><td>QR code generation and scanning</td></tr>
    <tr><td><strong>Server</strong></td><td>Custom Node.js HTTP server</td><td>Unified HTTP + WebSocket server for Next.js + Socket.IO</td></tr>
  </tbody>
</table>

---

## 🏗 Architecture

```
                         ┌────────────────────────────────────────┐
                         │           Custom HTTP Server           │
                         │           (server.ts)                  │
                         ├────────────────────┬───────────────────┤
                         │   Next.js App      │   Socket.IO       │
                         │   (SSR + API)      │   (WebSocket)     │
                         └────────┬───────────┴────────┬──────────┘
                                  │                    │
              ┌───────────────────┼────────────────────┼──────────────┐
              │                   │                    │              │
     ┌────────▼────────┐ ┌───────▼───────┐  ┌────────▼────────┐       │
     │  Patient Flow   │ │  Doctor Flow  │  │   Real-time     │       │
     │                 │ │               │  │   Events        │       │
     │  • Upload photo │ │  • PIN login  │  │                 │       │
     │  • OCR extract  │ │  • Dashboard  │  │  • scan:created │       │
     │  • Review       │ │  • Notes      │  │  • heartbeat    │       │
     │  • QR pairing   │ │  • PDF export │  │                 │       │
     └────────┬────────┘ └───────┬───────┘  └─────────────────┘       │
              │                  │                                    │
              └──────────┬───────┘                                    │
                         │                                            │
                ┌────────▼─────────┐                                  │
                │   Prisma ORM     │                                  │
                │   + SQLite DB    │                                  │
                └──────────────────┘                                  │
              ┌───────────────────────────────────────────────────────┘
              │
     ┌────────▼────────┐
     │  Tesseract.js   │
     │  + Sharp        │
     │  (OCR Pipeline) │
     └─────────────────┘
```

The application uses a **custom Node.js HTTP server** (`server.ts`) that mounts both the Next.js request handler and a Socket.IO instance on the same port. This enables seamless real-time communication without a separate WebSocket server.

**Key architectural decisions:**
- **Single-process deployment** — Next.js + Socket.IO share the same HTTP server, simplifying deployment and avoiding CORS complexity
- **Offline-capable OCR** — Ships with `eng.traineddata` in `tessdata/`, no external API calls for text extraction
- **Stateless auth** — Encrypted cookies via `iron-session` eliminate the need for a session store
- **Embedded database** — SQLite requires zero setup and is perfect for single-instance deployments

---

## 🚀 Getting Started

### Prerequisites

| Requirement | Version |
|:---|:---|
| **Node.js** | 18+ (LTS recommended) |
| **npm** | 9+ |

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-username/contextcare-ai.git
cd contextcare-ai

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env and set SESSION_SECRET (min 32 characters)
# Generate one: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# 4. Initialize the database and seed demo data
npx prisma migrate deploy
npm run db:seed

# 5. Start the development server
npm run dev
```

The app will be available at **http://localhost:3000** 🎉

### Demo Credentials

Use these pre-seeded doctor accounts to explore the dashboard:

| 👨‍⚕️ Doctor | Specialization | 🔑 PIN |
|:---|:---|:---|
| Dr. Ananya Sharma | General Physician | `1234` |
| Dr. Rohan Mehta | Endocrinologist | `5678` |
| Dr. Priya Nair | Internal Medicine | `9012` |

> **💡 Tip:** Open the patient flow (`/`) on your phone and the doctor dashboard (`/doctor/dashboard`) on your desktop to see the real-time pairing in action.

---

## 📁 Project Structure

```
contextcare-ai/
│
├── 📂 app/                          # Next.js App Router
│   ├── page.tsx                     # Patient upload flow (home page)
│   ├── layout.tsx                   # Root layout with metadata
│   ├── globals.css                  # Global styles
│   ├── icon.svg                     # App favicon
│   │
│   ├── 📂 doctor/
│   │   ├── login/page.tsx           # Doctor PIN-pad login
│   │   └── dashboard/page.tsx       # Real-time doctor dashboard
│   │
│   └── 📂 api/
│       ├── 📂 doctor/
│       │   ├── login/               # POST — Authenticate doctor via PIN
│       │   ├── logout/              # POST — Clear session
│       │   ├── me/                  # GET  — Current session info
│       │   ├── patients/            # GET  — Paginated patient list with metrics
│       │   └── qr/                  # GET  — Generate QR pairing token
│       │
│       └── 📂 scans/
│           ├── extract/             # POST — Upload image → OCR → extract metrics
│           └── pair/                # POST — Link scan to doctor via QR token
│
├── 📂 components/
│   ├── MetricCard.tsx               # Diagnostic metric display with status badge
│   ├── TrendChart.tsx               # Recharts line chart with reference bands
│   ├── NotesLedger.tsx              # Append-only clinical notes component
│   ├── QrPairOverlay.tsx            # Doctor-side QR pairing modal
│   ├── Disclaimer.tsx               # App disclaimer notice
│   └── 📂 PatientUploadFlow/       # Multi-step upload wizard components
│
├── 📂 lib/
│   ├── auth.ts                      # Session-based auth helper
│   ├── db.ts                        # Prisma client singleton
│   ├── metrics.ts                   # Metric definitions, reference ranges & OCR parsing
│   ├── ocr.ts                       # Tesseract.js + Sharp preprocessing pipeline
│   ├── pdf.ts                       # PDF report builder
│   ├── ratelimit.ts                 # In-memory rate limiter
│   ├── session.ts                   # iron-session configuration
│   └── socket.ts                    # Socket.IO helpers & room management
│
├── 📂 prisma/
│   ├── schema.prisma                # Database schema (Doctor, Patient, Scan, Metric, Note)
│   └── seed.ts                      # Demo data seeder
│
├── 📂 scripts/
│   └── render-pdf.mjs               # Standalone PDF renderer script
│
├── 📂 tessdata/
│   └── eng.traineddata              # Offline English OCR language model
│
├── server.ts                        # Custom HTTP + Socket.IO server
├── next.config.js                   # Next.js configuration
├── tailwind.config.ts               # Tailwind CSS configuration
├── tsconfig.json                    # TypeScript configuration
├── postcss.config.js                # PostCSS configuration
├── .env.example                     # Environment variable template
├── .prettierrc                      # Code formatting rules
└── package.json                     # Dependencies & scripts
```

---

## 📡 API Reference

### Doctor Endpoints

| Method | Endpoint | Description | Auth |
|:---|:---|:---|:---|
| `POST` | `/api/doctor/login` | Authenticate via doctor name + PIN | ❌ |
| `POST` | `/api/doctor/logout` | Clear the session cookie | ✅ |
| `GET` | `/api/doctor/me` | Get the current logged-in doctor | ✅ |
| `GET` | `/api/doctor/patients` | List patients with their latest metrics | ✅ |
| `GET` | `/api/doctor/qr` | Generate a QR code token for patient pairing | ✅ |

### Scan Endpoints

| Method | Endpoint | Description | Auth |
|:---|:---|:---|:---|
| `POST` | `/api/scans/extract` | Upload a lab report image → OCR → extract metrics | ❌ |
| `POST` | `/api/scans/pair` | Link an extracted scan to a doctor via QR token | ❌ |

### WebSocket Events

| Event | Direction | Description |
|:---|:---|:---|
| `join` | Client → Server | Doctor dashboard joins a room to receive updates |
| `scan:created` | Server → Client | Pushed when a new scan is paired with a doctor |
| `ping:heartbeat` | Client → Server | Connection health check |
| `pong:heartbeat` | Server → Client | Heartbeat acknowledgment |

---

## 🗄 Database Schema

The application uses **5 Prisma models** with the following relationships:

```
┌──────────┐       ┌──────────┐       ┌──────────┐       ┌──────────┐
│  Doctor  │──1:N──│ Patient  │──1:N──│   Scan   │──1:N──│  Metric  │
└──────────┘       └──────────┘       └──────────┘       └──────────┘
                        │
                        │──1:N──┌──────────┐
                                │   Note   │
                                └──────────┘
```

| Model | Key Fields | Description |
|:---|:---|:---|
| **Doctor** | `name`, `specialization`, `pinHash`, `qrToken` | Physician account with hashed PIN and unique QR token |
| **Patient** | `name`, `phone`, `doctorId` | Patient linked to a doctor (unique per doctor + phone) |
| **Scan** | `rawText`, `patientId` | A single lab report OCR extraction |
| **Metric** | `key`, `value`, `unit`, `refMin`, `refMax`, `status` | Individual diagnostic metric with reference range and status |
| **Note** | `content`, `patientId` | Append-only clinical note on a patient |

---

## 🔐 Environment Variables

| Variable | Required | Default | Description |
|:---|:---|:---|:---|
| `SESSION_SECRET` | Recommended | Built-in fallback | Encryption key for session cookies (min 32 chars). Generate one with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `DATABASE_URL` | No | `file:./dev.db` | SQLite database connection string |
| `PORT` | No | `3000` | Server port |

> **⚠️ Production Note:** Always set a strong `SESSION_SECRET` in production. The built-in fallback is for development convenience only.

---

## 📜 Scripts

| Command | Description |
|:---|:---|
| `npm run dev` | Start the development server with hot reload |
| `npm run build` | Build the Next.js application for production |
| `npm start` | Run database migrations, seed data, and start the production server |
| `npm run db:seed` | Seed the database with demo doctors and sample data |
| `npx prisma studio` | Open the Prisma database browser GUI |
| `npx prisma migrate dev` | Create and apply a new database migration |

---

## 🌐 Deployment

ContextCare AI is designed for easy single-instance deployment. The app runs on a single process with an embedded SQLite database.

### Deploy to Render

1. Create a new **Web Service** on [Render](https://render.com)
2. Connect your GitHub repository
3. Configure the service:
   - **Build Command:** `npm install && npx prisma generate && npm run build`
   - **Start Command:** `npm start`
4. Add environment variables:
   - `SESSION_SECRET` — A random 64-character hex string
   - `DATABASE_URL` — `file:/data/dev.db` (if using a persistent disk)
5. (Optional) Attach a **Persistent Disk** mounted at `/data` for database durability

### Deploy with Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
RUN npx prisma generate && npm run build
ENV NODE_ENV=production
EXPOSE 3000
CMD ["npm", "start"]
```

---

## 🤝 Contributing

Contributions are welcome! Here's how to get started:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines

- Follow the existing code style (Prettier config included)
- Add TypeScript types for all new code
- Test OCR changes with sample lab report images
- Ensure Socket.IO events are documented

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  <strong>Built with ❤️ for better healthcare workflows</strong>
</p>

<p align="center">
  <a href="https://contextcare.onrender.com">Live Demo</a> •
  <a href="#-getting-started">Getting Started</a> •
  <a href="#-api-reference">API Docs</a>
</p>
<!-- Updated to trigger a GitHub contribution on 2026-06-23 -->
