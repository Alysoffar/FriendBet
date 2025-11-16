# FriendBet API Documentation

Complete API reference for the FriendBet platform.

## Base URL

```
http://localhost:3000/api
```

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

---

## Authentication Endpoints

### Register User

Create a new user account.

**Endpoint:** `POST /auth/register`

**Request Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Success Response (201):**
```json
{
  "user": {
    "id": "clxxx...",
    "username": "johndoe",
    "email": "john@example.com"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Response (400):**
```json
{
  "error": "Username already exists"
}
```

---

### Login User

Authenticate an existing user.

**Endpoint:** `POST /auth/login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Success Response (200):**
```json
{
  "user": {
    "id": "clxxx...",
    "username": "johndoe",
    "email": "john@example.com",
    "points": 150
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Response (401):**
```json
{
  "error": "Invalid credentials"
}
```

---

## User Endpoints

### Get Current User

Retrieve the authenticated user's profile.

**Endpoint:** `GET /user/me`

**Headers:** `Authorization: Bearer <token>`

**Success Response (200):**
```json
{
  "id": "clxxx...",
  "username": "johndoe",
  "email": "john@example.com",
  "points": 150,
  "avatar": null,
  "createdAt": "2025-11-16T10:00:00.000Z",
  "powerups": [
    {
      "id": "clyyy...",
      "type": "STAKE_BOOST",
      "value": 10,
      "expiresAt": "2025-11-20T10:00:00.000Z"
    }
  ]
}
```

**Error Response (401):**
```json
{
  "error": "Unauthorized"
}
```

---

## Bet Endpoints

### Create Bet

Create a new challenge.

**Endpoint:** `POST /bets`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "title": "Run 5K in under 30 minutes",
  "description": "I will complete a 5K run in less than 30 minutes by next Friday",
  "deadline": "2025-11-23T18:00:00.000Z",
  "category": "FITNESS",
  "proofRequired": "IMAGE"
}
```

**Success Response (201):**
```json
{
  "id": "clzzz...",
  "creatorId": "clxxx...",
  "title": "Run 5K in under 30 minutes",
  "description": "I will complete a 5K run in less than 30 minutes by next Friday",
  "deadline": "2025-11-23T18:00:00.000Z",
  "category": "FITNESS",
  "proofRequired": "IMAGE",
  "status": "ACTIVE",
  "result": null,
  "createdAt": "2025-11-16T10:00:00.000Z"
}
```

**Error Response (400):**
```json
{
  "error": "Invalid input",
  "details": [
    {
      "path": ["deadline"],
      "message": "Deadline must be in the future"
    }
  ]
}
```

---

### Get User's Bets

Retrieve all bets created by the authenticated user.

**Endpoint:** `GET /bets`

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `status` (optional): Filter by status (`ACTIVE`, `COMPLETED`, `CANCELLED`)

**Success Response (200):**
```json
[
  {
    "id": "clzzz...",
    "title": "Run 5K in under 30 minutes",
    "description": "I will complete a 5K run...",
    "deadline": "2025-11-23T18:00:00.000Z",
    "category": "FITNESS",
    "status": "ACTIVE",
    "result": null,
    "predictions": [
      {
        "id": "claaa...",
        "choice": "FOR",
        "stake": 50,
        "user": {
          "id": "clbbb...",
          "username": "janedoe"
        }
      }
    ],
    "_count": {
      "predictions": 3
    }
  }
]
```

---

### Get Bet Details

Retrieve detailed information about a specific bet.

**Endpoint:** `GET /bets/:id`

**Headers:** `Authorization: Bearer <token>`

**Success Response (200):**
```json
{
  "id": "clzzz...",
  "title": "Run 5K in under 30 minutes",
  "description": "I will complete a 5K run in less than 30 minutes",
  "deadline": "2025-11-23T18:00:00.000Z",
  "category": "FITNESS",
  "proofRequired": "IMAGE",
  "status": "ACTIVE",
  "result": null,
  "proofUrl": null,
  "verificationRequired": false,
  "creator": {
    "id": "clxxx...",
    "username": "johndoe",
    "avatar": null
  },
  "predictions": [
    {
      "id": "claaa...",
      "choice": "FOR",
      "stake": 50,
      "payout": 0,
      "user": {
        "id": "clbbb...",
        "username": "janedoe",
        "avatar": null
      }
    }
  ],
  "chatMessages": [
    {
      "id": "clccc...",
      "message": "Good luck!",
      "createdAt": "2025-11-16T11:00:00.000Z",
      "sender": {
        "id": "clbbb...",
        "username": "janedoe"
      }
    }
  ],
  "punishments": [],
  "stats": {
    "forCount": 2,
    "againstCount": 1,
    "totalStaked": 150
  }
}
```

