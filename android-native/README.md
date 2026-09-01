# SortScope for Android

This directory contains the fully native SortScope Android application. It is written in Kotlin with Jetpack Compose, uses no WebView, and requests no `INTERNET` permission. All fifteen sorting engines, traces, lessons, datasets, progress, prediction checkpoints, and complexity experiments run completely offline inside the APK.

## Mobile experience

- Explore, Visualize, and Learn areas designed for one-handed phone use
- Fixed playback dock with 48 dp touch targets
- Native animated bar theater and operation narration
- Random, nearly sorted, reversed, duplicate-heavy, and custom arrays
- Fair comparison clock based on comparisons plus writes
- Prediction checkpoints, persistent lesson completion, and Stability Lab identities
- Measured Complexity Lab
- Light and dark system themes
- No account, telemetry, network client, remote content, or WebView

## Build locally

Install Android SDK 35, Java 17, and Gradle 8.9, then run:

```bash
cd android-native
gradle :app:testDebugUnitTest :app:lintDebug :app:assembleDebug
```

The installable debug APK is produced at:

```text
app/build/outputs/apk/debug/app-debug.apk
```

GitHub Actions also builds and uploads `SortScope-native-debug.apk` for every Android pull request and every Android change merged to `master`.
