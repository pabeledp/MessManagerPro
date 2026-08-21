# MessManager PRO

> A modern, card-based bachelor mess & shared living expense tracker designed for mobile with offline-first persistence and Google Drive cloud sync.

[![Android APK](https://img.shields.io/badge/Android%20APK-Download%20v1.0-0F172A?style=flat&logo=android&logoColor=10B981)](https://github.com/pabeledp/MessManagerPro/raw/main/build_output/MessManager-PRO.apk)
[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=flat&logo=next.js)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-slate?style=flat)](LICENSE)

---

## 📱 Download & Test the Android App

You can directly download the Android application (.apk) to test on your phone:

* **[Download MessManager-PRO.apk (Direct Link)](https://github.com/pabeledp/MessManagerPro/raw/main/build_output/MessManager-PRO.apk)**

### Installation Steps:
1. Download the `.apk` file above on your Android phone.
2. Tap the file to install (Enable *"Install unknown apps"* if prompted).
3. Open **MessManager PRO** and start managing your mess expenses!

---

## ✨ Key Features

### 1. Multi-Mess Management & Strict Isolation
* Create and manage multiple messes (e.g., *Dhanmondi Flat*, *Mirpur Bachelor Mess*).
* Instant mess switching directly from the main dashboard.
* Data isolation: Members, meals, bazars, deposits, and rent records are strictly isolated per mess.

### 2. Dual Accurate Calculation Engine
* **Equal Share Mode (মাথাপিছু সমান ভাগ)**:
  $$\text{Per-Head Cost} = \frac{\text{Total Mess Expense}}{\text{Total Roommates}}$$
  $$\text{Balance} = \text{Deposit} - \text{Per-Head Cost}$$
* **Meal Rate Mode (মিল ভিত্তিক হিসাব)**:
  $$\text{Meal Rate} = \frac{\text{Total Bazar Expense}}{\text{Total Meals Eaten}}$$
  $$\text{Individual Cost} = \text{Meals Eaten} \times \text{Meal Rate}$$
* **Fair Share Tracker**: Real-time breakdown of who paid extra (refund receivable) and who owes dues.

### 3. House & Room Rent Tracker (বাড়ি ভাড়ার হিসাব)
* Dedicated monthly rent tracker with month-by-month history (running month & previous months archive).
* **1-Tap Quick Pay**: Mark rent as paid or due directly from the dashboard.
* Detailed rent payment modal with custom amounts, payment methods (*bKash*, *Nagad*, *Cash*, *Bank Transfer*), and payment notes.
* Real-time metrics: Total House Rent, Total Collected, and Pending Dues.

### 4. Native Mobile Card-Based Architecture
* Modular, tactile card layout tailored for Android devices.
* Soft Neu-Glass design with subtle elevation and non-intrusive micro-interactions.
* 4-Tile Quick Action Grid: *Add Bazar*, *Update Deposit*, *Meal Sheet*, and *House Rent*.
* 1-Tap Daily Meal Counter Sheet (+ / - Breakfast, Lunch, Dinner).
* Bottom Navigation Bar for effortless single-handed mobile navigation.

### 5. Bilingual Support (বাংলা ও English)
* Seamless language switching between **বাংলা (Bengali)** and **English** inside the Settings modal.
* Persistent language preference saved to local storage and cloud sync.

### 6. Offline-First & Google Drive Cloud Backup
* Operates 100% offline using client-side storage.
* Automated background sync to the user's private Google Drive AppData folder (`appDataFolder`) using NextAuth.js and Google Drive API v3.

---

## 🛠️ Tech Stack

* **Framework**: [Next.js 14](https://nextjs.org/) (App Router, React 18, TypeScript)
* **Mobile Runtime**: [Capacitor 8](https://capacitorjs.com/) (Android native wrapper)
* **Styling**: [Tailwind CSS](https://tailwindcss.com/)
* **Animations**: [Framer Motion](https://www.framer.com/motion/)
* **State Management**: [Zustand](https://github.com/pmndrs/zustand) with LocalStorage persistence
* **Icons**: [Lucide React](https://lucide.dev/)
* **Typography**: *Hind Siliguri* (Bengali) & *Creato Display* (English & numbers)
* **Authentication & Sync**: [NextAuth.js](https://next-auth.js.org/) with Google Drive API v3

---

## 🚀 Getting Started (Local Development)

### 1. Clone the Repository
```bash
git clone https://github.com/pabeledp/MessManagerPro.git
cd MessManagerPro
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env.local` and add your Google OAuth credentials:
```bash
cp .env.example .env.local
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📦 Building the Android APK

### Option A: Build via CLI with Gradle
```bash
# Sync web build to native Android assets
npm run build:android

# Compile Debug APK
cd android && ./gradlew assembleDebug
```
The APK will be generated at `android/app/build/outputs/apk/debug/app-debug.apk`.

### Option B: Open in Android Studio
```bash
npm run cap:open
```
Inside Android Studio: Go to **Build** > **Build Bundle(s) / APK(s)** > **Build APK(s)**.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
