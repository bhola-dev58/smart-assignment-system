# 🧪 Testing Guide - Smart Assignment System

## Quick Start Testing

### 1. Setup & Start Servers

```powershell
# Option 1: Use the automated start script
.\start.ps1

# Option 2: Manual start
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

### 2. Access the Application
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000

## 📋 Test Scenarios

### Scenario 1: Teacher Registration & Assignment Creation

1. **Register as Teacher**
   - Go to http://localhost:5173
   - Click "Register here"
   - Fill in:
     - Name: John Teacher
     - Email: teacher@example.com
     - Password: teacher123
     - Select: 👨‍🏫 Teacher
   - Click "Create Account"
   - ✅ Should redirect to dashboard

2. **Create Assignment**
   - In dashboard, see "Create New Assignment" form
   - Fill in:
     - Title: "Mathematics Assignment 1"
     - Description: "Complete exercises 1-10 from Chapter 5"
     - Deadline: Select tomorrow's date
   - Click "Publish Assignment"
   - ✅ Assignment should appear in "All Assignments" section

3. **Create More Assignments** (Optional)
   - Create 2-3 more assignments with different deadlines
   - ✅ All should appear in the list

### Scenario 2: Student Registration & Submission

1. **Logout & Register as Student**
   - Click "Logout"
   - Click "Register here"
   - Fill in:
     - Name: Jane Student
     - Email: student@example.com
     - Password: student123
     - Select: 🎓 Student
   - Click "Create Account"
   - ✅ Should redirect to dashboard

2. **View Assignments**
   - See "Available Assignments" section
   - ✅ All teacher-created assignments should be visible

3. **Submit Assignment**
   - Select any assignment
   - Click "Choose File" and select a PDF/image
   - Click "Submit Assignment"
   - ✅ Should show success message
   - Go to "Submissions" tab
   - ✅ Submitted assignment should appear with "Awaiting Grade"

4. **Submit More Assignments** (Optional)
   - Submit to 2-3 different assignments
   - ✅ All should appear in Submissions tab

### Scenario 3: Teacher Grading

1. **Login as Teacher**
   - Logout from student account
   - Login with teacher@example.com / teacher123
   - ✅ Should see teacher dashboard

2. **View Submissions**
   - Click on any assignment card
   - Click "View Submissions"
   - ✅ Should switch to Submissions tab
   - ✅ Should see student submissions with student name and file

3. **Grade a Submission**
   - In a submission card:
     - Enter grade: 85
     - Enter feedback: "Good work! Keep it up."
   - Click "Submit Grade"
   - ✅ Should show success message
   - ✅ Grade should be saved and displayed

4. **View Graded Status**
   - ✅ Submission should show "Current Grade: 85/100"

### Scenario 4: Student Views Grade

1. **Login as Student**
   - Logout from teacher account
   - Login with student@example.com / student123

2. **Check Submissions**
   - Go to "Submissions" tab
   - ✅ Previously graded assignment should show:
     - Grade: 85/100
     - Feedback: "Good work! Keep it up."

### Scenario 5: Multiple Users Test

1. **Create Multiple Accounts**
   - Student 1: student1@example.com
   - Student 2: student2@example.com
   - Teacher 2: teacher2@example.com

2. **Test Isolation**
   - ✅ Each teacher only sees their own assignments
   - ✅ Students see all assignments from all teachers
   - ✅ Teachers only see submissions for their assignments
   - ✅ Students only see their own submissions

## 🔍 API Testing with Browser/Postman

### Authentication Endpoints

#### Register User
```
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "name": "Test User",
  "email": "test@example.com",
  "password": "test123",
  "role": "student"
}
```

#### Login
```
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "test123"
}
```

#### Get Current User
```
GET http://localhost:5000/api/auth/me
x-auth-token: <your_token_from_login>
```

### Assignment Endpoints

#### Get All Assignments
```
GET http://localhost:5000/api/assignments
x-auth-token: <your_token>
```

#### Create Assignment (Teacher Only)
```
POST http://localhost:5000/api/assignments
x-auth-token: <teacher_token>
Content-Type: application/json

