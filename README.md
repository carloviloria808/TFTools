# TFTools

A full-stack companion site for **Teamfight Tactics — Set 17: Space Gods**. Browse the comp tier list, dig into champion/trait/item/augment data, theory-craft in a drag-and-drop team builder, and export your board straight into the in-game Team Planner.

> Not affiliated with or endorsed by Riot Games. All game assets and trademarks are the property of Riot Games, Inc.

---

## ✨ Features

**Comps & meta**
- **Comp Tier List** — S→X ranked compositions with win/top-4/play rates, playstyle & difficulty filters, search, and per-patch trend badges (▲ buffed / ▼ nerfed / ✦ new)
- **Comp detail view** — full hex board with star levels & items, traits (emblems counted), stage guide, recommended augments/items/gods, and an in-game **Team Code** export
- **Favorites** & **Recently Viewed** — saved locally, no account needed
- **Patch History** — auto-logged change feed plus an auto-archived snapshot of each past patch's tier list

**Databases**
- Champions (stats, ability, traits, recommended items, "comps using this unit")
- Traits with colored breakpoint tracks
- Items + a hover-driven **recipe cheat sheet** grid
- Augments tier list (Silver / Gold / Prismatic)
- Space Gods and their per-stage offerings

**Tools & learning**
- **Team Builder** — drag-and-drop board, trait tracker, gold/component calculators, undo/redo, shareable URLs, PNG export, and Team Code **import/export**
- **Shop Odds**, **Beginner Guide**, and a **Glossary**
- Global search across everything, plus an admin panel for editing comps and stats

---

## 🛠️ Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React, Vite, React Router, Axios, lucide-react / react-icons |
| Backend | ASP.NET Core Web API (C#), Entity Framework Core |
| Database | SQL Server |
| Assets | CommunityDragon (champion/trait/item images, team-planner codes) |

---

## 🚀 Local Setup

### Prerequisites
- [.NET SDK](https://dotnet.microsoft.com/download) (10.0)
- [Node.js](https://nodejs.org/) (18+)
- SQL Server (LocalDB or full) + the `TFToolsDB` database

### Backend
```bash
cd backend
dotnet restore
dotnet run --project TFTools.API.csproj
```
Runs on `http://localhost:5232`. Update the connection string in `backend/appsettings.json` if your SQL Server instance differs.

### Frontend
```bash
cd frontend
npm install
cp .env.example .env   # then set VITE_ADMIN_PASSWORD
npm run dev
```
Runs on `http://localhost:5173` (and prints a `Network:` URL for testing on a phone via `--host`).

### Environment
`frontend/.env` (gitignored — see `.env.example`):
```
VITE_ADMIN_PASSWORD=your-password-here
```
Gates the frontend admin pages (`/admin/*`). The site reads game data from the backend API.

---

## 📁 Project Structure

```
TFTools/
├── backend/                 # ASP.NET Core Web API
│   ├── Controllers/         # Champions, Traits, Items, Augments, Compositions, Gods
│   ├── Models/              # EF Core entities
│   └── Data/                # DbContext + seed data
├── frontend/                # React + Vite
│   └── src/
│       ├── pages/           # route pages
│       ├── components/      # shared UI (Navbar, BoardEditor, GlobalSearch, …)
│       ├── hooks/           # useFavorites, useRecentlyViewed, usePageTitle
│       ├── utils/           # teamCode encode/decode, helpers
│       └── data/            # generated team-planner codes
└── scripts/                 # team-code generator + tests
```

---

## 🔄 Updating for a New Patch

1. Regenerate team-planner codes if the roster changed:
   ```bash
   node scripts/generate-team-codes.js
   ```
2. Update comp tiers/stats via the in-app admin panel (`/admin`) — moving comps to the new patch version auto-archives the previous tier list.
3. Bump the patch references in the navbar/banner/page subtitles.

---

Built by [Carlo (Xyloh)](https://github.com/carloviloria808) · Masters TFT player & CS grad.
