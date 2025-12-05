# Mental Math App - Backend API

Backend server for the Mental Math application with user authentication and statistics tracking.

## Features

- ✅ User registration and authentication (JWT)
- ✅ Password hashing with bcrypt
- ✅ User statistics tracking
- ✅ Session history
- ✅ Difficulty-based statistics
- ✅ RESTful API endpoints

## Tech Stack

- **Node.js** - Runtime environment
- **Express** - Web framework
- **MongoDB** - Database (with Mongoose ODM)
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Environment Configuration

Create a `.env` file in the `backend` directory:

```env
PORT=5000
NODE_ENV=development

# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/mental-math-app

# JWT Secret (use a strong random string in production)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
```

### 3. MongoDB Setup

#### Option A: Local MongoDB

1. Install MongoDB on your machine
2. Start MongoDB service
3. Use connection string: `mongodb://localhost:27017/mental-math-app`

#### Option B: MongoDB Atlas (Cloud - Recommended)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a cluster
4. Get your connection string
5. Update `MONGODB_URI` in `.env`:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/mental-math-app
   ```

### 4. Run the Server

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

Server will run on `http://localhost:5000`

## API Endpoints

### Authentication

#### Register User
```
POST /api/auth/register
Body: {
  name: string,
  email: string,
  password: string (min 6 characters)
}
Response: {
  token: string,
  user: { id, name, email }
}
```

#### Login
```
POST /api/auth/login
Body: {
  email: string,
  password: string
}
Response: {
  token: string,
  user: { id, name, email }
}
```

#### Get Current User
```
GET /api/auth/me
Headers: Authorization: Bearer <token>
Response: {
  _id, name, email, createdAt
}
```

### Statistics

#### Get User Statistics
```
GET /api/stats
Headers: Authorization: Bearer <token>
Response: {
  totalProblems: number,
  correctAnswers: number,
  accuracy: number,
  currentStreak: number,
  longestStreak: number,
  averageTime: number,
  difficultyStats: {...},
  lastPlayedDate: date
}
```

#### Save Practice Session
```
POST /api/stats/session
Headers: Authorization: Bearer <token>
Body: {
  score: number,
  timeLimit: number,
  difficulty: string,
  operations: string[],
  timeElapsed: number,
  totalProblems: number
}
Response: {
  message: string,
  stats: {...}
}
```

#### Reset Statistics
```
PUT /api/stats/reset
Headers: Authorization: Bearer <token>
Response: {
  message: string
}
```

### Health Check

```
GET /api/health
Response: {
  status: "OK",
  message: "Server is running"
}
```

## Database Models

### User
- `name`: String (required)
- `email`: String (required, unique)
- `password`: String (required, hashed)
- `createdAt`: Date

### Stats
- `user`: ObjectId (reference to User)
- `totalProblems`: Number
- `correctAnswers`: Number
- `totalTime`: Number
- `averageTime`: Number
- `currentStreak`: Number
- `longestStreak`: Number
- `lastPlayedDate`: Date
- `sessions`: Array of session objects
- `difficultyStats`: Object with easy/medium/hard/custom stats

## Security Features

- Passwords are hashed using bcrypt before storage
- JWT tokens for authentication
- CORS enabled for frontend communication
- Input validation using express-validator
- Protected routes require authentication

## Development

The backend uses ES6 modules. Make sure your Node.js version supports ES modules (Node 14+).

For development with auto-reload:
```bash
npm run dev
```

## Production Deployment

1. Set `NODE_ENV=production`
2. Use a strong `JWT_SECRET`
3. Update `MONGODB_URI` to production database
4. Update `FRONTEND_URL` to production frontend URL
5. Consider using environment variable management (e.g., dotenv, AWS Secrets Manager)

## Troubleshooting

### MongoDB Connection Issues
- Check if MongoDB is running (if local)
- Verify connection string in `.env`
- Check network/firewall settings for Atlas

### JWT Errors
- Ensure `JWT_SECRET` is set in `.env`
- Check token expiration settings
- Verify token is sent in Authorization header

### CORS Issues
- Update `FRONTEND_URL` in `.env` to match your frontend URL
- Check browser console for CORS errors
