# ChatHub Development Guide

## Quick Start

### Prerequisites
- Node.js v16 or higher
- MongoDB instance (local or cloud)
- npm or yarn package manager

### Environment Setup

<!-- Backend Setup:- -->
cd backend
npm install

<!-- Create .env file with: -->
MONGO_URI=mongodb://your_connection_string
JWT_SECRET=your_secret_key_here
PORT=9001
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_secret

npm run dev
```

<!-- Frontend Setup:- -->
cd frontend
npm install

npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:9001

---

## Project Structure Overview

### Server Architecture

**Controllers** (`controllers/`)
- `auth.controller.js`: User authentication logic
- `message.controller.js`: Message and user retrieval

**Routes** (`routes/`)
- `auth.route.js`: Authentication endpoints
- `message.route.js`: Messaging endpoints

**Models** (`models/`)
- `user.model.js`: User schema definition
- `message.model.js`: Message schema definition

**Core Features** (`core/`)
- `socket.js`: Real-time Socket.io configuration
- `db.js`: MongoDB connection setup
- `utils.js`: JWT token generation
- `cloudinary.js`: Image storage configuration

**Middleware** (`middleware/`)
- `auth.middleware.js`: JWT verification and user authentication

### Client Architecture

**Pages** (`pages/`)
- `HomePage.jsx`: Main chat interface
- `LoginPage.jsx`: User authentication
- `SignUpPage.jsx`: Account creation
- `ProfilePage.jsx`: User profile management
- `SettingsPage.jsx`: Theme and preferences

**Components** (`components/`)
- `Sidebar.jsx`: User contacts list
- `ChatContainer.jsx`: Message display area
- `ChatHeader.jsx`: Active chat header
- `MessageInput.jsx`: Message composition
- `Navbar.jsx`: Top navigation
- `NoChatSelected.jsx`: Empty state

**State Management** (`store/`)
- `useAuthStore.js`: Authentication and Socket.io management
- `useChatStore.js`: Chat state and messaging
- `useThemeStore.js`: Theme preferences

**Utilities** (`lib/`)
- `axios.js`: HTTP client configuration
- `utils.js`: Helper functions

---

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create account
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/check` - Verify session
- `PUT /api/auth/update-profile` - Update profile picture

### Messaging
- `GET /api/messages/users` - Get all users
- `GET /api/messages/:userId` - Get chat history
- `POST /api/messages/send/:userId` - Send message

---

## Key Features Implementation

### Real-Time Messaging
- Socket.io bidirectional communication
- Message delivery notifications
- Typing indicators ready for expansion
- User presence tracking

### Authentication & Security
- JWT-based token authentication
- Password hashing with bcryptjs
- Secure cookie storage
- Protected route middleware
- CORS protection

### Profile Management
- Avatar upload via Cloudinary
- User profile customization
- Online/offline status display
- Account information display

### Theme System
- 32+ DaisyUI themes
- Local storage persistence
- Real-time theme switching
- Custom theme variables

---

## Development Workflow

### Adding New Features

#### Backend Feature
1. Create model in `Models/`
2. Add controller in `Controllers/`
3. Create route in `Routes/`
4. Import and use route in `index.js`

#### Frontend Feature
1. Create component in `components/` or `pages/`
2. Add state to appropriate store in `store/`
3. Implement UI with Tailwind CSS
4. Integrate with API via axios

### Testing Guidelines

**Manual Testing Checklist**:
- [ ] User registration with valid data
- [ ] User registration with invalid data
- [ ] User login/logout flow
- [ ] Profile picture upload
- [ ] Real-time message delivery
- [ ] Online status updates
- [ ] Theme switching
- [ ] Error handling and notifications
- [ ] Mobile responsiveness

---

## Debugging

### Enable Backend Debugging
```javascript
// In index.js or any controller
console.error("Debug info:", variableName);
```

### Enable Frontend Debugging
```javascript
// In any React component
console.error("Debug info:", variableName);
```

### Common Issues

**Port Already in Use**
```bash
# Find and kill process on port 9001
# Windows: netstat -ano | findstr :9001
# Mac/Linux: lsof -i :9001
```

**MongoDB Connection Failed**
- Verify MONGO_URI is correct
- Check network access for cloud MongoDB
- Ensure local MongoDB is running

**Socket.io Connection Failed**
- Verify CORS origin is correct
- Check backend is running on port 9001
- Verify Socket.io middleware is initialized

---

## Performance Optimization

- Message pagination for large chat histories
- Image optimization before upload
- Socket.io connection reuse
- React component memoization ready for optimization
- Database query optimization with indexes

---

## Future Enhancement Ideas

1. Message search functionality
2. Group chats
3. Message reactions/emojis
4. Typing indicators
5. Message read receipts
6. User blocking
7. Message deletion/editing
8. Voice/video calls
9. File sharing beyond images
10. Message encryption

---

## Deployment

### Production Checklist

- [ ] Environment variables configured
- [ ] JWT_SECRET is strong and random
- [ ] MongoDB connection is secure
- [ ] Cloudinary credentials are valid
- [ ] CORS_ORIGIN is set to production domain
- [ ] NODE_ENV is set to "production"
- [ ] Build frontend: `npm run build`
- [ ] Backend serves static frontend files

### Hosting Options

**Backend**: Heroku, Railway, Render, AWS EC2
**Frontend**: Vercel, Netlify, AWS S3 + CloudFront
**Database**: MongoDB Atlas, AWS DocumentDB
**Storage**: Cloudinary (included in setup)

---

## Support & Documentation

For more information on technologies used:
- Express.js: https://expressjs.com/
- React: https://react.dev/
- Socket.io: https://socket.io/
- MongoDB: https://www.mongodb.com/
- Tailwind CSS: https://tailwindcss.com/
- Zustand: https://github.com/pmndrs/zustand
