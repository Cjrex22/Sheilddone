# SHIELD - Women's Personal Safety PWA

SHIELD is a modern, cross-platform Progressive Web Application (PWA) designed to provide discreet, instantaneous, and highly reliable personal safety mechanisms. It combines a robust Java Spring Boot backend with a responsive React frontend, leveraging Firebase for real-time alerts and secure authentication.

## 🚀 Key Features

- **Shake-to-SOS:** Trigger a silent distress signal by simply shaking your device. No need to unlock the phone or open the app.
- **Guard Circle:** Build a trusted network of emergency contacts who receive instant push notifications with your live location.
- **Dynamic Safe Zones:** Automatically find the nearest police stations and hospitals using real-time geospatial data (Overpass API).
- **Secure Evidence Vault:** A cloud-synced storage module to host sensitive multimedia evidence (images/audio) during emergencies.
- **Digital Bodyguard:** Real-time tracking sessions that notify your circle if you deviate from your path.

## 🛠️ Tech Stack

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, Zustand (State Management), Leaflet (Maps).
- **Backend:** Java 17, Spring Boot 3, Spring Security (JWT), Caffeine Cache.
- **Infrastructure:** Google Firebase (Authentication, Firestore, Cloud Messaging, Hosting).
- **APIs:** OpenStreetMap (Overpass API) for geospatial queries, Nominatim for reverse geocoding.

## 📦 Project Structure

```text
.
├── sheild-backend/     # Java Spring Boot microservice
├── sheild-frontend/    # React/Vite PWA
├── firebase.json       # Firebase Hosting & Functions config
├── firestore.rules     # Database security rules
└── storage.rules       # Firebase Storage security rules
```

## ⚙️ Setup Instructions

### 1. Firebase Configuration
1.  Create a project in the [Firebase Console](https://console.firebase.google.com/).
2.  Enable **Authentication** (Email/Password), **Firestore Database**, and **Cloud Messaging**.
3.  Generate a **Service Account Key** (JSON) and save it as `sheild-backend/src/main/resources/serviceAccountKey.json`.
4.  Copy your **Web App Configuration** and paste the keys into `sheild-frontend/.env.production`.

### 2. Backend Setup
1.  Navigate to `sheild-backend/`.
2.  Configure `src/main/resources/application.yml` with your project details.
3.  Run the application:
    ```bash
    ./mvnw spring-boot:run
    ```

### 3. Frontend Setup
1.  Navigate to `sheild-frontend/`.
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the development server:
    ```bash
    npm run dev
    ```
