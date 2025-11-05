[![Open in Visual Studio Code](https://classroom.github.com/assets/open-in-vscode-2e0aaae1b6195c2367325f4f02e2d04e9abb55f0b24a779b69b11b9e10269abc.svg)](https://classroom.github.com/online_ide?assignment_repo_id=21437559&assignment_repo_type=AssignmentRepo)

# 📰 News Aggregator API

A robust RESTful API built with **Node.js**, **Express**, **TypeScript**, and **MongoDB** that provides personalized news recommendations using the **GNews API**. Features include JWT authentication, user preference management, intelligent caching, and personalized news delivery.

---

## 🚀 Features

- ✅ **JWT Authentication** - Secure user registration and login with bcrypt password hashing
- ✅ **User Preferences** - Save and manage topics, language, country, and news sources
- ✅ **Personalized News** - Get news articles based on your saved preferences
- ✅ **Trending Headlines** - Fetch global trending news
- ✅ **Intelligent Caching** - 30-minute cache with node-cache to reduce API calls
- ✅ **Rate Limit Protection** - Fallback to cached data when API limits are reached
- ✅ **TypeScript** - Full type safety and modern JavaScript features
- ✅ **MongoDB Integration** - Efficient data storage with Mongoose ODM

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **Node.js** | Runtime environment |
| **Express.js** | Web framework |
| **TypeScript** | Type-safe JavaScript |
| **MongoDB** | NoSQL database |
| **Mongoose** | MongoDB ODM |
| **JWT** | Authentication tokens |
| **bcrypt** | Password hashing |
| **Axios** | HTTP client for API calls |
| **node-cache** | In-memory caching |
| **GNews API** | News aggregation service |

---

## 📁 Project Structure

```
src/
├── app.ts                          # Application entry point
├── config/
│   └── db.ts                       # MongoDB configuration
├── controllers/
│   ├── authController.ts           # Authentication logic
│   ├── preferenceController.ts     # User preferences management
│   └── newsController.ts           # News fetching logic
├── middlewares/
│   └── authMiddleware.ts           # JWT authentication middleware
├── models/
│   ├── User.ts                     # User schema with password hashing
│   └── UserPreference.ts           # User preferences schema
├── routes/
│   ├── authRoutes.ts              # Authentication endpoints
│   ├── preferenceRoutes.ts        # Preference endpoints
│   └── newsRoutes.ts              # News endpoints
├── utils/
│   ├── jwt.ts                     # JWT token utilities
│   ├── cache.ts                   # Cache configuration
│   └── gnewsClient.ts             # GNews API integration
└── types/
    └── express/
        └── index.d.ts             # TypeScript type definitions
```

---

## 📡 API Endpoints

### Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/auth/signup` | ❌ | Register a new user |
| `POST` | `/api/auth/login` | ❌ | Login and receive JWT token |
| `GET` | `/api/auth/me` | ✅ | Get current user profile |

### Preferences

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/preferences` | ✅ | Save or update user preferences |
| `GET` | `/api/preferences` | ✅ | Get current user preferences |

### News

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/news` | ✅ | Get personalized news based on preferences |
| `GET` | `/api/news/trending` | ✅ | Get trending/top headlines |

---

## ⚙️ Installation & Setup

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- GNews API key ([Get one here](https://gnews.io/register))

### 1. Clone the Repository

```bash
git clone <repository-url>
cd news-aggregator-api-labeebshareef
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create/update `.env` file in the root directory:

```env
PORT=5000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/newsdb
JWT_SECRET=your_super_secret_key_change_this
JWT_EXPIRES_IN=1d
GNEWS_API_KEY=your_gnews_api_key_here
```

### 4. Run the Application

**Development Mode:**
```bash
npm run dev
```

**Production Mode:**
```bash
npm run build
npm start
```

The server will start on `http://localhost:5000`

---

## 🧪 Testing the API

### Example Flow

#### 1. Register a User
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

#### 2. Login (Get JWT Token)
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

**Save the token from the response!**

#### 3. Set Preferences
```bash
curl -X POST http://localhost:5000/api/preferences \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"topics":["technology","sports"],"language":"en","country":"us"}'
```

#### 4. Get Personalized News
```bash
curl -X GET http://localhost:5000/api/news \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### 5. Get Trending News
```bash
curl -X GET "http://localhost:5000/api/news/trending?lang=en&max=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

For more detailed testing instructions, see [TESTING_GUIDE.md](TESTING_GUIDE.md)

---

## 📖 API Documentation

For comprehensive API documentation with request/response examples, see [API_GUIDE.md](API_GUIDE.md)

---

## 🔐 Security Features

- **Password Hashing**: Bcrypt with salt rounds for secure password storage
- **JWT Authentication**: Stateless authentication with configurable expiration
- **Protected Routes**: Middleware-based route protection
- **User Isolation**: Each user can only access their own data
- **Environment Variables**: Sensitive credentials stored securely

---

## 🎯 Key Implementation Highlights

### Caching Strategy
- **30-minute TTL** on all news requests
- Separate cache keys for personalized vs. trending news
- Automatic fallback to cache when rate limits are hit
- Reduces GNews API calls by ~90%

### Error Handling
- Missing preferences detection
- JWT expiration and validation
- GNews API rate limit management
- Graceful error responses with proper HTTP status codes

### User Preferences
- Support for multiple topics (OR query logic)
- Language and country filtering
- Optional news source filtering
- Persistent storage in MongoDB

---

## 📊 Available News Topics

Popular topics for preferences:
- `technology`, `ai`, `cryptocurrency`
- `sports`, `football`, `basketball`
- `business`, `finance`, `economy`
- `entertainment`, `movies`, `music`
- `health`, `science`, `politics`
- `world`, `climate`, `space`

---

## 🌍 Supported Languages & Countries

**Languages:** `en`, `es`, `fr`, `de`, `it`, `pt`, `ja`, `ko`, `zh`, and more

**Countries:** `us`, `gb`, `ca`, `au`, `in`, `de`, `fr`, `jp`, and more

---

## 📝 Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `MONGO_URI` | MongoDB connection string | `mongodb+srv://...` |
| `JWT_SECRET` | Secret key for JWT signing | `your_secret_key` |
| `JWT_EXPIRES_IN` | JWT token expiration time | `1d`, `7d`, `24h` |
| `GNEWS_API_KEY` | GNews API key | `your_api_key` |

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📄 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

**Labeeb Shareef**

---

## 🙏 Acknowledgments

- [GNews API](https://gnews.io) for news aggregation
- [MongoDB](https://www.mongodb.com) for database services
- [Express.js](https://expressjs.com) for the web framework

---

**Happy Coding! 🚀**
