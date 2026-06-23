# ✈️ SkyForge.Meta
### Teen Metaverse Flight Academy

> *"Where gameplay and career are the same thing."*

![Version](https://img.shields.io/badge/version-3.0-00D4FF?style=flat-square&labelColor=050810)
![Stack](https://img.shields.io/badge/stack-React-00D4FF?style=flat-square&labelColor=050810)
![Deploy](https://img.shields.io/badge/deploy-Vercel-white?style=flat-square&labelColor=050810)
![Status](https://img.shields.io/badge/status-Browser%20MVP%20Live-4ADE80?style=flat-square&labelColor=050810)

---

## What is SkyForge?

SkyForge is a two-mode teen metaverse flight academy. Same world, same aircraft, same accounts — two completely different reasons to fly.

| Mode | Who | What |
|---|---|---|
| 🔴 **Play** | Age 8–14 | Red Arrows formation flying with friends. VR-first, social, haptic. |
| 🎓 **Career** | Age 14–18 | Licensed flight academy. XP earns rank. Rank earns real pathway credentials. |

---

## Two Career Tracks

### ✈️ Commercial Pilot
`PPL → CPL → ATP → Captain`

Instrument approaches, multi-engine ops, CRM, trans-oceanic navigation.

### 🛩️ Fighter Pilot
`Cadet → Advanced Jets → Squadron → Top Gun`

BFM, carrier landings, night ops, EMCON strike packages, Red Arrows formation.

---

## Browser MVP — What's Built

The current build is a full React proof of concept, deployment-ready on Vercel.

### Screens
- Cinematic intro with animated contrail and starfield
- Callsign registration
- Track selection with live hover effects
- Mission brief per track
- Full cockpit + career dashboard

### Cockpit
- Live animated instrument panel — Artificial Horizon, ASI, ALT, VSI, Heading
- Parallax sky/ground viewport with pitch and roll response
- HUD overlay with speed and altitude tapes
- Mission progress overlay

### Dashboard (5 tabs)
- **Missions** — per-track mission board, difficulty tags, XP + SkyBucks rewards, launch system
- **Career** — rank progress, XP bar, roadmap, pilot stats
- **Store** — SkyBucks economy, cosmetics, certified assets, VR assets
- **Squad** — online pilot status, invite system, leaderboard
- **Log** — flight history with grades, XP, and SkyBucks

### Economy
- SkyBucks (⬡) earned on every mission
- Spendable in the SkyForge Store
- Certified asset types count toward real pathway progression

---

## Tech Stack

```
Frontend    React 18 (single file — src/App.js)
Fonts       Orbitron (display) + Inter (body)
Deploy      Vercel (auto-deploy on push)
Repo        github.com/bobbyboy1655/SkyForge.Meta
```

---

## Getting Started

```bash
# Clone
git clone https://github.com/bobbyboy1655/SkyForge.Meta.git
cd SkyForge.Meta

# Install
npm install

# Run locally
npm start

# Build for production
npm run build
```

Vercel deploys automatically on every push to `main`.

---

## Roadmap

### ✅ Phase 1 — Onboarding (Complete)
Cinematic intro, callsign, track selection, mission brief

### ✅ Phase 2 — Cockpit + Career (Complete)
Live instruments, career dashboard, mission system

### ✅ Phase 3a — Economy + Squad (Complete)
SkyBucks, store, squad panel, leaderboard

### 🔲 Phase 3b — Meta Quest VR *(Seeking Unity Developer)*
Full 3D cockpit in Unity, Meta XR SDK, Red Arrows multiplayer formation, same accounts + XP across platforms

### 🔲 Phase 4 — Haptic Layer *(Future)*
bHaptics / Shiftall suit integration. G-force, turbulence, carrier trap, cannon fire.

---

## Seeking: Unity Developer

The browser MVP is the complete design spec for the Quest VR build. Everything a Unity developer needs is defined here:

- All game mechanics and mission structures
- XP and economy values (tuned and tested)
- Full UI/UX design language
- Both career tracks with rank progression
- Economy and social architecture

If you're a Unity developer interested in building Phase 3, read the full spec: [`SKYFORGE_PITCH.md`](./SKYFORGE_PITCH.md)

---

## File Structure

```
SkyForge.Meta/
├── public/
│   └── index.html          # Google Fonts + meta
├── src/
│   ├── index.js            # React entry
│   └── App.js              # Full app — 725 lines
├── SKYFORGE_PITCH.md       # Investor + Unity dev pitch
├── package.json
└── README.md
```

---

## IP & Ownership

All product concepts, career track structures, economy design, and platform architecture originated with and are owned by:

**Robert Stephen Mannix**  
Declared: 23 June 2026  
Repository: `bobbyboy1655/SkyForge.Meta`

---

<div align="center">

**SkyForge.Meta** — Teen Metaverse Flight Academy  
Built with React · Deployed on Vercel · Heading to Quest

</div>
