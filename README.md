# Origami Island — Luxury Real Estate & Hospitality Platform

Official frontend web application for **Origami Island** (Batumi, Georgia) — a high-end, luxury residential and lifestyle complex developed by **Origami Holding**.

---

## 🚀 Overview

Origami Island is built with **React 18**, **TypeScript**, and **Vite**, featuring a responsive vanilla CSS design system, glassmorphism aesthetics, interactive visual floor/unit explorers, and full dynamic CMS API integration.

### ✨ Key Features

- **Interactive Building Visualizer & Floor Plans**:
  - Interactive SVG polygon hotspot selection for floors and apartments.
  - Interactive floor plans with dynamic unit status (available, reserved, sold).
- **Comprehensive Unit Catalog & Filtering**:
  - Filter by room types, bedrooms, bathrooms, condition (white frame, turnkey, full), and floor.
  - Multi-currency price switcher (USD, GEL, EUR, etc.) with real-time conversion rates.
- **Multilingual Support (i18n)**:
  - 9 supported languages: Georgian (`ka`), English (`en`), Russian (`ru`), German (`de`), Italian (`it`), Polish (`pl`), Chinese (`zh`), Hebrew (`he`), Arabic (`ar`).
- **Dynamic CMS Content Integration**:
  - Fully synced with backend API for branding, menus, about details, infrastructure, biohacking pillars, financial/investment plans, news, and holding projects.
- **Lead Generation & Contact Systems**:
  - Dynamic "Request a Call" (ზარის მოთხოვნა) and "Consultation" modal forms with international country code selectors.
  - Animated floating call widget with responsive mobile drawer controls.
- **Luxury Scroll Reveal Animations**:
  - Smooth, progressive scroll transitions and staggered entry effects powered by `IntersectionObserver` & `MutationObserver`.
- **Dark & Light Mode**:
  - Fluid theme toggle with theme-aware logos and adaptive contrast tokens.
- **SEO & Analytics**:
  - Integrated with **Google Analytics 4 (GA4)** and **@vercel/analytics**.

---

## 🛠️ Tech Stack

- **Framework**: [React 18](https://react.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: Vanilla CSS (Custom Design System with Variables, Glassmorphism, and Animations)
- **Typography**: [FiraGO](https://fonts.google.com/) (`@fontsource/firago`)
- **Analytics**: `react-ga4`, `@vercel/analytics`
- **Utilities**: `react-medium-image-zoom`

---

## 📂 Project Structure

```text
origamisland/
├── public/                     # Static assets and media
├── src/
│   ├── api/                    # API client layer (siteChrome, siteContent, news, etc.)
│   ├── components/
│   │   ├── sections/           # Landing sections (Header, Hero, About, Choose, Biohacking,
│   │   │                       # Infrastructure, Finance, Holding, News, Footer, Modals)
│   │   └── Icons.tsx           # SVG icon collection
│   ├── hooks/                  # Custom React hooks (useSiteChrome, useHomepageContent,
│   │                           # useScrollReveal, useAppRoute, usePreferences, etc.)
│   ├── i18n/                   # Translation dictionaries and language config
│   │   └── locales/            # Language translation files (ka, en, ru, de, it, pl, zh, he, ar)
│   ├── utils/                  # Media normalization and image optimization helpers
│   ├── App.tsx                 # Root application component & routing
│   ├── main.tsx                # Application entry point
│   ├── types.ts                # Global TypeScript definitions
│   └── unitCatalog.ts          # Property/Unit catalog logic and helpers
├── style.css                   # Main application design system & stylesheets
├── index.html                  # HTML template
├── package.json                # Project dependencies and scripts
└── vite.config.ts              # Vite configuration
```

---

## ⚡ Getting Started

### Prerequisites

- **Node.js**: v18.0.0 or higher
- **npm** or **yarn** / **pnpm**

### Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd origamisland
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the root directory:
   ```bash
   cp .env.example .env
   ```
   Ensure `VITE_API_BASE_URL` points to the active backend API endpoint:
   ```env
   VITE_API_BASE_URL=https://api.origamiholding.com/api
   ```

4. **Start the Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📦 Build & Deployment

- **Typecheck & Production Build**:
  ```bash
  npm run build
  ```
  The production-ready bundle will be generated in the `dist/` directory.

- **Preview Production Build Locally**:
  ```bash
  npm run preview
  ```

---

## 📄 License

Private repository. All rights reserved by **Origami Holding**.

---

## 👤 Author 

**Davit Gakhokia **

