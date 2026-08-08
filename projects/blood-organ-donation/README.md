# 🩸 LifeLink — Blood & Organ Donation Network

A community-powered web app that connects voluntary **blood donors**, **organ
pledgers** and people in **urgent need** — built entirely with HTML, CSS and
vanilla JavaScript. No backend, no frameworks, no setup. It opens straight in
the browser and remembers everything locally.

## Features

### 🩸 Donor Registration
- Add yourself as a donor with name, age, blood group, city, phone and last donation date
- Built-in eligibility validation (age 18–65, valid 10-digit phone, duplicate check)

### 🔍 Find Donors
- Filter donors by **blood group** and **city**
- Each card shows initials, blood badge, location, phone and last donation
- "Reachable now" urgency badge for quick helpers

### 🚨 Emergency Requests
- Post an urgent blood request (group, hospital, patient, contact, notes)
- Requests stay live for **48 hours**, then move to a "closed" section with a countdown timer
- One-click "I can help" — matches the nearest donor of that group instantly

### ❤️ Organ Pledge
- Educational section on what can be donated (kidneys, liver, heart, lungs, corneas…)
- Multi-select pledge form with a note about NOTTO and family consent
- Pledge count feeds the live stats

### 📊 Donor Stats
- Live counters: registered donors, active requests, organ pledges, cities covered
- **Blood group distribution** bar chart
- **Top cities** leaderboard
- Handy "who can receive what" blood compatibility table

## Project Structure

```
blood-organ-donation/
├── index.html      # Main app — all sections in one page
├── styles.css      # Warm, hand-crafted styling
├── script.js       # All logic (localStorage persistence)
└── README.md
```

## How to Run

No build step, no server, no dependencies.

```bash
# Option 1 — just open it
open index.html

# Option 2 — tiny local server
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Tech Notes

- **Storage:** `localStorage` under `lifelink_donors`, `lifelink_requests` and
  `lifelink_pledges`. Your registrations persist between visits.
- **Seed data:** a handful of sample donors and requests are loaded on first
  open so the page never looks empty.
- **Privacy:** this is a demo, not a real medical platform. All data stays in
  *your* browser. For real emergencies, always contact local blood banks and
  emergency services.

## Official Resources

- [NOTTO — National Organ & Tissue Transplant Organisation](https://www.notto.gov.in/)
- [eRaktKosh — National Blood Bank Info](https://www.eraktkosh.in/)

---

**Author:** Siddhanth S · Built as part of the personal portfolio

