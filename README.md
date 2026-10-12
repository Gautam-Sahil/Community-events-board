# EventPulse — Community Events Board

A full-stack Community Events Board built with **Next.js 16 (App Router)**, **TypeScript**, **Tailwind CSS**, and **MongoDB (Mongoose)**. Visitors can browse upcoming local events with combined filters, curate a personalized category feed, toggle instant optimistic reminders, and customize an interactive 3D Event Pass Card. Admins can publish events and toggle event visibility (`Active` / `Inactive`) with full server-side route and API protection.

---

## 1. Quick Setup (Run in Under 5 Minutes)

### Prerequisites
- **Node.js** v18.18+ (or v20+)
- **MongoDB** (Local MongoDB on port `27017`, Docker, or a MongoDB Atlas URI)

### Step-by-Step Installation

1. **Clone the repository and install dependencies:**
   ```bash
   git clone https://github.com/Gautam-Sahil/Community-events-board.git
   cd community-events-board
   npm install
   ```

2. **Configure environment variables:**
   Create a `.env.local` file in the project root with the following variables:
   ```env
   MONGODB_URI=mongodb://127.0.0.1:27017/community-events-board
   JWT_SECRET=super_secret_jwt_key_2026_community_board
   ADMIN_EMAIL=sahil@admin.com
   ADMIN_PASSWORD=admin123
   ```

3. **Seed the database with 15 sample events:**
   Seeds 15 events across `Music`, `Workshop`, `Food`, `Sports`, and `Kids` in multiple cities (including active upcoming events, inactive events, and past events, plus the `"Music" + "Coimbatore" + "night"` test cases):
   ```bash
   npm run seed
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 2. Admin & Visitor Credentials

### Admin Portal Login
- **Login URL:** [http://localhost:3000/login?role=admin](http://localhost:3000/login?role=admin) (or click **Admin** in the top navigation bar)
- **Admin Email:** `sahil@admin.com`
- **Admin Password:** `admin123`
- **Quick Fill:** Click the **Auto-Fill Admin** button on the login card to populate credentials in one click.

### Visitor Account
- Register a new visitor account at [http://localhost:3000/login?mode=register](http://localhost:3000/login?mode=register).
- Upon signup/login, the **Favourite Categories** selector opens automatically to configure your **My Feed** page.

---

## 3. JSON API Reference (Web & Mobile Ready)

All web pages communicate exclusively with decoupled JSON API routes. Every protected endpoint accepts **both** `Authorization: Bearer <token>` headers (for mobile apps) and `httpOnly` cookies (for web sessions).

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/admin/login` | Public | Authenticates admin credentials and returns a signed Admin JWT (`role: "admin"`). |
| `GET` | `/api/admin/events` | Admin Only | Returns all events (active, inactive, and past) sorted by date. |
| `POST` | `/api/admin/events` | Admin Only | Creates a new event (`title`, `category`, `city`, `date`, `price`, `description`, `imageUrl`). |
| `PATCH` | `/api/admin/events/[id]` | Admin Only | Toggles an event between `Active` (`isActive: true`) and `Inactive` (`isActive: false`). Never deletes. |
| `POST` | `/api/auth/signup` | Public | Hashes password with `bcryptjs`, creates a visitor account, and returns a signed JWT. |
| `POST` | `/api/auth/login` | Public | Verifies visitor email/password and returns a signed JWT (`role: "user"`). |
| `GET` | `/api/auth/me` | Public/Auth | Returns the active visitor profile (`favouriteCategories`, `reminders`) and admin status. |
| `POST` | `/api/auth/logout` | Public | Clears authentication cookies. |
| `GET` | `/api/events` | Public | Returns only **active, upcoming** events sorted by nearest date first (`?category=&city=&search=&page=&limit=`). |
| `GET` | `/api/events/[id]` | Public/Auth | Returns single event details, the user's saved card design, and reminder status. |
| `PUT` | `/api/events/[id]` | Visitor Auth | Saves the user's custom card design (`theme` + up to 3 `stickers`) for that event. |
| `PUT` | `/api/user/favourites` | Visitor Auth | Saves the logged-in user's favourite categories (`Music`, `Workshop`, `Food`, `Sports`, `Kids`). |
| `POST` | `/api/user/reminders` | Visitor Auth | Toggles an event ID inside the user's saved `reminders` array (powers the Optimistic UI button). |
| `GET` | `/api/feed` | Visitor Auth | Returns upcoming active events matching the user's saved `favouriteCategories`. |

---

## 4. Technical Architecture Answers

### 1. Show your database structure. Why did you design it this way?
- **`Event`:** `{ title, category, city, date, price, description, imageUrl, isActive, timestamps }`
- **`User`:** `{ name, email, passwordHash, favouriteCategories: [String], reminders: [ObjectId], timestamps }`
- **`CardDesign`:** `{ userId: ObjectId, eventId: ObjectId, theme: "sunset" | "ocean" | "midnight", stickers: [String] }` (unique compound key on `userId + eventId`).

Embedding `favouriteCategories` and `reminders` directly inside the `User` document allows `/api/feed` and reminder checks to resolve in a single fast lookup without expensive joins. Separating `CardDesign` into its own collection with a unique `(userId, eventId)` index keeps the core `Event` collection lightweight for public browsing while allowing per-user card persistence.

### 2. How does your filter query work, and what index would you add?
`GET /api/events` builds a single MongoDB filter object starting with `{ isActive: true, date: { \$gte: new Date() } }` so inactive and past events are strictly excluded. If provided, it dynamically attaches `category`, a case-insensitive regex on `city`, and an `\$or` regex matching `search` against `title` or `description`, then executes `.sort({ date: 1 }).skip((page - 1) * limit).limit(limit)`.
To optimize this query at scale, I added the compound index `{ isActive: 1, date: 1, category: 1, city: 1 }` following the ESR (Equality, Sort, Range) rule, alongside a text/search index on `{ title: "text", description: "text" }`.

### 3. How do you store passwords and protect the admin pages and APIs?
Visitor passwords are never stored in plain text; they are salted and hashed using `bcryptjs` (10 salt rounds) before saving `passwordHash` to MongoDB, and verified via `bcrypt.compare()`.
Admin protection is enforced on the server across three layers using `jose` (HS256 JWTs with `role: "admin"`):
1. **Next.js Server Middleware (`src/middleware.ts`):** Intercepts all `/admin/*` and `/api/admin/*` requests on the server, redirecting unauthenticated page requests to `/login?role=admin` and returning `401 Unauthorized` for API calls.
2. **Server Component Guard (`src/app/admin/page.tsx`) & Route Handlers:** Both the `/admin` Server Component and every `/api/admin/events` handler independently verify the admin JWT signature on the server before running any database operation.

---

## 5. Project Status & What Is Left
- **All requirements (Sections A, B, C, and D) are 100% complete.** Nothing is left pending.
- Includes Indian currency formatting (`₹1,50,000`), friendly IST date formatting (`Sat, 18 Oct, 6:30 PM`), optimistic UI rollback on `Remind Me`, persistent 3D Card Designer, and responsive mobile/desktop layouts.

---

## 6. AI Tools Disclosure
AI assistance (ChatGPT / Gemini) was used during development for:
- Structuring the initial Mongoose schema boilerplate and generating realistic descriptions/Unsplash URLs for the 15 seed events in `src/scripts/seed.ts`.
- Refining CSS keyframe animations and 3D perspective tilt math (`rotateX` / `rotateY`) on the Event Pass Card Designer.
All API routes, authentication guards, database queries, and component state logic were reviewed, tested, and verified manually.