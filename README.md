# HikariFlix-Frontend

An Android-exclusive anime streaming application built with React Native Expo, powered by AniList's GraphQL API for comprehensive anime information and metadata.

## Overview

HikariFlix is a modern Android anime streaming platform built with React Native and Expo. It provides a seamless mobile viewing experience with features like anime browsing, streaming capabilities, and personal content management.

## Tech Stack

- **Framework**: React Native
- **Development Platform**: Expo
- **Target Platform**: Android
- **API Integration**: AniList GraphQL API

## Features

### Currently Implemented ✅
- **Anime Information Display**
  - Detailed show information
  - Synopsis and metadata
  - Integration with AniList data

### In Progress 🔄
- **Streaming Interface**
  - Video player implementation
  - Quality selection
  - Playback controls
- **Favorites System**
  - Save favorite shows
  - Custom lists
  - Watch history

### Planned Features 📋
- **Download Functionality**
  - Offline viewing support
  - Download manager
  - Storage management
- **Account System**
  - User profiles
  - Sync preferences
  - Watch history sync
- **Settings**
  - App customization
  - Playback preferences
  - Language settings

## Getting Started

### Prerequisites
- Node.js
- Expo CLI
- Android Studio or a physical Android device for testing
- Android SDK

### Installation
```bash
# Clone the repository
git clone [your-repo-url]

# Install dependencies
npm install

# Start the Expo development server
expo start
```

### Running on Android
- Physical Device: Enable USB debugging and connect your device
- Emulator: Start your Android emulator
- Run: `expo run:android`

## Development

### Project Structure
```
src/
├── components/
├── screens/
├── navigation/
├── services/
├── utils/
└── assets/
```

## Android Requirements
- Minimum Android version: 8
- Required permissions:
  - Internet access
  - Storage access (for downloads)

## Related Projects

- [HikariFlix-Backend](link-to-backend-repo) - Backend service providing streaming links and content management

## Acknowledgments

- AniList for their comprehensive anime database and GraphQL API
- The React Native and Expo communities for their excellent tools and documentation