---

### Place Prediction

Vote on a friend's bet.

**Endpoint:** `POST /bets/:id/vote`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "choice": "FOR",
  "stake": 50,
  "punishment": "Do 100 pushups on stream"
}
```

**Success Response (201):**
```json
{
  "id": "claaa...",
  "betId": "clzzz...",
  "userId": "clbbb...",
  "choice": "FOR",
  "stake": 50,
  "payout": 0,
  "createdAt": "2025-11-16T12:00:00.000Z",
  "user": {
    "id": "clbbb...",
    "username": "janedoe",
    "avatar": null
  }
}
```

**Error Response (400):**
```json
{
  "error": "Insufficient points. You have 30 points but trying to stake 50"
}
```

---

### Upload Proof

Upload proof of bet completion (can be done before or after deadline).

**Endpoint:** `POST /bets/:id/proof`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "proofUrl": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
}
```

**Success Response (200):**
```json
{
  "message": "Proof uploaded successfully. Bettors have been notified to verify.",
  "bet": {
    "id": "clzzz...",
    "proofUrl": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
    "verificationRequired": true
  }
}
```

**Error Response (403):**
```json
{
  "error": "Only the bet creator can upload proof"
}
```

---

### Verify Proof

Vote on whether submitted proof is valid.

**Endpoint:** `POST /bets/:id/verify`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "vote": "ACCEPT"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "vote": {
    "id": "clddd...",
    "betId": "clzzz...",
    "userId": "clbbb...",
    "vote": "ACCEPT"
  },
  "voteCounts": {
    "accept": 2,
    "reject": 0,
    "total": 2,
    "required": 2
  },
  "resolved": true
}
```

**Error Response (400):**
```json
{
  "error": "Only bettors can verify proof"
}
```

---

### Get Verification Votes

Retrieve current vote counts for proof verification.

**Endpoint:** `GET /bets/:id/verify`

**Headers:** `Authorization: Bearer <token>`

**Success Response (200):**
```json
{
  "votes": [
    {
      "id": "clddd...",
      "vote": "ACCEPT",
      "user": {
        "id": "clbbb...",
        "username": "janedoe",
        "avatar": null
      }
    }
  ],
  "counts": {
    "accept": 2,
    "reject": 1,
    "total": 3,
    "required": 2
  },
  "userVote": "ACCEPT"
}
```

---

### Resolve Bet

Manually resolve a bet after deadline (if verification not used).

**Endpoint:** `POST /bets/:id/resolve`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "result": "WON",
  "proofUrl": "https://example.com/proof.jpg"
}
```

**Success Response (200):**
```json
{
  "bet": {
    "id": "clzzz...",
    "status": "COMPLETED",
    "result": "WON"
  },
  "payouts": [
    {
      "userId": "clbbb...",
      "amount": 100,
      "won": true
    }
  ]
}
```

---

## Challenge Endpoints

### Get My Challenges

Retrieve challenges created by the authenticated user with statistics.

**Endpoint:** `GET /challenges/my`

**Headers:** `Authorization: Bearer <token>`

**Success Response (200):**
```json
[
  {
    "id": "clzzz...",
    "title": "Run 5K in under 30 minutes",
    "status": "ACTIVE",
    "category": "FITNESS",
    "deadline": "2025-11-23T18:00:00.000Z",
    "creator": {
      "id": "clxxx...",
      "username": "johndoe"
    },
    "forBets": 5,
    "againstBets": 2,
    "totalBets": 7
  }
]
```

---

### Get Friends' Challenges

Retrieve challenges created by friends.

**Endpoint:** `GET /challenges/friends`

**Headers:** `Authorization: Bearer <token>`

**Success Response (200):**
```json
[
  {
    "id": "cleee...",
    "title": "Learn React in 30 days",
    "status": "ACTIVE",
    "category": "STUDY",
    "deadline": "2025-12-15T18:00:00.000Z",
    "creator": {
      "id": "clbbb...",
      "username": "janedoe"
    },
    "forBets": 3,
    "againstBets": 1,
    "totalBets": 4
  }
]
```

---

## Feed Endpoints

### Get Activity Feed

Retrieve recent bet activities from friends only.

**Endpoint:** `GET /feed`

**Headers:** `Authorization: Bearer <token>`

