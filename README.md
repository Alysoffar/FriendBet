# FriendBet

A social betting platform where friends challenge each other to complete tasks, make predictions, and have fun with friendly competition!

## Features

### Bet Creation & Management
- Create custom challenges with deadlines and categories
- Set required proof types (Image, Video, or Text)
- Track active, completed, and cancelled bets
- View challenges you created and friends' challenges

### Social Predictions
- Friends can vote **FOR** (you'll succeed) or **AGAINST** (you'll fail)
- Stake points on predictions
- Suggest punishments for failed challenges
- Win points when your predictions are correct

### Proof Verification System
- Upload proof before or after the deadline
- Bettors vote to verify if proof is valid (**ACCEPT** / **REJECT**)
- Automatic bet resolution based on majority vote
- Fair mechanism prevents creator bias

### Activity Feed
- See new bets, proof submissions, and completions from friends
- Real-time updates on challenge activities
- Filter by bet status and categories

### Real-time Chat
- Bet-specific chat rooms
- Direct messaging between friends
- Group conversations
- System notifications

### Punishments
- Creative consequences for failed bets
- Friends vote on suggested punishments
- Proof of punishment completion required

### Friend System
- Send and accept friend requests
- View friends' challenges and activities
- Only friends can participate in your bets

### Points & Rewards
- Earn points for winning bets and correct predictions
- Starting balance: 100 points
- Dynamic point distribution based on stakes
- Track your betting history

### Modern UI
- Dark theme with glassmorphism effects
- Responsive design for mobile and desktop
- Animated gradients and smooth transitions
- Intuitive navigation

## Tech Stack

- **Framework:** Next.js 14.2 (App Router)
- **Language:** TypeScript
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Authentication:** JWT (JSON Web Tokens)
- **Styling:** Tailwind CSS
- **Validation:** Zod
- **Password Hashing:** bcryptjs

## Project Structure

```
Betting/
├── app/                      # Next.js app directory
│   ├── api/                  # API routes
│   │   ├── auth/            # Authentication endpoints
│   │   ├── bets/            # Bet management
│   │   ├── challenges/      # Challenge endpoints
│   │   ├── feed/            # Activity feed
│   │   ├── friends/         # Friend management
│   │   ├── notifications/   # Notification system
│   │   ├── punishments/     # Punishment voting
│   │   └── user/            # User profile
│   ├── auth/                # Auth pages (login/register)
│   ├── bets/[id]/           # Bet details page
│   ├── challenges/          # Challenges page
│   ├── chat/                # Chat interface
│   ├── friends/             # Friends page
│   ├── profile/             # User profile
│   └── page.tsx             # Home page
├── components/              # Reusable React components
│   ├── BetCard.tsx
│   ├── BetFeed.tsx
│   ├── ChatBox.tsx
│   ├── PredictionPanel.tsx
│   ├── ProofVerification.tsx
│   └── PunishmentVote.tsx
├── lib/                     # Utility functions
│   ├── auth.ts              # JWT utilities
│   ├── AuthContext.tsx      # Auth state management
│   ├── prisma.ts            # Prisma client
│   ├── utils.ts             # Helper functions
│   └── validations.ts       # Zod schemas
├── prisma/
│   └── schema.prisma        # Database schema
└── public/                  # Static assets
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Betting
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5434/friendbet"
   JWT_SECRET="your-secret-key-here"
   ```

4. **Set up the database**
   ```bash
   # Generate Prisma client
   npx prisma generate
   
   # Run migrations
   npx prisma migrate dev
   
   # (Optional) Open Prisma Studio to view data
   npx prisma studio
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## Database Schema

### Core Models

- **User** - User accounts with points, authentication, and profile info
- **Bet** - Challenges with deadlines, categories, and proof requirements
- **Prediction** - Friends' votes on bet outcomes with point stakes
- **ProofVote** - Verification votes on submitted proof
- **Punishment** - Consequences for failed bets
- **FriendConnection** - Friend relationships
- **ChatMessage** - Messages in bet chats and conversations
- **Conversation** - Direct and group chat channels
- **Notification** - User notifications
- **Powerup** - Temporary advantages for winners

### Key Enums

- **BetCategory**: FITNESS, STUDY, GAMING, SOCIAL, WORK, FOOD, CHALLENGE, OTHER
- **BetStatus**: ACTIVE, COMPLETED, CANCELLED
- **BetResult**: WON, LOST
- **ProofType**: NONE, IMAGE, VIDEO, TEXT
- **PredictionChoice**: FOR, AGAINST
- **ProofVoteChoice**: ACCEPT, REJECT

## How to Play

1. **Register/Login** - Create an account to get started with 100 points

2. **Add Friends** - Send friend requests to connect with others

3. **Create a Bet**
   - Set a challenge title and description
   - Choose a deadline and category
   - Select required proof type
   - Submit and wait for friends to predict!

4. **Make Predictions**
   - Browse friends' active bets
   - Vote FOR (they'll succeed) or AGAINST (they'll fail)
   - Stake points on your prediction
   - Optionally suggest a punishment if they fail

5. **Complete the Challenge**
   - Upload proof of completion anytime
   - Friends verify your proof by voting
   - Bet resolves automatically when majority votes

6. **Win Points**
   - Correct predictions earn you points
   - Complete your bets to win
   - Use points to make bigger bets!

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/user/me` - Get current user profile

### Bets
- `GET /api/bets` - Get user's bets
- `POST /api/bets` - Create new bet
- `GET /api/bets/[id]` - Get bet details
- `POST /api/bets/[id]/vote` - Place prediction
- `POST /api/bets/[id]/proof` - Upload proof
- `POST /api/bets/[id]/verify` - Vote on proof verification
- `POST /api/bets/[id]/resolve` - Resolve bet (after deadline)

### Challenges
- `GET /api/challenges/my` - Get user's challenges with stats
- `GET /api/challenges/friends` - Get friends' challenges

### Feed
- `GET /api/feed` - Get activity feed (friends only)

### Friends
- `GET /api/friends` - Get friend list
- `POST /api/friends/request` - Send friend request
- `POST /api/friends/[id]/accept` - Accept friend request
- `POST /api/friends/[id]/reject` - Reject friend request

### Chat
- `GET /api/chat/conversations` - Get user's conversations
- `POST /api/chat/conversations` - Create conversation
- `GET /api/chat/conversations/[id]/messages` - Get messages
- `POST /api/chat/conversations/[id]/messages` - Send message
- `POST /api/bets/[id]/chat` - Send bet chat message

### Notifications
- `GET /api/notifications` - Get user notifications
- `POST /api/notifications/[id]/read` - Mark as read

## Customization

### Tailwind Configuration
Customize colors, animations, and themes in `tailwind.config.ts`

### Categories
Add or modify bet categories in `prisma/schema.prisma` under the `BetCategory` enum

### Point System
Adjust starting points and payout calculations in the voting and resolution endpoints

## Troubleshooting

### Database Issues
```bash
# Reset database and migrations
npx prisma migrate reset

# Regenerate Prisma client
npx prisma generate
```

### Port Already in Use
```bash
# Kill process on port 3000 (Windows PowerShell)
Stop-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess -Force
```

### Prisma Client Errors
If you see "Cannot find module '@prisma/client'", run:
```bash
npx prisma generate
```
