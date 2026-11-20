# ☕ Toronto Cafes Near Me

A Next.js cafe finder for discovering cute and cool independent cafes around Toronto.

[![Live Demo](https://img.shields.io/badge/demo-live-bf5a6a?style=flat-square)](https://toronto-cafes-near-me.vercel.app/)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38bdf8?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

**🌐 Live website:** https://toronto-cafes-near-me.vercel.app/

---

## Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [How It Works](#-how-it-works)
- [API](#-api)
- [Privacy](#-privacy)
- [Future Roadmap](#-future-roadmap)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

- 📍 **Nearby discovery** – find cafes around you using your browser's location
- 🗺️ **Area presets** – jump straight to Downtown, West End, East End, or Midtown
- 🔎 **Search** – filter by cafe name, street, or tag
- 🎚️ **Radius controls** – search within 1.5 km, 3 km, 5 km, or 8 km
- 🏷️ **Quick filters** – Best, Work, Patio, Specialty, and Closest
- 🏆 **Ranked cafe cards** – sorted by a score built from distance, tags, and map data
- 🧭 **Directions** – one-click Google Maps links for every cafe
- 🚫 **No big chains** – Starbucks, Tim Hortons, Second Cup and similar are filtered out
- 💾 **Reliable fallback** – a hand-picked list of Toronto favourites shows when live data is unavailable

---

## 🛠 Tech Stack

| Layer      | Technology                                                        |
| ---------- | ----------------------------------------------------------------- |
| Framework  | [Next.js 15](https://nextjs.org/) (App Router)                    |
| Language   | TypeScript                                                        |
| UI         | React 19, [Tailwind CSS 4](https://tailwindcss.com/)              |
| Icons      | [lucide-react](https://lucide.dev/)                               |
| Map data   | [OpenStreetMap](https://www.openstreetmap.org/) via Overpass API  |
| Hosting    | [Vercel](https://vercel.com/)                                     |

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18.18 or newer
- npm

### Installation

```bash
# Clone the repository
git clone https://github.com/kiranmor/toronto_cafes_near_me.git
cd toronto_cafes_near_me

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Available Scripts

| Command         | Description                          |
| --------------- | ------------------------------------ |
| `npm run dev`   | Start the local development server   |
| `npm run build` | Create a production build            |
| `npm run start` | Run the production build             |
| `npm run lint`  | Lint the project with ESLint         |

---

## 📁 Project Structure

```text
toronto_cafes_near_me/
├── app/
│   ├── api/cafes/route.ts   # API route – fetches & ranks cafes from OpenStreetMap
│   ├── globals.css          # Global styles (Tailwind)
│   ├── layout.tsx           # Root layout and metadata
│   └── page.tsx             # Main cafe finder UI
├── components/ui/           # Reusable UI components
├── lib/
│   ├── cafes.ts             # Cafe types, fallback list, distance & scoring helpers
│   └── utils.ts             # Shared utilities
├── public/                  # Static assets
├── LICENSE
└── README.md
```

---

## ⚙️ How It Works

1. **Pick a location** – the app starts at downtown Toronto. You can use **Near me** (browser geolocation) or choose an area preset.
2. **Fetch cafes** – the frontend calls `/api/cafes`, which queries the OpenStreetMap Overpass API for `amenity=cafe` and `shop=coffee` places within the selected radius.
3. **Clean the results** – places without a name or location, big chains, and duplicates are removed.
4. **Score and rank** – each cafe gets a score based on:
   - how close it is
   - available data (website, opening hours)
   - useful tags like patio, Wi-Fi, roaster, or specialty
5. **Fallback** – if the live lookup fails or returns nothing, a curated list of Toronto cafes is shown instead.

Results are cached for 15 minutes to keep things fast and to be kind to the public Overpass API.

---

## 🔌 API

### `GET /api/cafes`

| Query param | Type   | Default   | Description                                 |
| ----------- | ------ | --------- | ------------------------------------------- |
| `lat`       | number | `43.6532` | Latitude of the search point                |
| `lng`       | number | `-79.3832`| Longitude of the search point               |
| `radius`    | number | `3000`    | Search radius in metres (clamped 800–8000)  |

**Example response**

```json
{
  "cafes": [
    {
      "id": "node-123456",
      "name": "Example Coffee",
      "address": "123 Queen Street West",
      "lat": 43.6486,
      "lng": -79.3971,
      "distanceMeters": 640,
      "score": 84,
      "tags": ["patio", "wifi"],
      "source": "osm"
    }
  ],
  "source": "osm",
  "radiusMeters": 3000,
  "origin": { "lat": 43.6532, "lng": -79.3832 }
}
```

`source` is `"osm"` for live OpenStreetMap results or `"fallback"` for the saved list.

---

## 🔒 Privacy

- No private API keys are required.
- Your location is requested **only** in the browser, and **only** when you click **Near me**.
- Coordinates are used solely to fetch nearby cafe results and are never stored.

---

## 🗺 Future Roadmap

Ideas for making the site more useful, more personal, and more fun. Contributions toward any of these are welcome!

### 🧭 Discovery & Search

- [ ] **Interactive map view** – show cafes as pins on a real map (Leaflet / MapLibre) instead of only a list
- [ ] **"Open now" filter** – parse OpenStreetMap `opening_hours` and show live open / closed status
- [ ] **More neighbourhood presets** – Kensington, Leslieville, The Annex, Junction, Liberty Village, Scarborough, North York, and more
- [ ] **Search by address** – type any address or postal code instead of using geolocation
- [ ] **More filters** – vegan options, wheelchair accessible, outlets for laptops, quiet for studying, pet friendly
- [ ] **Sort options** – sort by score, distance, or name

### ⭐ Richer Cafe Info

- [ ] **Cafe detail page** – a dedicated page per cafe with hours, website, menu links, and photos
- [ ] **Real cafe photos** – replace the stock images with real photos of each place
- [ ] **Ratings & reviews** – optionally pull ratings from a places API, or let users leave their own
- [ ] **Price level & menu highlights** – signature drinks, matcha, pastries, etc.

### 👤 Personalisation

- [ ] **Favourites** – save cafes to a personal list (local storage first, accounts later)
- [ ] **Visited tracker** – check off cafes you've been to and build a "cafe passport"
- [ ] **Share a cafe** – shareable links and social preview cards
- [ ] **Curated lists** – "Best for studying", "Best patios", "Date spots", "Hidden gems"

### 🤝 Community

- [ ] **Suggest a cafe** – let users submit missing cafes or fix incorrect info
- [ ] **Community tags & votes** – crowd-sourced vibes like "cozy", "aesthetic", "good Wi-Fi"
- [ ] **Newsletter** – weekly new-cafe picks (a newsletter component already exists in `components/ui/`)

### ⚡ Performance & Quality

- [ ] **Dark mode**
- [ ] **PWA support** – install the site on your phone and use it offline with cached results
- [ ] **Accessibility audit** – keyboard navigation, screen-reader labels, and colour contrast checks
- [ ] **Smarter caching** – reduce Overpass API calls and add a backup data source
- [ ] **Tests** – unit tests for scoring and distance helpers, plus end-to-end tests for the main flow
- [ ] **CI pipeline** – automatic lint, type-check, and build on every pull request
- [ ] **SEO** – per-neighbourhood landing pages, sitemap, and Open Graph images

### 🌍 Beyond Toronto

- [ ] **Multi-city support** – extend to Montreal, Vancouver, and other cities
- [ ] **Internationalisation** – French language support for Canadian users

---

## 🤝 Contributing

Contributions, ideas, and bug reports are welcome!

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m "Add my feature"`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a Pull Request

Please run `npm run lint` before submitting.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

Cafe data © [OpenStreetMap contributors](https://www.openstreetmap.org/copyright), available under the Open Database License (ODbL).

---

<p align="center">Made with ☕ in Toronto</p>
