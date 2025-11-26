# 📚 Smart Assignment System

![CI/CD Pipeline](https://github.com/bhola-dev58/smart-assignment-system/actions/workflows/ci-cd.yml/badge.svg)
![Deployment](https://github.com/bhola-dev58/smart-assignment-system/actions/workflows/deploy.yml/badge.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![React](https://img.shields.io/badge/react-19.2.0-61dafb.svg)

A modern, full-stack web application for managing assignments between teachers and students. Built with React, Node.js, Express, and MongoDB.

## ✨ Features

### For Teachers 👨‍🏫
- Create and publish assignments with deadlines
- View all student submissions for each assignment
- Grade submissions with scores (0-100) and feedback
- Track submission status in real-time
- Modern, intuitive dashboard with tab navigation

### For Students 🎓
- View all available assignments
- Submit assignments with file uploads
- Track submission history
- View grades and teacher feedback
- Beautiful, responsive UI with smooth interactions

## 🛠️ Tech Stack

### Frontend
- **React 19** - Modern UI library
- **React Router DOM** - Client-side routing
- **Axios** - HTTP client
- **Tailwind CSS** - Utility-first CSS framework
- **Vite** - Lightning-fast build tool

### Backend
- **Node.js** - Runtime environment
- **Express 5** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **JWT** - Authentication
- **Bcrypt.js** - Password hashing
- **Multer** - File upload handling

## 📁 Project Structure

```
smart-assignment-system/
├── backend/
│   ├── config/
│   │   └── db.js              # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js   # Authentication logic
│   │   └── assignmentController.js  # Assignment operations
│   ├── middleware/
│   │   ├── authMiddleware.js   # JWT verification
│   │   └── uploadMiddleware.js # File upload config
│   ├── models/
│   │   ├── User.js            # User schema
│   │   ├── Assignment.js      # Assignment schema
│   │   └── Submission.js      # Submission schema
│   ├── routes/
│   │   ├── authRoutes.js      # Auth endpoints
│   │   └── assignmentRoutes.js # Assignment endpoints
│   ├── uploads/               # Uploaded files storage
│   ├── .env                   # Environment variables
│   ├── package.json
│   └── server.js              # Entry point
│
└── frontend/
    ├── public/
    ├── src/
    │   ├── assets/
    │   ├── components/
    │   │   └── ProtectedRoute.jsx  # Route guard
    │   ├── pages/
    │   │   ├── Login.jsx          # Login page
    │   │   ├── Register.jsx       # Registration page
    │   │   └── Dashboard.jsx      # Main dashboard
    │   ├── api.js                 # Axios configuration
    │   ├── App.jsx                # Main app component
    │   ├── main.jsx               # Entry point
    │   └── index.css              # Global styles
    ├── index.html
    ├── package.json
    ├── tailwind.config.js
    └── vite.config.js
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables in `.env`:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_key_change_this
```

4. Start the backend server:
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

Backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

Frontend will run on `http://localhost:5173`

## 📝 API Endpoints

### Authentication Routes (`/api/auth`)
- `POST /register` - Register new user (student/teacher)
- `POST /login` - Login user
- `GET /me` - Get current user info (protected)

### Assignment Routes (`/api/assignments`)
- `GET /` - Get all assignments (protected)
- `POST /` - Create assignment (teacher only)
- `POST /upload` - Upload file (protected)
- `POST /submit` - Submit assignment (student only)
- `POST /grade` - Grade submission (teacher only)
- `GET /my-submissions` - Get student's submissions (student only)
- `GET /:assignmentId/submissions` - Get assignment submissions (teacher only)

## 🎨 UI/UX Features

- **Modern Gradient Design** - Beautiful blue-to-indigo gradients
- **Responsive Layout** - Works perfectly on mobile, tablet, and desktop
- **Smooth Animations** - Hover effects and transitions
- **Intuitive Icons** - Emoji-based icons for better visual communication
- **Tab Navigation** - Easy switching between assignments and submissions
- **Real-time Feedback** - Success/error alerts with emojis
- **Loading States** - Visual feedback during operations
- **Protected Routes** - Automatic redirect to login if not authenticated
- **Role-based UI** - Different views for teachers and students

## 🔐 Security Features

- JWT token-based authentication
- Password hashing with bcrypt
- Protected API routes with middleware
- Token expiration (24 hours)
- Automatic token refresh handling
- Input validation
- File type validation for uploads

## 📊 Database Schema

### User Model
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String (student/teacher),
  createdAt: Date
}
```

### Assignment Model
```javascript
{
  title: String,
  description: String,
  deadline: Date,
  teacher: ObjectId (ref: User),
  createdAt: Date
}
```

### Submission Model
```javascript
{
  assignment: ObjectId (ref: Assignment),
  student: ObjectId (ref: User),
  fileUrl: String,
  note: String,
  grade: Number (0-100, default: null),
  feedback: String,
  submittedAt: Date
}
```

## 🎯 Usage Guide

### For Teachers:
1. Register as a teacher
2. Login to access dashboard
3. Create assignments with title, description, and deadline
4. View submissions by clicking "View Submissions" on any assignment
5. Grade submissions with scores and feedback
6. Track all student progress

### For Students:
1. Register as a student
2. Login to access dashboard
3. View available assignments
4. Upload and submit your work
5. Check "Submissions" tab to see grades and feedback

## 🔧 Configuration

### Frontend Configuration
The API base URL is configured in `frontend/src/api.js`:
```javascript
baseURL: 'http://localhost:5000/api'
```

### Backend Configuration
CORS is enabled for all origins in development. For production, update `server.js`:
```javascript
app.use(cors({
  origin: 'your-frontend-domain.com'
}));
```

## 📦 Build for Production

### Frontend:
```bash
cd frontend
npm run build
```
Builds the app for production to the `dist` folder.

### Backend:
Ensure all environment variables are properly set in production environment.

## 🐛 Troubleshooting

**MongoDB Connection Issues:**
- Verify your MONGO_URI is correct
- Check if MongoDB service is running
- Ensure IP whitelist in MongoDB Atlas

**File Upload Issues:**
- Check if `uploads/` directory exists
- Verify file size limits in uploadMiddleware.js
- Ensure proper file permissions

**Authentication Issues:**
- Verify JWT_SECRET is set in .env
- Check if token is expired
- Clear localStorage and login again

## 📝 License

This project is open source and available under the MIT License.

## 👥 Contributing

Contributions, issues, and feature requests are welcome!

## 📧 Contact

For questions or support, please open an issue in the repository.

---

