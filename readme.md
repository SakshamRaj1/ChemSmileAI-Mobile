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


🚀 Getting Started
Prerequisites
Node.js (v18 or LTS recommended)

npm or yarn

Expo Go application on your mobile device

1. Installation
Clone the repository and install dependencies:

Bash
git clone [https://github.com/SakshamRaj1/ChemSmileAI.git](https://github.com/SakshamRaj1/ChemSmileAI.git)
cd ChemSmileAI
npm install
2. Local Development
Start the Metro bundler to run the project in development mode:

Bash
npx expo start
Open Expo Go on Android or the default Camera app on iOS.

Scan the QR code displayed in your terminal.

⚙️ Configuration & Architecture Details
Endpoint Configuration
The target cheminformatics server URL and intro splash display time are configured at the top of App.js:

JavaScript
// App.js
const WEBSITE_URL = '[https://your-production-url.com/](https://your-production-url.com/)';
const SPLASH_DURATION_MS = 2000;
Native Download Handling
Android's default WebView delegates file downloads containing Content-Disposition: attachment to the OS-level DownloadManager. Since the system manager runs outside the WebView sandbox, it lacks active sessions, authentication, and custom tunnel headers, resulting in download failures.

ChemSmileAI Mobile resolves this completely at the client layer:

DOM Prototype Patching: Injects early JavaScript hooks before DOM load to intercept <form> submissions, clicked submit buttons, and <a> clicks.

In-Memory Streaming: Fetches generated molecular payloads directly via the browser context preserving active session headers and converts them to base64.

Native Share Dialog: React Native writes the payload to FileSystem.cacheDirectory and presents the native Android/iOS share and save modal via Sharing.shareAsync.

Adaptive Icon Safe Zone
Android adaptive icons crop assets to circular or squircle masks with a diameter of ~66% of the full canvas. App-logo.png is placed centered with transparent padding on a #0b0909 background to eliminate border distortion.

📦 Cloud Builds with EAS
This project is configured for compilation in the cloud without Android Studio or Xcode.

1. Install EAS CLI & Authenticate
Bash
npm install -g eas-cli
eas login
2. Generate Standalone Android APK (Direct Install)
Bash
eas build -p android --profile preview
Once compilation completes, EAS generates a direct .apk binary link ready for distribution and installation.

3. Generate Production Builds
Android (AAB for Google Play):

Bash
eas build -p android --profile production
iOS (IPA for App Store / TestFlight):

Bash
eas build -p ios --profile production
📄 License
This project is distributed under the terms of the MIT License. See the LICENSE file for more information.
