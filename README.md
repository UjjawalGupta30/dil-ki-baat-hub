# Dil Ki Baat Haven

Build a production-grade, full-stack web application and admin dashboard for "Dil Ki Baat" (a brand under aapkamentor.ai). The app provides a safe, anonymous space for people to vent emotional dilemmas, seek advice, and connect via disappearing live chat.

### 1. Aesthetic & UI Visuals
- Color Palette: Deep vintage burgundy (#3B0D0B background), soft warm gold typography (#D4AF37), muted warm cream (#F7F4EF) text cards, subtle translucent glassmorphism overlays.
- Theme: Old-school warmth meets modern minimal dark design.
- 3D Visuals: Use Three.js (@react-three/fiber or Canvas) in the background to render a soft, rotating golden wireframe heart surrounded by gentle floating particles and subtle ambient Hinglish prompt cards ("Ghar wale career set chahte hain...", "Ever felt alone in a crowd?", "Pyaar tha ya sirf comfort?").

### 2. Database Schema (Supabase integration)
- Table: `submissions`
  - id (UUID), created_at (timestamp)
  - content (text, required)
  - category (text: Relationship, Love, Family, Anxiety, Self thoughts, Social taboos, Confusion, Other)
  - intent (text: Advice, Express, Both)
  - emotional_state (integer 1 to 5)
  - community_question (text)
  - highlight_on_instagram (text: Yes, No, Maybe)
  - nickname (text)
  - anon_user_id (UUID string stored in user's localStorage)
  - status (text: Pending, Approved, Archived)

- Table: `chat_messages`
  - id (UUID), created_at (timestamp)
  - room_id (UUID linked to submission)
  - sender_type (text: 'user' or 'admin')
  - message (text)
  - expires_at (timestamp, based on user selected TTL)

### 3. User Experience & Features
A. Hero Section & Confession Form:
  - Form matching fields:
    1. "What's on your mind?" (Textarea)
    2. "Is it related to..." (Multi-select / Category tags)
    3. "Do you want advice, just to vent, or both?" (Radio choice)
    4. "How are you feeling emotionally right now?" (Interactive 1-5 scale: Very Low to Uplifted)
    5. "Any specific question you want the community to answer?" (Optional input)
    6. "Do you want us to highlight your story on Instagram?" (Yes / No / Maybe)
    7. "Set a nickname for your story" (Optional)
    8. Toggle: "Open live chat with an admin/mentor" (Includes TTL dropdown: Disappear in 1h, 24h, Never).

B. Live Anonymous Chat Widget:
  - Post-submission popup or drawer opening a real-time chat powered by Supabase Realtime.
  - Shows assigned alias (e.g., "Gumnam Dost #402") and disappearing timer status.

C. Safety & Helpline Modal:
  - Header button: "In Distress? Get Help". Opens modal with Tele-MANAS (14416) & Vandrevala Foundation (9999 666 555).
along with write correct disclaimer and temrs of service and ask usr to click and read in best easy manner.

### 4. Admin Dashboard (`/admin`)
- Analytics Row: Total Confessions, Active Live Chats, Emotional Pulse Index (Average 1-5 score), Category Breakdown Chart.
- Submissions Manager: Filterable table to review incoming submissions, toggle Instagram approval for the automated social agent, and archive items.
- Live Chat Workspace: Split-screen interface showing active chat rooms, direct messaging panel to reply as Admin, and quick pre-written empathetic response buttons.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/a784a5d1-cca6-40e5-9396-8ebbe1c456b5).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