{
  "title": "Test Assignment",
  "description": "This is a test",
  "deadline": "2024-12-31"
}
```

#### Get My Submissions (Student)
```
GET http://localhost:5000/api/assignments/my-submissions
x-auth-token: <student_token>
```

#### Get Assignment Submissions (Teacher)
```
GET http://localhost:5000/api/assignments/{assignmentId}/submissions
x-auth-token: <teacher_token>
```

## ✅ Checklist

### Frontend Tests
- [ ] Login page loads correctly
- [ ] Register page loads correctly
- [ ] Registration works for both teacher and student
- [ ] Login works and redirects to dashboard
- [ ] Logout clears session and redirects to login
- [ ] Protected routes redirect to login when not authenticated
- [ ] Teacher can create assignments
- [ ] Student can view all assignments
- [ ] Student can upload and submit files
- [ ] Teacher can view submissions
- [ ] Teacher can grade submissions
- [ ] Student can see grades and feedback
- [ ] Tab navigation works smoothly
- [ ] UI is responsive on different screen sizes
- [ ] Loading states display correctly
- [ ] Success/error messages appear

### Backend Tests
- [ ] MongoDB connection successful
- [ ] User registration creates user in database
- [ ] Login returns valid JWT token
- [ ] Protected routes reject requests without token
- [ ] Teacher can create assignments
- [ ] Students cannot create assignments
- [ ] File upload works correctly
- [ ] Files saved in uploads/ folder
- [ ] Submissions linked to correct assignment and student
- [ ] Teacher can only grade their own assignments' submissions
- [ ] Grades update correctly in database

### Security Tests
- [ ] Passwords are hashed in database
- [ ] JWT tokens expire after 24 hours
- [ ] Invalid tokens are rejected
- [ ] Role-based access control works
- [ ] File upload validates file types
- [ ] No SQL injection vulnerabilities
- [ ] CORS configured correctly

## 🐛 Common Issues & Solutions

### Issue: "Connection refused" or "Network Error"
**Solution:** Ensure backend server is running on port 5000
```powershell
cd backend
npm run dev
```

### Issue: "MongoDB connection failed"
**Solution:** Check your MONGO_URI in backend/.env file

### Issue: "Token is not valid"
**Solution:** 
- Clear browser localStorage
- Login again
- Check if JWT_SECRET matches in .env

### Issue: File upload fails
**Solution:**
- Check if uploads/ folder exists in backend
- Verify file size is under 5MB
- Ensure file type is PDF, JPG, or PNG

### Issue: Can't see other user's data
**Solution:** This is correct! The system isolates data by:
- Teachers only see their assignments
- Students only see their submissions
- This is proper role-based access control

## 📊 Expected Results

### Database Collections After Testing

**Users Collection:**
```javascript
{
  _id: ObjectId,
  name: "John Teacher",
  email: "teacher@example.com",
  password: "$2a$10$...", // Hashed
  role: "teacher",
  createdAt: ISODate
}
```

**Assignments Collection:**
```javascript
{
  _id: ObjectId,
  title: "Mathematics Assignment 1",
  description: "Complete exercises...",
  deadline: ISODate,
  teacher: ObjectId, // Teacher's ID
  createdAt: ISODate
}
```

**Submissions Collection:**
```javascript
{
  _id: ObjectId,
  assignment: ObjectId, // Assignment ID
  student: ObjectId, // Student ID
  fileUrl: "http://localhost:5000/uploads/file-123.pdf",
  note: "Submitted via dashboard",
  grade: 85,
  feedback: "Good work!",
  submittedAt: ISODate
}
```

## 🎯 Performance Metrics

- [ ] Page load time < 2 seconds
- [ ] File upload < 5 seconds for 5MB file
- [ ] API response time < 500ms
- [ ] Smooth transitions and animations
- [ ] No console errors in browser
- [ ] No server errors in terminal

---

## 🚀 Advanced Testing

### Load Testing
1. Create 10+ assignments
2. Create 5+ student accounts
3. Submit 20+ assignments
4. Grade all submissions
5. Check if UI remains responsive

### Cross-Browser Testing
- [ ] Chrome
- [ ] Firefox
- [ ] Edge
- [ ] Safari (if available)

### Mobile Responsive Testing
- [ ] Test on mobile device
- [ ] Test on tablet
- [ ] Check landscape and portrait modes

---

**Happy Testing! 🎉**

Report any bugs or issues for immediate resolution.
