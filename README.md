# CounselHelp - Counseling & Guidance Mobile App

A React Native (Expo) mobile application for connecting students and young adults with professional counselors.

## Features

- **Authentication**: Email/password signup and login with Supabase Auth
- **Role-based Access**: Users register as either Clients or Counselors
- **Counselor Onboarding**: Professional bio, specialties, experience, availability
- **Client Onboarding**: Name and area of concern setup
- **Counselor Directory**: Browse available counselors with filtering
- **Real-time Messaging**: One-to-one chat with live updates
- **In-app Notifications**: Real-time notifications for new messages and requests

## Tech Stack

- **React Native** with **Expo**
- **TypeScript** for type safety
- **Supabase** for backend (Authentication, Database, Realtime)
- **React Navigation** for routing

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn
- Expo Go app on your phone (for testing on device)
- A Supabase account

### 1. Clone and Install

```bash
cd Counsellhelp
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the contents of `supabase-schema.sql`
3. Go to **Settings → API** and copy:
   - Project URL
   - `anon` public key

### 3. Configure Environment Variables

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Edit `.env` and add your Supabase credentials:

```
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Run the App

```bash
npx expo start
```

Options:
- Press `i` to open in iOS Simulator
- Press `a` to open in Android Emulator
- Scan QR code with Expo Go app on your phone

## Project Structure

```
src/
├── components/       # Reusable UI components
├── contexts/         # React contexts (Auth, Notifications)
├── lib/              # Supabase client configuration
├── navigation/       # React Navigation setup
├── screens/          # App screens organized by flow
│   ├── auth/         # Login, SignUp, RoleSelection
│   ├── onboarding/   # Counselor and Client onboarding
│   └── main/         # Home, Counselors, Messages, Chat, Profile
├── styles/           # Theme configuration
└── types/            # TypeScript type definitions
```

## Database Schema

| Table | Description |
|-------|-------------|
| `profiles` | Base user profile (id, email, name, role) |
| `counselor_profiles` | Extended counselor info (bio, specialties, experience) |
| `client_profiles` | Client info (area of concern) |
| `conversations` | Chat threads between users |
| `messages` | Individual chat messages |
| `notifications` | In-app notifications |

## Key Features Explained

### Authentication Flow
1. User signs up with email/password
2. Selects role (Client or Counselor)
3. Completes role-specific onboarding
4. Accesses main app

### Real-time Messaging
- Messages are stored in Supabase and synced via Realtime
- Notifications created automatically when new messages are sent
- Conversation list updates when new messages arrive

### Counselor Discovery
- Clients can browse all available counselors
- View counselor profiles with bio, specialties, experience
- Start conversations directly from counselor profile

## Troubleshooting

**"Network request failed" error**
- Ensure Supabase URL and key are correct in `.env`
- Check your internet connection

**Auth not persisting**
- AsyncStorage is used for session persistence
- Clear app data and try again

**Realtime not working**
- Ensure tables are added to `supabase_realtime` publication
- Check RLS policies allow read access

## License

MIT
