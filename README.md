# ContextCare AI

A healthcare workflow application that digitizes physical lab reports into structured, doctor-ready clinical data using OCR technology with real-time doctor dashboards.

**🚀 Live Demo:** [https://contextcare.onrender.com](https://contextcare.onrender.com)
## What It Does

1. **Patient** photographs their lab report on their phone
2. **OCR engine** extracts 6 key diagnostic metrics (FBS, Cholesterol, HDL, LDL, Triglycerides, Hemoglobin)
3. **Patient reviews** the extracted values and pairs with their doctor via QR code
4. **Doctor's dashboard** updates in real-time with metric cards, trend charts, clinical notes, and PDF export

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS 3 |
| Database | SQLite + Prisma ORM |
| Real-time | Socket.IO |
| OCR | Tesseract.js + Sharp |
| PDF | @react-pdf/renderer |
| Auth | iron-session (encrypted cookies) |
| Charts | Recharts |

## Getting Started

### Prerequisites

- Node.js 18+ (LTS recommended)
- npm 9+

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables (optional for demo)
cp .env.example .env

# Initialize the database with seed data
npx prisma migrate deploy
npm run db:seed

# Start the dev server
npm run dev
```

The app will be available at **http://localhost:3000**

### Demo Credentials

| Doctor | PIN |
|---|---|
| Dr. Ananya Sharma (General Physician) | `1234` |
| Dr. Rohan Mehta (Endocrinologist) | `5678` |
| Dr. Priya Nair (Internal Medicine) | `9012` |

## Project Structure

```
├── app/
│   ├── page.tsx                    # Patient upload flow (home page)
│   ├── doctor/
│   │   ├── login/page.tsx          # Doctor PIN-pad login
│   │   └── dashboard/page.tsx      # Real-time doctor dashboard
│   └── api/
│       ├── doctor/                 # Auth, patients, notes, QR, PDF APIs
│       └── scans/                  # OCR extract + doctor pairing APIs
├── components/
│   ├── MetricCard.tsx              # Diagnostic metric display card
│   ├── TrendChart.tsx              # Recharts line chart with reference bands
│   ├── NotesLedger.tsx             # Append-only clinical notes
│   ├── QrPairOverlay.tsx           # Doctor-side QR pairing modal
│   └── PatientUploadFlow/          # Multi-step upload wizard
├── lib/
│   ├── auth.ts                     # Session-based auth helper
│   ├── db.ts                       # Prisma client singleton
│   ├── metrics.ts                  # Metric reference table + OCR parsing
│   ├── ocr.ts                      # Tesseract.js + Sharp preprocessing
│   ├── pdf.ts                      # PDF report builder
│   ├── ratelimit.ts                # In-memory rate limiter
│   ├── session.ts                  # iron-session config
│   └── socket.ts                   # Socket.IO helpers
├── prisma/
│   ├── schema.prisma               # Database schema
│   └── seed.ts                     # Demo data seeder
├── scripts/
│   └── render-pdf.mjs              # Standalone PDF renderer
└── tessdata/
    └── eng.traineddata             # Offline OCR language model
```

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run db:seed` | Seed demo data |

## Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `SESSION_SECRET` | No | Built-in fallback | Encryption key for session cookies (min 32 chars) |
| `PORT` | No | `3000` | Server port |

## License

MIT
