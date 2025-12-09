# ChatterBox - Real-Time Messaging Platform

A modern, full-stack real-time chat application built with React, Express, and MongoDB. ChatterBox enables users to communicate instantly with online status tracking, image sharing, and theme customization.

## 🚀 Key Features

- **Real-Time Messaging**: Instant message delivery using Socket.io
- **User Authentication**: Secure JWT-based authentication with password hashing
- **Online Status**: Live user presence tracking across the platform
- **Image Sharing**: Send images directly in conversations via Cloudinary
- **Profile Management**: Upload and manage user profiles with custom avatars
- **Theme Customization**: Multiple dark themes with customizable colors
- **Responsive Design**: Mobile-friendly interface with responsive layouts
- **Error Handling**: Comprehensive error handling on both client and server

## 🏗️ Architecture

### Backend Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT + bcryptjs
- **Real-Time Communication**: Socket.io
- **File Storage**: Cloudinary API

### Frontend Stack

- **Framework**: React 18 with Vite
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Styling**: Tailwind CSS + DaisyUI
- **Icons**: Lucide React
- **Notifications**: React Hot Toast

## 📋 Project Structure

```bash
fullstack-chat-app/
├── backend/
│   ├── src/
│   │   ├── apiControllers/      # Request handlers
│   │   ├── apiRoutes/           # Route definitions
│   │   ├── dataModels/          # MongoDB schemas
│   │   ├── middleware/          # Auth middleware
│   │   ├── core/                # Core utilities & Socket.io
│   │   └── index.js             # Server entry point
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── pages/               # Page components
│   │   ├── components/          # Reusable UI components
│   │   ├── store/               # Zustand state stores
│   │   ├── lib/                 # Utilities & axios config
│   │   ├── constants/           # App constants
│   │   └── App.jsx              # Root component
│   └── package.json
│
└── README.md
```

## 🔧 Installation & Setup

### Prerequisites

- Node.js (v16+)
- MongoDB URI
- Cloudinary account credentials

### Backend Setup

1. Navigate to backend directory:

```bash
cd backend
npm install
```

1. Create `.env` file:

```env
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
PORT=9001
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

1. Start development server:

```bash
npm run dev
```

### Frontend Setup

1. Navigate to frontend directory:

```bash
cd frontend
npm install
```

1. Start development server:

```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

## 🔌 API Endpoints

### Authentication

- `POST /api/auth/signup` - Create new user account
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/check` - Verify authentication status
- `PUT /api/auth/update-profile` - Update user profile

### Messaging

- `GET /api/messages/users` - Get all users for sidebar
- `GET /api/messages/:id` - Fetch chat history with a user
- `POST /api/messages/send/:id` - Send message to user

## 🔐 Security Features

- JWT token stored in httpOnly cookies
- Password hashing with bcryptjs (10 salt rounds)
- CORS protection with credentials
- Input validation on all endpoints
- User authorization checks on protected routes

## 🎨 UI/UX Enhancements

- Smooth animations and transitions
- Loading skeletons for better perceived performance
- Toast notifications for user feedback
- Responsive mobile-first design
- Dark/Light theme support

## 🚀 Production Build

Build frontend for production:

```bash
cd frontend
npm run build
```

The built files are automatically served by the Express backend in production mode.

## 📦 Dependencies

### Backend

- express, socket.io, mongoose, jwt, bcryptjs, cloudinary, dotenv

### Frontend

- react, react-router-dom, zustand, axios, socket.io-client, tailwindcss, lucide-react

## 🐛 Error Handling

- Server-side validation on all inputs
- Comprehensive error logging
- Graceful error responses with meaningful messages
- Client-side error boundaries and toast notifications

## 📝 Notes for Final Year Project

This project demonstrates:

- Full-stack web development practices
- Real-time communication implementation
- RESTful API design principles
- Modern React patterns and state management
- Database design and optimization
- Authentication and authorization
- Cloud integration (Cloudinary)

## 📄 License

MIT License - Feel free to use this project for your learning and development purposes.
