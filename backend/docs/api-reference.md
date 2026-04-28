# API Reference

## Base URL

```
http://localhost:3000/api
```

## Authentication

Все protected endpoints требуют JWT токен в заголовке:

```
Authorization: Bearer <access_token>
```

## Endpoints

### Auth

#### Register
```http
POST /auth/register
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "username": "johndoe",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "johndoe",
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

#### Login
```http
POST /auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "user": { ... }
}
```

#### Refresh Token
```http
POST /auth/refresh
Authorization: Bearer <access_token>
```

### Users

#### Get All Users
```http
GET /users
Authorization: Bearer <token>
```

#### Get User by ID
```http
GET /users/:id
Authorization: Bearer <token>
```

#### Update Profile
```http
PATCH /users/me
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Updated",
  "bio": "My bio",
  "status": "online"
}
```

#### Upload Avatar
```http
POST /users/me/avatar
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: <image_file>
```

### Friends

#### Search Users
```http
GET /friends/search?q=john
Authorization: Bearer <token>
```

#### Send Friend Request
```http
POST /friends/requests/:userId
Authorization: Bearer <token>
```

#### Accept Friend Request
```http
PATCH /friends/requests/:requestId/accept
Authorization: Bearer <token>
```

#### Get Friends List
```http
GET /friends
Authorization: Bearer <token>
```

### Chats

#### Create Chat
```http
POST /chats
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "Group Chat",
  "type": "group",
  "memberIds": ["uuid1", "uuid2"]
}
```

#### Get User Chats
```http
GET /chats
Authorization: Bearer <token>
```

#### Add Member to Chat
```http
POST /chats/:chatId/members/:memberId
Authorization: Bearer <token>
```

### Messages

#### Send Message
```http
POST /messages
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "type": "text",
  "content": "Hello!",
  "chatId": "uuid"
}
```

#### Get Chat Messages
```http
GET /messages/chat/:chatId?limit=50&offset=0
Authorization: Bearer <token>
```

#### Mark as Read
```http
PATCH /messages/:id/read
Authorization: Bearer <token>
```

### Settings

#### Get Privacy Settings
```http
GET /settings
Authorization: Bearer <token>
```

#### Update Privacy Settings
```http
PATCH /settings
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "whoCanMessageMe": "friends",
  "allowFriendRequests": true,
  "showOnlineStatus": true,
  "showReadReceipts": true
}
```

## WebSocket

### Connection

```javascript
const socket = io('http://localhost:3000/chat', {
  auth: {
    userId: 'user-uuid'
  }
});
```

### Events

#### Client → Server

**Join Chat:**
```javascript
socket.emit('join-chat', { chatId: 'uuid' });
```

**Send Message:**
```javascript
socket.emit('send-message', {
  type: 'text',
  content: 'Hello!',
  chatId: 'uuid',
  senderId: 'user-uuid'
});
```

**Typing Indicator:**
```javascript
socket.emit('typing-start', { chatId: 'uuid' });
socket.emit('typing-stop', { chatId: 'uuid' });
```

#### Server → Client

**New Message:**
```javascript
socket.on('new-message', (message) => {
  console.log('New message:', message);
});
```

**User Online/Offline:**
```javascript
socket.on('user-online', ({ userId }) => {
  console.log('User online:', userId);
});

socket.on('user-offline', ({ userId }) => {
  console.log('User offline:', userId);
});
```

**User Typing:**
```javascript
socket.on('user-typing', ({ userId, chatId }) => {
  console.log('User typing:', userId);
});
```

## Error Responses

```json
{
  "statusCode": 400,
  "message": "Bad Request",
  "error": "Bad Request"
}
```

### Common Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error






