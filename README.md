<div align="center">
  <img src="assets/images/icon.png" alt="NeoME logo" width="120" />

  # NeoME

  **Improve the real you.**

  A mobile-first, gamified wellness companion for physical, mental, emotional,
  and social well-being.

  ![Expo SDK 52](https://img.shields.io/badge/Expo-SDK%2052-000020?logo=expo)
  ![React Native 0.76](https://img.shields.io/badge/React%20Native-0.76-61DAFB?logo=react)
  ![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
</div>

## Overview

NeoME brings several parts of a wellness routine into one application. Users can
create an account, complete a wellness profile, follow guided workouts, organize
tasks, check in on their mood, challenge friends, exchange messages, and view a
game-like avatar and progress dashboard.

The project is an active prototype. Authentication and social messaging use
Firebase, while some progress metrics, activities, challenge data, and avatar
statistics are currently local or illustrative. Video calling has been
scaffolded but still needs production Stream credentials and a token service.

## Product areas

| Area | What is in the app today |
| --- | --- |
| Account and profile | Email/password authentication, onboarding, avatar selection, birthdate, body profile, activity level, wellness goals, and health questions |
| Physical wellness | Full-body and body-area plans across beginner, intermediate, and advanced levels, plus ready, workout, and rest timers |
| Mental wellness | Task folders, dated tasks, editing, completion tracking, and in-memory task state |
| Emotional wellness | Mood check-ins and suggested activities presented through an interactive activity screen |
| Social wellness | Friend discovery and requests, presence, direct chat, typing state, reactions, stickers, photos, and audio messages |
| Motivation | Solo/friend challenge flows, points, badges, overall and friends leaderboards |
| Progress | Dashboard metrics, a remotely loaded 3D avatar, and current-versus-goal avatar views |
| Assistant | A WebView-based Gemini chatbot prototype available throughout the app |

## Tech stack

- React Native 0.76 and Expo SDK 52
- Expo Router 4 with typed, file-based routes
- TypeScript and React 18
- Firebase Authentication, Cloud Firestore, and Cloud Storage
- React Context for local task and folder state
- React Native WebView, Three.js, and Google Model Viewer for embedded experiences
- Stream Video SDK and WebRTC dependencies for the video-call prototype
- Jest, React Test Renderer, and Expo ESLint
- EAS configuration for development, preview, and production builds

## Architecture at a glance

```text
app/
├── _layout.tsx              Root navigation, providers, and floating chatbot
├── loginpage/               Registration, sign-in, and password recovery
├── neome_userdata_app/      Multi-step wellness onboarding
├── homescreen/              Main dashboard and embedded 3D avatar
├── physical_activities/     Workout plans and full-body flows
├── beginner|intermediate|advanced/
│                             Body-area workout detail screens
├── startWorkout/            Ready, active workout, and rest screens
├── mental_activities/       Task and folder screens
├── emotional_activities/    Mood and emotional wellness activities
├── Challenges/              Challenge creation, tracking, and rewards
├── leaderboard/             Overall and friends rankings
├── messaging/               Friends, chat, media, calls, and rooms
├── avatar_progress/         Avatar comparison and progress details
└── chatbot/                 Native WebView wrapper and floating launcher

components/                  Shared UI and social/messaging components
contexts/                    In-memory task and folder stores
assets/ and app/assets/      Fonts, icons, illustrations, GIFs, and avatars
firebaseConfig.ts            Firebase client initialization
android/ and ios/            Generated native projects
```

Expo Router turns files below `app/` into routes. The root layout supplies the
task and folder contexts, renders the route stack, and adds the floating chatbot
outside the chatbot route itself.

Firebase-backed features use the following high-level data shape:

```text
users/{uid}
├── profile, avatar, presence, and friend IDs
└── friendRequests/{requestId}

chats/{chatId}
└── messages/{messageId}
```

Task folders, task completion, dashboard statistics, and several challenge or
leaderboard values are not yet fully persisted. Restarting the application can
reset context-owned data.

## Getting started

### Prerequisites

- Node.js 20 LTS or newer and npm
- Git
- Android Studio with an Android SDK and emulator, or a connected Android device
- macOS with Xcode for iOS development
- A Firebase project if you want account, friend, and messaging flows to work

NeoME depends on native packages such as Notifee and WebRTC. **Expo Go cannot run
the complete application**; use a local development build or an EAS development
build instead. Android and iOS are the primary targets. The web command is useful
for limited UI development, but native-backed features may not be available.

### 1. Clone and install

```bash
git clone https://github.com/nathanaellarida/neome.git
cd neome
npm ci
```

### 2. Configure Firebase

The app currently initializes the Firebase JavaScript SDK from
`firebaseConfig.ts`. To use a different project:

1. Create a Firebase project and a web app.
2. Enable Email/Password in Firebase Authentication.
3. Create Cloud Firestore and Cloud Storage.
4. Replace the client configuration in `firebaseConfig.ts`.
5. Add Firestore and Storage security rules appropriate for the `users`,
   `friendRequests`, `chats`, and `messages` data shown above.

Firebase client identifiers are not server secrets, but access must be protected
with Authentication, Firestore rules, Storage rules, and appropriate API-key
restrictions. Never commit a service-account key.

### 3. Build and run

Build and install the native development app:

```bash
npm run android
```

On macOS, the iOS equivalent is:

```bash
npm run ios
```

After the development app has been installed, normal JavaScript/TypeScript work
can use the Metro development server:

```bash
npm start
```

Rebuild the native app after changing native dependencies, Expo plugins, native
permissions, or platform configuration.

### Optional: EAS development build

The included `eas.json` defines `development`, `preview`, and `production`
profiles. A development build can be requested with:

```bash
npx eas-cli build --profile development --platform android
```

Use `--platform ios` for iOS. The Expo project ID in `app.json` belongs to the
current project; contributors using another Expo account must link or configure
their own EAS project first.

## External services and prototype integrations

| Integration | Location | Notes |
| --- | --- | --- |
| Firebase | `firebaseConfig.ts` | Required for authentication, profiles, friends, presence, chat, reactions, and uploaded media |
| Gemini chatbot | `app/assets/chatbot.html` | The prototype calls Gemini from an embedded WebView. Move this behind a trusted backend before production so credentials and abuse controls are not shipped in the client |
| Stream Video | `app/messaging/VideoCall.tsx` | Scaffold only. Supply a Stream API key and issue user tokens from a secure backend before enabling calls |
| 3D avatar | `app/homescreen/HomeScreen.tsx` | Loads Model Viewer, Three.js, and the avatar model from remote URLs, so this view requires network access |

Production tokens and provider secrets must never be generated or stored in the
mobile client.

## Commands

| Command | Purpose |
| --- | --- |
| `npm start` | Start the Expo/Metro development server |
| `npm run android` | Generate, build, install, and run the Android app |
| `npm run ios` | Generate, build, install, and run the iOS app on macOS |
| `npm run web` | Start the limited web target |
| `npm run lint` | Run Expo ESLint across the project |
| `npm test` | Run Jest in watch mode |
| `npm test -- --runInBand --watchAll=false` | Run the test suite once, suitable for CI or pre-commit checks |
| `npx tsc --noEmit` | Type-check without writing build output |

`npm run reset-project` is the original Create Expo App reset utility. It moves
the current `app/` directory and creates a blank starter, so it is not part of the
normal NeoME setup workflow.

## Development notes

- The root layout currently redirects every fresh mount to
  `/loginpage/register`; change the redirect/auth-gating logic there when adding
  durable sessions or deep links.
- The task and folder contexts seed demonstration content and keep it in memory.
- Some dashboard, challenge, progress, and leaderboard values are hard-coded UI
  fixtures and should not be treated as analytics or persisted user results.
- Messaging expects authenticated users and compatible Firestore/Storage rules.
- Native permissions for camera, microphone, networking, and audio are declared
  in the Expo/native configuration.

## Validation

Before opening a pull request, run:

```bash
npm run lint
npm test -- --runInBand --watchAll=false
npx tsc --noEmit
```

The repository currently has a passing Jest snapshot test. At the current
baseline, lint reports an unresolved import in the vector-icons type declaration
plus existing warnings, and the standalone TypeScript check exposes two type
issues in shared starter components. Expo may also generate an ESLint config on
the first lint run if one is not present. Avoid introducing additional errors
while these existing issues are being resolved.

## Troubleshooting

- **A native module is missing:** make sure you opened a development build rather
  than Expo Go, then rebuild the native app.
- **Firebase reports `permission-denied`:** confirm the user is authenticated and
  review the project’s Firestore and Storage rules.
- **The avatar is blank:** verify network access to the external script and model
  hosts used by `HomeScreen.tsx`.
- **The chatbot returns an API error:** check the Gemini project, model access,
  quota, and key restrictions; use a backend proxy for any deployed environment.
- **Metro serves stale code:** stop Metro and restart it with `npx expo start -c`.

## Contributing

Create a focused branch, keep changes scoped, and include tests or validation for
the behavior you change. Commit generated native changes only when an Expo plugin,
permission, or native dependency actually requires them.
