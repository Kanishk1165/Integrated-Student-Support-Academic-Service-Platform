# UniSupport Portal - Backend API

> Integrated Student Support & Academic Service Platform Backend

## 🚀 Quick Start

### Prerequisites
- Node.js (v16+ recommended)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env .env.local
   ```
   Update `.env.local` with your actual configuration values:
   - `MONGO_URI`: Your MongoDB connection string
   - `JWT_SECRET`: A strong secret key for JWT tokens
   - `PORT`: Server port (default: 5000)

4. **Start the server**
   ```bash
   # Development mode with auto-reload
   npm run dev

   # Production mode
   npm start
   ```

## 📁 Project Structure

```
server/
├── config/
│   └── db.js              # Database connection configuration
├── controllers/
│   └── authController.js  # Authentication business logic
├── middleware/
│   ├── auth.js           # JWT authentication middleware
│   ├── errorHandler.js   # Global error handling
│   └── validation.js     # Request validation middleware
├── models/
│   └── User.js           # User data model
├── routes/
│   └── authRoutes.js     # Authentication endpoints
├── .env                  # Environment variables (template)
├── server.js             # Main application entry point
└── package.json          # Project dependencies and scripts
```

## 🛡️ API Endpoints

### Authentication Routes (`/api/auth`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/register` | Register new user | Public |
| POST | `/login` | User login | Public |
| GET | `/me` | Get current user profile | Private |
| PUT | `/profile` | Update user profile | Private |
| PUT | `/change-password` | Change password | Private |
| POST | `/logout` | User logout | Private |

### Example Usage

**Register User**
```bash
POST /api/auth/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@university.edu",
  "password": "SecurePass123",
  "role": "student",
  "studentId": "STU001234"
}
```

**Login**
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "john.doe@university.edu",
  "password": "SecurePass123"
}
```

**Get Profile (Protected)**
```bash
GET /api/auth/me
Authorization: Bearer <JWT_TOKEN>
```

## 🔧 Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `PORT` | Server port | 5000 | No |
| `NODE_ENV` | Environment mode | development | No |
| `MONGO_URI` | MongoDB connection string | - | Yes |
| `JWT_SECRET` | JWT secret key | - | Yes |
| `JWT_EXPIRE` | JWT expiration time | 30d | No |
| `CLIENT_URL` | Frontend URL for CORS | http://localhost:3000 | No |

## 🏗️ Architecture

### Clean MVC Pattern
- **Models**: Data layer with Mongoose schemas
- **Controllers**: Business logic and request handling
- **Routes**: API endpoint definitions
- **Middleware**: Cross-cutting concerns (auth, validation, errors)

### Security Features
- JWT-based authentication
- Password hashing with bcrypt
- Input validation and sanitization
- CORS protection
- Error handling without sensitive data exposure

### Database Design
- MongoDB with Mongoose ODM
- Proper indexing for performance
- Schema validation and middleware

## 🚦 API Response Format

**Success Response**
```json
{
  "success": true,
  "data": {...},
  "message": "Operation successful"
}
```

**Error Response**
```json
{
  "success": false,
  "error": "Error message",
  "stack": "..." // Only in development
}
```

## 🔨 Development

### Available Scripts
- `npm start` - Start production server
- `npm run dev` - Start development server with auto-reload
- `npm test` - Run tests (to be implemented)

### Code Style
- ES6+ JavaScript
- Async/await for asynchronous operations
- Consistent error handling
- Comprehensive comments and documentation

## 🧪 Testing

*Testing setup and examples will be added as the project grows*

## 📦 Dependencies

### Production
- `express` - Web framework
- `mongoose` - MongoDB ODM
- `bcryptjs` - Password hashing
- `jsonwebtoken` - JWT authentication
- `cors` - Cross-origin resource sharing
- `dotenv` - Environment variables

### Development
- `nodemon` - Development auto-reload

## 🚀 Deployment

### Environment-specific configurations
- Development: Auto-reload, detailed errors, CORS enabled
- Production: Optimized for performance and security

### Deployment Checklist
- [ ] Set strong JWT_SECRET
- [ ] Configure production MongoDB URI
- [ ] Set NODE_ENV=production
- [ ] Enable SSL/HTTPS
- [ ] Set up monitoring and logging
- [ ] Configure rate limiting
- [ ] Set up backup strategies

## 🤝 Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License.

## 📞 Support

For support and questions, please contact the UniSupport development team.

---

**UniSupport Portal** - Empowering students with integrated support services 🎓
