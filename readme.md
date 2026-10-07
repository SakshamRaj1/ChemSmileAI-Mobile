# ChemSmileAI Mobile Application

<div align="center">

**[Original Project is -> ChemSmileAI: a web app for Molecular Analysis and Similarity Search Engine](https://github.com/SakshamRaj1/ChemSmileAI)**

*A computational cheminformatics platform designed for code-free chemical analysis, molecular property computation, and structural modification workflows.*

[![Expo SDK](https://img.shields.io/badge/Expo%20SDK-57.0.0-black?logo=expo)](https://expo.dev)
[![React Native](https://img.shields.io/badge/React%20Native-0.74+-blue?logo=react)](https://reactnative.dev)
[![EAS Build](https://img.shields.io/badge/EAS-Build%20Passed-brightgreen?logo=expo)](https://expo.dev)
[![Platform](https://img.shields.io/badge/Platform-Android%20%7C%20iOS-lightgrey)](#)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

</div>

## 📥 Download

Download the latest Android release directly:

[![Download ChemSmileAI APK](https://img.shields.io/badge/Download-ChemSmileAI.apk-2563EB?style=for-the-badge&logo=android&logoColor=white)](https://github.com/SakshamRaj1/ChemSmileAI/releases/latest/download/ChemSmileAI.apk)

---

## 📌 Overview

The **ChemSmileAI Mobile App** packages the full computational cheminformatics suite into a high-performance native mobile container for both Android and iOS. Built with **React Native** and the **Expo Framework**, it eliminates the requirement for local native IDE installations (such as Android Studio or Xcode) by leveraging cloud-based compilation via **EAS (Expo Application Services)**.

### Key Capabilities
- **Direct Web Suite Integration:** Seamless web application rendering powered by `react-native-webview`.
- **Native File Download Pipeline:** Full interception and streaming of generated cheminformatics files (`.csv`, `.sdf`, `.mol`, `.pdb`, `.png`, `.txt`) using `expo-file-system/legacy` and `expo-sharing`.
- **Multi-Format Form Interception:** Captures active submit buttons and dynamic Flask parameters in HTML forms, bypassing Android's isolated OS `DownloadManager` to prevent download failure toasts.
- **Cache-Busted Exports:** Integrated request cache-busting ensures recalculations generate fresh, non-stale files on every download action.
- **Custom Branded Startup:** Dark-themed native splash screen (`#0b0909`) powered by `expo-splash-screen` transitioning into a clean project intro screen.
- **Hardware Integration:** Native Android hardware back-button listener linked directly to the internal web view history.
- **Automated Gateway Bypass:** Injected bypass logic and automated request headers for development tunneling environments (e.g., ngrok).
- **Offline & Error Resilience:** Custom connection failure handling with an in-app reload mechanism.

---

## 🏗️ Architecture & Project Structure

```text
ChemSmileAI/
├── assets/
│   ├── App-logo.png             # Centered adaptive app icon (padded safe-zone)
│   ├── logo-startup.png         # Splash and launch branding asset
│   └── ...
├── App.js                       # Primary application runtime, download hooks & WebView
├── app.json                     # Expo SDK configuration, permissions & plugins
├── eas.json                     # EAS Cloud build profiles (preview APK, production AAB/IPA)
├── package.json                 # Dependency manifest
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (LTS recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Expo Go](https://expo.dev/go) application on your mobile device (optional, for local testing)

### 1. Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/sakshamraj1/ChemSmileAI-Mobile.git
cd ChemSmileAI
npm install
```

### 2. Local Development

Start the Metro bundler to run the project in development mode:

```bash
npx expo start
```

- Open **Expo Go** on Android or the default **Camera app** on iOS.
- Scan the QR code displayed in the terminal.

---

## ⚙️ Configuration

### Changing Target Endpoints
The live chemical engine endpoint can be updated directly in `App.js`:

```javascript
// App.js
const WEBSITE_URL = 'https://your-production-url.com';
const SPLASH_DURATION_MS = 2500;
```

### Asset & Icon Guidelines
- **Splash Screen:** Handled by `expo-splash-screen` in `app.json` with a background tone of `#0b0909`.
- **Adaptive Icons (Android):** To prevent unwanted cropping from Android's circular masking, ensure `App-logo.png` maintains a centered design footprint within the safe center zone of the image canvas.

---

## 📦 Cloud Builds with EAS

This project is configured for cloud compilation without local SDK dependencies.

### 1. Install EAS CLI & Authenticate
```bash
npm install -g eas-cli
eas login
```

### 2. Generate Standalone Android APK (Preview)
```bash
eas build -p android --profile preview
```
Once the build completes on the Expo build servers, EAS generates a direct `.apk` download link ready for distribution and installation.

### 3. Generate Production Builds
- **Android (AAB for Google Play):**
  ```bash
  eas build -p android --profile production
  ```
- **iOS (IPA for App Store / TestFlight):**
  ```bash
  eas build -p ios --profile production
  ```

---

## 📄 License

This project is distributed under the terms of the MIT License. See the [LICENSE](LICENSE) file for more information.
