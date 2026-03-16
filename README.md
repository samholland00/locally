# locally

A private neighborhood social network. No algorithms, no ads, no strangers — just the people on your block.

---

## What it is

locally is a mobile app that lets you communicate with your immediate neighbors and nobody else. Posts are scoped to a ~1km radius using geohash. You can only join if a verified neighbor physically hands you an invite — there's no sign-up link, no invite code you can share over text, and no way in without being physically present in the neighborhood.

The feed shows posts from people near you. You can reply to posts and see where they came from on a map. That's it.

---

## How joining works

1. A verified neighbor opens the app and generates a QR code (valid for 60 seconds)
2. You open locally and scan their code — while standing next to them
3. The app checks that both devices are in the same geohash zone
4. If the check passes, you're in

This mechanic means the network can only grow person-to-person, in person. No spam accounts, no brigading from outside the neighborhood.

---

## Tech stack

- **React Native** (Expo SDK 54, Expo Router v6)
- **Supabase** — auth, Postgres database, row-level security
- **Geohash level 6** — ~1.2km × 600m neighborhood radius
- **expo-location** — GPS + reverse geocoding for address detection
- **expo-camera** — QR code scanning
- **react-native-maps** — neighborhood map in thread view
- **DM Sans** — consistent cross-platform typography

---

## Screens

| Screen | Description |
|--------|-------------|
| Welcome | Splash with CTA to get started |
| Sign up | Collects real name (private), display name, email, password |
| Address | Auto-detects address via GPS, reverse geocoded |
| Scan | Camera view to scan a neighbor's invite QR code |
| Feed | Geohash-scoped post feed, pull to refresh |
| Thread | Full post with replies and neighborhood map |
| Compose | New post, 500 char limit |
| Profile | Account info, invite code generator, sign out |

---

## Database

Three core tables in Supabase:

- **users** — public profile (display name, street name, geohash, photo URL)
- **posts** — neighborhood posts scoped by geohash
- **replies** — threaded replies on posts
- **invite_tokens** — 60-second expiry QR tokens tied to a geohash

Real name and full address are stored only in Supabase auth metadata — never in the public `users` table.

---

## Running locally

### Prerequisites

- Node.js
- Expo Go on your phone (iOS or Android)
- A Supabase project with the schema applied

### Environment

Create a `.env` file in the root:

```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### Start

```bash
npm install
npx expo start
```

Scan the QR code with Expo Go.

### Database setup

Run the schema SQL in your Supabase SQL editor, then create the `handle_new_user` trigger to auto-create a `public.users` row on signup. RLS policies are required on all tables.

---

## Design

Black and white. No icons. Sentence case everywhere except the `locally` wordmark. DM Sans throughout. The goal is something that feels more like a bulletin board than a social network.

---

## Status

Active development. Core flows are working end-to-end. Coming up: tighter RLS policies (geohash-scoped reads), moderation tools, and profile photos.
