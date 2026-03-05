# WePink Clone

A pixel-faithful clone of the WePink (webwepinkapp.netlify.app) promotional e-commerce page for a Brazilian fragrance/cosmetics brand.

## Stack

- **Frontend:** React + Vite + TypeScript + Tailwind CSS + shadcn/ui
- **Backend:** Express.js (minimal - static serving only for this project)
- **Font:** Montserrat (Google Fonts)
- **Brand color:** #FF0080 (hot pink)

## Architecture

- Single-page app with no database required
- All product data is statically defined in `client/src/pages/home.tsx`
- Product images served directly from the original CDN URLs
- Countdown timer implemented with a React hook using `setInterval`

## Pages

- `/` → `client/src/pages/home.tsx` — Main promotional landing page

## Key Features

- Sticky pink header with hamburger menu and cart icon
- Slide-in mobile drawer sidebar with navigation links and categories
- Hero banner with carnival image and overlaid pink text + bold white tagline
- Live countdown timer (Horas / Minutos / Segundos)
- Product grid sections: Kits, Body Splash, Perfumaria
- Product cards with discount badges (% OFF or EXCLUSIVO), prices, and buy buttons
- Pink footer

## Design Notes

- All colors match original: `#FF0080` primary pink, white text on pink, black text on white
- Typography: Montserrat, font-extrabold for headings
- No dark mode — this is a branded light-only site
- Product cards use subtle hover scale on image