**Success Response (200):**
```json
[
  {
    "id": "bet-clzzz...",
    "type": "BET_CREATED",
    "betId": "clzzz...",
    "title": "Run 5K in under 30 minutes",
    "description": "janedoe created a new challenge",
    "category": "FITNESS",
    "creator": {
      "id": "clbbb...",
      "username": "janedoe",
      "avatar": null
    },
    "predictionsCount": 0,
    "timestamp": "2025-11-16T10:00:00.000Z"
  },
  {
    "id": "proof-cleee...",
    "type": "PROOF_SUBMITTED",
    "betId": "cleee...",
    "title": "Learn React in 30 days",
    "description": "janedoe completed their challenge",
    "proofUrl": "data:image/png;base64,...",
    "proofRequired": "IMAGE",
    "result": "WON",
    "creator": {
      "id": "clbbb...",
      "username": "janedoe",
      "avatar": null
    },
    "timestamp": "2025-11-16T11:30:00.000Z"
  },
  {
    "id": "complete-clfff...",
    "type": "BET_COMPLETED",
    "betId": "clfff...",
    "title": "Finish project",
    "description": "mikejones completed their challenge",
    "result": "WON",
    "creator": {
      "id": "clggg...",
      "username": "mikejones",
      "avatar": null
    },
    "timestamp": "2025-11-16T09:00:00.000Z"
  }
]
```

---

## Friend Endpoints

### Get Friend List

Retrieve all friends and pending friend requests.

**Endpoint:** `GET /friends`

**Headers:** `Authorization: Bearer <token>`

**Success Response (200):**
```json
{
  "friends": [
    {
      "id": "clbbb...",
      "username": "janedoe",
      "avatar": null,
      "isOnline": true,
      "points": 200
    }
  ],
  "pendingRequests": [
    {
      "id": "clhhh...",
      "userId": "cliii...",
      "user": {
        "id": "cliii...",
        "username": "mikejones",
        "avatar": null
      },
      "status": "PENDING",
      "createdAt": "2025-11-15T10:00:00.000Z"
    }
  ]
}
```

---

### Send Friend Request

Send a friend request to another user.

**Endpoint:** `POST /friends/request`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "username": "mikejones"
}
```

**Success Response (201):**
```json
{
  "id": "clhhh...",
  "userId": "clxxx...",
  "friendId": "cliii...",
  "status": "PENDING",
  "createdAt": "2025-11-16T12:00:00.000Z"
}
```

**Error Response (400):**
```json
{
  "error": "Friend request already sent"
}
```

---

### Accept Friend Request

Accept a pending friend request.

**Endpoint:** `POST /friends/:id/accept`

**Headers:** `Authorization: Bearer <token>`

**Success Response (200):**
```json
{
  "id": "clhhh...",
  "status": "ACCEPTED",
  "friend": {
    "id": "cliii...",
    "username": "mikejones"
  }
}
```

---

### Reject Friend Request

Reject a pending friend request.

**Endpoint:** `POST /friends/:id/reject`

**Headers:** `Authorization: Bearer <token>`

**Success Response (200):**
```json
{
  "message": "Friend request rejected"
}
```

---

## Chat Endpoints

### Get Conversations

Retrieve all conversations for the authenticated user.

**Endpoint:** `GET /chat/conversations`

**Headers:** `Authorization: Bearer <token>`

**Success Response (200):**
```json
[
  {
    "id": "cljjj...",
    "type": "DIRECT",
    "name": null,
    "createdAt": "2025-11-15T10:00:00.000Z",
    "members": [
      {
        "user": {
          "id": "clbbb...",
          "username": "janedoe",
          "avatar": null
        }
      }
    ],
    "messages": [
      {
        "id": "clkkk...",
        "message": "Hey!",
        "createdAt": "2025-11-16T10:00:00.000Z",
        "sender": {
          "username": "janedoe"
        }
      }
    ]
  }
]
```

---

### Create Conversation

Create a new direct or group conversation.

**Endpoint:** `POST /chat/conversations`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "type": "DIRECT",
  "memberIds": ["clbbb..."]
}
```

**Success Response (201):**
```json
{
  "id": "cljjj...",
  "type": "DIRECT",
  "createdAt": "2025-11-16T12:00:00.000Z"
}
```

---

### Get Messages

Retrieve all messages in a conversation.

**Endpoint:** `GET /chat/conversations/:id/messages`

**Headers:** `Authorization: Bearer <token>`

