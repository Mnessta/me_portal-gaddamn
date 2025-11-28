# Student Portal

A full-stack student portal built with Next.js 15 (App Router + Turbopack), Prisma, and a lightweight JWT authentication layer. The app showcases an end-to-end academic experience: users can register/login, browse their dashboard, review courses, assignments, grades, and announcements generated from a seeded SQLite database.

## Feature Highlights

- **Role-aware JWT authentication & cookies** — API routes validate input with Zod, hash passwords with bcrypt, issue JWTs, and store them in an HTTP-only cookie for subsequent requests.

```1:40:app/api/auth/login/route.ts
export async function POST(request: NextRequest) {
  const body = await request.json()
  const validationResult = loginSchema.safeParse(body)
  ...
  const user = await findUserByEmail(email)
  const token = generateToken(userData)
  setAuthCookie(response, token)
  return response
}
```

- **Client-side auth context** — `AuthProvider` performs `/api/auth/me` checks on mount, exposes login/register/logout helpers, and keeps UI state in sync with toast feedback.

```18:75:contexts/auth-context.tsx
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null)
  useEffect(() => {
    checkAuthStatus()
  }, [])
  const login = async (email: string, password: string) => {
    const response = await fetch('/api/auth/login', { ... })
    setUser(data.data.user)
  }
  ...
}
```

- **Personalized dashboard data pipeline** — A protected API aggregates enrollments, assignments, grades, announcements, and GPA calcs in one fetch powering the dashboard UI.

```6:144:app/api/dashboard/overview/route.ts
export async function GET(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value
  const payload = verifyToken(token)
  const enrollments = await db.enrollment.findMany({ include: { course: { ... }}})
  const dashboardData = { courses, upcomingAssignments, recentAnnouncements, ... }
  return NextResponse.json({ success: true, data: dashboardData })
}
```

- **Interactive dashboard surface** — React cards visualize courses, assignments, grades, announcements, quick actions, logout, and refresh controls once the user is authenticated.

```69:265:app/dashboard/page.tsx
export default function DashboardPage() {
  const { user, logout } = useAuth()
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const fetchDashboardData = async () => {
    const response = await fetch('/api/dashboard/overview', { credentials: 'include' })
    setDashboardData(result.data)
  }
  ...
}
```

- **Rich relational data model & seed script** — Prisma models encapsulate users, courses, assignments, submissions, grades, announcements, notifications, etc., with a seed script that produces demo content for a realistic portal.

```34:223:prisma/schema.prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  role      Role     @default(STUDENT)
  enrollments Enrollment[]
  submissions Submission[]
  grades      Grade[]
}

model Course {
  id        String   @id @default(cuid())
  code      String   @unique
  assignments Assignment[]
  announcements Announcement[]
}
```

```6:274:scripts/seed.ts
async function main() {
  const instructor = await prisma.user.upsert({ where: { email: 'instructor@university.edu' }, ... })
  const course1 = await prisma.course.upsert({ where: { code: 'CS101' }, ... })
  await prisma.assignment.create({ data: { title: 'Programming Assignment 1', ... }})
  await prisma.grade.create({ data: { score: 85, ... }})
  await prisma.notification.create({ data: { title: 'New Assignment Posted', ... }})
}
```

## Tech Stack

- Next.js 15 (App Router + Turbopack)
- React 19 with server/client components
- Tailwind CSS v4 and shadcn-inspired UI kit
- Prisma ORM + SQLite (local development)
- JSON Web Tokens via `jsonwebtoken`
- React Hook Form + Zod validation
- Lucide React iconography

## Project Structure

```
student-portal/
├── app/                 # Next.js routes (auth pages, dashboard, courses, API)
├── components/          # UI primitives, form controls, dashboard widgets
├── contexts/            # React context for authentication state
├── lib/                 # Auth helpers, JWT utilities, Prisma client, validations
├── prisma/              # Prisma schema, migrations, SQLite database
├── scripts/             # Seed + smoke-test scripts
├── types/               # Shared TypeScript types
└── public/              # Static assets
```

## Getting Started

### Prerequisites

- Node.js 20+
- npm (ships with Node) or another package manager

### Installation

```bash
git clone https://github.com/<your-org>/student-portal.git
cd student-portal
npm install
```

### Environment Variables

Create `.env` in the project root:

```
DATABASE_URL="file:./prisma/dev.db"
JWT_SECRET="replace-me-with-a-long-random-string"
JWT_EXPIRES_IN="7d"
```

`DATABASE_URL` can point to SQLite during development and any Prisma-supported database in production.

### Database & Seed Data

```bash
npm run db:push      # sync schema to dev.db
npm run db:seed      # populate demo users/courses/assignments
# optional helpers
npm run db:studio    # open Prisma Studio
npm run db:reset     # drop/dev recreate + reseed
```

### Development

```bash
npm run dev          # Next.js + Turbopack at http://localhost:3000
```

### Production Build

```bash
npm run build
npm start            # serves the compiled output
```

## Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start Next.js in development (Turbopack). |
| `npm run build` | Compile the production bundle. |
| `npm start` | Run the production server. |
| `npm run lint` | Check linting with ESLint. |
| `npm run db:*` | Prisma helpers (`generate`, `push`, `studio`, `seed`, `test`, `reset`). |
| `npm run auth:test` | Invoke auth helper smoke tests in `scripts/test-auth-functions.ts`. |
| `npm run ui:test` | Run UI smoke checks from `scripts/test-ui.ts`. |

## API Overview

- `POST /api/auth/register` — create an account, hash password, and auto-login.
- `POST /api/auth/login` — validate credentials, issue JWT cookie, return user profile.
- `POST /api/auth/logout` — clear auth cookie.
- `GET /api/auth/me` — resolve the current user from the cookie.
- `GET /api/dashboard/overview` — gather courses, assignments, grades, announcements, and stats for the UI.
- `POST /api/courses/[id]/enroll` — enroll the authenticated user in a course.

Use the built-in `fetch` helpers (`credentials: 'include'`) or any HTTP client and supply the auth cookie returned by the login route.

## Testing & Quality

- `npm run lint` keeps the TypeScript + React codebase consistent.
- Scripted smoke tests in `scripts/` validate Prisma connectivity, auth helpers, and UI component rendering.
- Plan for automated unit/integration tests, E2E coverage, and accessibility checks is captured in `plan.md`.

## Roadmap

Refer to `plan.md` for the phased roadmap covering messaging, notifications, calendar, file management, and quality/performance initiatives. Contributions are welcome—open an issue or pull request describing the enhancement you’d like to tackle.
