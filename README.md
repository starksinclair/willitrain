# WillItRain (Expo) – Clean Setup & Run Guide

This is an [Expo](https://expo.dev) app. Follow the steps below to get running on a clean macOS environment (including Xcode and the iOS Simulator).

## Prerequisites (macOS)

- Node.js 18+ and npm
  - Recommended: install via Homebrew: `brew install node`
- Git (usually preinstalled on macOS)
- Optional: [Watchman](https://facebook.github.io/watchman/): `brew install watchman`

## Install Xcode and iOS Simulator

1. Install Xcode from the App Store
   - Open the App Store, search for “Xcode”, click Install.
2. Open Xcode once to finish setup
   - Launch Xcode → Accept license → Xcode → Settings → Locations → ensure Command Line Tools is set.
3. Install iOS Simulator runtime
   - Xcode → Settings → Platforms → Install at least one iOS version.
4. Start the Simulator (optional manual start)
   - Xcode → Open Developer Tool → Simulator.

## Project setup

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the Expo dev server

   ```bash
   npx expo run:ios
   ```

3. Run on iOS Simulator
   - With the dev server running, press `i` in the Expo terminal, or
   - Click “Run on iOS simulator” in the web UI.

Notes:

- This project runs great in the iOS Simulator with Expo Go. Xcode must be installed for Simulator integration to work.


## Project structure

- `app/`: screens and routes (Expo Router)
- `components/`: shared UI
- `constants/`: helpers and utilities
- `services/` and `api/`: data fetching

You can start developing by editing files inside the **app** directory (file‑based routing).

## Learn more

- Expo docs: https://docs.expo.dev/
- iOS Simulator: https://docs.expo.dev/workflow/ios-simulator/
- Development builds: https://docs.expo.dev/develop/development-builds/introduction/

## Community

- GitHub: https://github.com/expo/expo
- Discord: https://chat.expo.dev