**Success Response (200):**
```json
[
  {
    "id": "clkkk...",
    "message": "Hey! How's the challenge going?",
    "type": "TEXT",
    "createdAt": "2025-11-16T10:00:00.000Z",
    "sender": {
      "id": "clbbb...",
      "username": "janedoe",
      "avatar": null
    }
  }
]
```

---

### Send Message

Send a message in a conversation.

**Endpoint:** `POST /chat/conversations/:id/messages`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "message": "Going great! Thanks for asking!"
}
```

**Success Response (201):**
```json
{
  "id": "clmmm...",
  "message": "Going great! Thanks for asking!",
  "type": "TEXT",
  "createdAt": "2025-11-16T12:00:00.000Z",
  "sender": {
    "id": "clxxx...",
    "username": "johndoe"
  }
}
```

---

### Send Bet Chat Message

Send a message in a bet's chat.

**Endpoint:** `POST /bets/:id/chat`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "message": "Good luck with this one!",
  "type": "TEXT"
}
```

**Success Response (201):**
```json
{
  "id": "clnnn...",
  "message": "Good luck with this one!",
  "type": "TEXT",
  "betId": "clzzz...",
  "createdAt": "2025-11-16T12:00:00.000Z"
}
```

---

## Punishment Endpoints

### Suggest Punishment

Suggest a punishment for a bet.

**Endpoint:** `POST /bets/:id/punishments`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "description": "Do 100 pushups on livestream",
  "type": "CHALLENGE"
}
```

**Success Response (201):**
```json
{
  "id": "clooo...",
  "betId": "clzzz...",
  "description": "Do 100 pushups on livestream",
  "type": "CHALLENGE",
  "votes": 0,
  "assignedBy": {
    "username": "janedoe"
  }
}
```

---

### Vote for Punishment

Vote for a suggested punishment.

**Endpoint:** `POST /punishments/:id/vote`

**Headers:** `Authorization: Bearer <token>`

**Success Response (200):**
```json
{
  "id": "clooo...",
  "votes": 3,
  "description": "Do 100 pushups on livestream"
}
```

---

## Notification Endpoints

### Get Notifications

Retrieve all notifications for the authenticated user.

**Endpoint:** `GET /notifications`

**Headers:** `Authorization: Bearer <token>`

**Success Response (200):**
```json
[
  {
    "id": "clppp...",
    "type": "BET_CREATED",
    "title": "New Challenge",
    "message": "janedoe created a new bet: Run 5K in under 30 minutes",
    "link": "/bets/clzzz...",
    "isRead": false,
    "createdAt": "2025-11-16T10:00:00.000Z"
  }
]
```

---

### Mark Notification as Read

Mark a notification as read.

**Endpoint:** `POST /notifications/:id/read`

**Headers:** `Authorization: Bearer <token>`

**Success Response (200):**
```json
{
  "id": "clppp...",
  "isRead": true
}
```

---

## Error Codes

| Code | Description |
|------|-------------|
| 200  | Success |
| 201  | Created successfully |
| 400  | Bad request / Invalid input |
| 401  | Unauthorized / Invalid token |
| 403  | Forbidden / Insufficient permissions |
| 404  | Resource not found |
| 500  | Internal server error |

---

## Rate Limiting

Currently not implemented. Consider implementing rate limiting in production.

---

## Data Types

### BetCategory
`FITNESS` | `STUDY` | `GAMING` | `SOCIAL` | `WORK` | `FOOD` | `CHALLENGE` | `OTHER`

### BetStatus
`ACTIVE` | `COMPLETED` | `CANCELLED`

### BetResult
`WON` | `LOST`

### ProofType
`NONE` | `IMAGE` | `VIDEO` | `TEXT`

### PredictionChoice
`FOR` | `AGAINST`

### ProofVoteChoice
`ACCEPT` | `REJECT`

### ConversationType
`DIRECT` | `GROUP`

### MessageType
`TEXT` | `PUNISHMENT_SUGGESTION` | `SYSTEM`

### NotificationType
`BET_CREATED` | `BET_RESOLVED` | `PREDICTION_WON` | `PREDICTION_LOST` | `FRIEND_REQUEST` | `PUNISHMENT_ASSIGNED` | `CHAT_MESSAGE` | `SYSTEM`

---

## Notes

- All timestamps are in ISO 8601 format
- File uploads are currently handled as base64 strings (consider using cloud storage in production)
- JWT tokens expire after 7 days
- Points cannot go below 0
- Users start with 100 points
- Deadline must be in the future when creating a bet
