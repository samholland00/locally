# Locally — Product Plan

## Context
Social networks have abandoned local. Facebook and Instagram are ad-driven, algorithmically global, and influencer-heavy. Nextdoor tried to solve local community but failed due to anonymous accounts enabling toxic behavior and low-quality content. People have retreated into group chats — functional but fragmented. **Locally** fills this gap: a physically-verified, neighbor-vouched social network scoped to your actual neighborhood.

---

## Problem Statement
It's hard to connect with your neighbors. Existing tools either don't focus on local (Facebook, IG) or failed at moderation and usefulness (Nextdoor). The result: real-world communities feel disconnected even when people live 50 feet apart.

---

## Solution
A mobile-first local social network where:
- Your neighborhood is defined by your home address (geohash)
- You can only join if a neighbor physically scans you in
- The feed is text-based, local, and neighbor-only

---

## Core Differentiators

| Feature | Why it matters |
|---|---|
| **Scan-to-join** | Physical vouching creates accountability. Reduces toxicity at the source. |
| **VPN-proof location** | GPS + home address verification. Can't fake your neighborhood. |
| **Geohash boundaries** | Consistent, DB-indexable neighborhood definitions. No subjective polygon drawing. |
| **No ads, no influencers** | Content is from real neighbors only. |

---

## Geographic Model
- User sets **home address** at onboarding
- Address is converted to a **geohash** (precision tunable for neighborhood radius)
- All content, connections, and scan eligibility are scoped to matching geohash cells
- Neighbors in adjacent cells are included (geohash adjacency is well-defined)
- **Geohash level 6** (~1.2km × 600m) as default neighborhood radius

---

## Onboarding Flow

### Cold Start (Early Launch)
1. Founder manually seeds the first user in each neighborhood
2. That user can then scan others in

### Normal Flow
1. New user downloads app, sets home address
2. GPS verified against address (VPN-proof, no spoofing)
3. An existing neighbor opens app → generates a **QR code** (60-second expiry)
4. New user scans QR → GPS cross-checked at scan time
5. User is admitted to their geohash neighborhood

---

## MVP Feature Set

### Must Have
- [ ] Account creation + home address verification
- [ ] Geohash neighborhood assignment
- [ ] QR scan-to-join mechanic (with expiry + GPS check)
- [ ] Text-based neighborhood feed (post, read, reply)
- [ ] Admin panel for founder to seed neighborhoods

### Post-MVP (Next)
- [ ] Marketplace listings surfaced in feed
- [ ] Local events in feed
- [ ] Moderation tools (report, mute, remove)
- [ ] Neighborhood stats / member count

---

## Platform
**Both iOS + Android simultaneously** via React Native.
- Rationale: social apps live or die by network effects — locking out half the phones in a neighborhood kills growth
- QR scan mechanic works natively on both platforms

---

## Core Daily Loop
1. Open app → see neighbor feed
2. Post a text update, question, or announcement
3. Reply to neighbors
4. (Eventually) browse local items/events

---

## Privacy Model
- **Onboarding (private/backend):** Full name + photo + home address — verified against geohash + GPS at scan time. Never shown publicly.
- **Public profile:** Display name + photo + street name only (house number obfuscated)
- **Verification:** Two-layer — backend geohash/GPS check + human neighbor physically scanning confirms real presence

---

## Moderation
- **MVP:** Community-driven only — neighbors report posts/users
- **Risk to monitor:** Nextdoor was also community-moderated early. Define an escalation path before scaling.
- Post-MVP: add founder review queue for flagged content, then hand off

---

## Monetization
- No ads. No recurring subscription.
- **Leading option:** One-time download fee
- **Risk:** Cold start — users hesitant to pay upfront for an unproven network
- **Alternative to consider:** Freemium (free to join, one-time unlock for premium features)
- Decision deferred — not needed for MVP

---

## Tech Decisions
- **Framework:** React Native (Expo)
- **Scan mechanic:** QR code with 60-second expiry + GPS check at scan time
- **Geohash precision:** Level 6 (~1.2km × 600m)

---

## Open Questions
- **Monetization:** One-time fee vs freemium. Decide before launch.

---

## Next Steps
1. Design UX/UI — flows, screens, colors, feel
2. Scaffold repo structure and begin build
