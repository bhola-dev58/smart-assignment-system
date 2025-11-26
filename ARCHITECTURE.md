# 🏗️ System Architecture - Rubric-Based Grading

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    SMART ASSIGNMENT SYSTEM                      │
│                  Rubric-Based Grading Platform                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────┐         ┌──────────────────┐         ┌──────────────────┐
│                 │         │                  │         │                  │
│   FRONTEND      │◄───────►│    BACKEND       │◄───────►│   DATABASE       │
│   React + Vite  │  HTTPS  │  Node.js/Express │  TCP    │  MongoDB Atlas   │
│                 │         │                  │         │                  │
└─────────────────┘         └──────────────────┘         └──────────────────┘
     │                              │                            │
     │                              │                            │
  [Vercel]                      [Render]                    [Cloud]
```

## Component Architecture

### Frontend Components

```
Dashboard.jsx
├── Header
│   ├── Logo & Title
│   ├── User Info (name, role)
│   └── Logout Button
│
├── Tab Navigation
│   ├── Assignments Tab
│   └── Submissions Tab
│
├── Teacher View
│   ├── Create Assignment Form
│   │   ├── Basic Info Section
│   │   │   ├── Title Input
│   │   │   ├── Description Textarea
│   │   │   └── Deadline Picker
│   │   │
│   │   └── Rubric Configuration
│   │       ├── Criteria Cards (Dynamic Array)
│   │       │   ├── Criteria Name Input
│   │       │   ├── Max Points Input
│   │       │   ├── Description Textarea
│   │       │   └── Remove Button
│   │       ├── Add Criteria Button
│   │       ├── Total Points Input
│   │       └── Save Draft Button
│   │
│   ├── Assignments Table
│   │   ├── Table Headers
│   │   │   ├── Title
│   │   │   ├── Description
│   │   │   ├── Deadline
│   │   │   ├── Created Date
│   │   │   └── Actions
│   │   │
│   │   └── Table Rows (per assignment)
│   │       ├── Assignment Data
│   │       └── Action Buttons
│   │           ├── Publish Button (if draft)
│   │           ├── Published Badge (if published)
│   │           └── View Submissions Button
│   │
│   └── Grading Interface
│       ├── Submissions Table
│       │   ├── Student Info (avatar, name, email)
│       │   ├── Submitted Date
│       │   ├── File Link
│       │   ├── Current Grade
│       │   └── Grade Button
│       │
│       └── Expandable Grading Panel (per submission)
│           ├── Rubric Evaluation Section
│           │   └── Criteria Cards (from assignment rubric)
│           │       ├── Criteria Name & Description
│           │       └── Points Input (0 to max)
│           │
│           ├── Teacher Feedback Section
│           │   └── Feedback Textarea
│           │
│           └── Action Buttons
│               ├── Cancel Button
│               ├── Submit Grade Button
│               └── Return to Student Button
│
└── Student View
    ├── Assignment Cards
    │   ├── Assignment Info
    │   │   ├── Title
    │   │   ├── Description
    │   │   ├── Deadline
    │   │   └── Teacher Name
    │   │
    │   └── Submission Section
    │       ├── File Upload Input
    │       └── Submit Button
    │
    └── Submissions Table
        ├── Assignment Title
        ├── Submitted Date
        ├── File Link
        ├── Grade Badge (status-based)
        └── Feedback Display
            ├── Rubric Breakdown Table
            │   └── Rows (per criterion)
            │       ├── Criteria Name
            │       └── Points Awarded / Max Points
            │
            └── Teacher Feedback Text
```

### Backend Architecture

```
server.js (Entry Point)
│
├── config/
│   └── db.js (MongoDB Connection)
│
├── models/
│   ├── User.js
│   │   ├── name: String
│   │   ├── email: String
│   │   ├── password: String (hashed)
│   │   └── role: String (teacher/student)
│   │
│   ├── Assignment.js ⭐ UPDATED
│   │   ├── title: String
│   │   ├── description: String
│   │   ├── deadline: Date
│   │   ├── teacher: ObjectId (ref: User)
│   │   ├── published: Boolean ✨ NEW
│   │   ├── totalPoints: Number ✨ NEW
│   │   └── rubric: Array ✨ NEW
│   │       └── RubricCriteriaSchema
│   │           ├── criteria: String
│   │           ├── maxPoints: Number
│   │           └── description: String
│   │
│   └── Submission.js ⭐ UPDATED
│       ├── assignment: ObjectId (ref: Assignment)
│       ├── student: ObjectId (ref: User)
│       ├── fileUrl: String
│       ├── submittedAt: Date
│       ├── grade: Number
│       ├── status: String ✨ NEW (enum)
│       ├── rubricScores: Array ✨ NEW
│       │   └── RubricScoreSchema
│       │       ├── criteriaId: ObjectId
│       │       ├── criteria: String
│       │       ├── pointsAwarded: Number
│       │       └── maxPoints: Number
│       ├── teacherFeedback: String ✨ NEW
│       └── gradedAt: Date ✨ NEW
│
├── controllers/
│   ├── authController.js
│   │   ├── register()
│   │   └── login()
│   │
│   └── assignmentController.js ⭐ UPDATED
│       ├── createAssignment() ✨ ENHANCED
│       │   └── Now accepts rubric & totalPoints
│       │
│       ├── publishAssignment() ✨ NEW
│       │   └── Sets published: true
│       │
│       ├── getAssignments() ✨ ENHANCED
│       │   └── Filters published for students
│       │
│       ├── submitAssignment()
│       │
│       ├── gradeSubmission() ✨ ENHANCED
│       │   ├── Accepts rubricScores array
│       │   ├── Calculates total grade
│       │   └── Saves teacherFeedback
│       │
│       ├── returnSubmission() ✨ NEW
│       │   └── Sets status: 'returned'
│       │
│       ├── getSubmissionsForAssignment()
│       └── getMySubmissions()
│
├── middleware/
│   ├── authMiddleware.js (JWT Verification)
│   └── uploadMiddleware.js (Multer File Upload)
│
└── routes/
    ├── authRoutes.js
    │   ├── POST /api/auth/register
    │   └── POST /api/auth/login
    │
    └── assignmentRoutes.js ⭐ UPDATED
        ├── POST /api/assignments/upload
        ├── POST /api/assignments ✨ ENHANCED
        ├── PUT /api/assignments/:id/publish ✨ NEW
        ├── GET /api/assignments ✨ ENHANCED
        ├── POST /api/assignments/submit
        ├── POST /api/assignments/grade ✨ ENHANCED
        ├── PUT /api/assignments/submissions/:id/return ✨ NEW
        ├── GET /api/assignments/my-submissions
        └── GET /api/assignments/:assignmentId/submissions
```

### Database Schema

```
MongoDB Atlas
│
├── users (Collection)
│   └── Document
│       ├── _id: ObjectId
│       ├── name: String
│       ├── email: String (unique)
│       ├── password: String (bcrypt hashed)
│       ├── role: String (enum: ['teacher', 'student'])
│       └── createdAt: Date
│
├── assignments (Collection) ⭐ UPDATED
│   └── Document
│       ├── _id: ObjectId
│       ├── title: String (required)
│       ├── description: String (required)
│       ├── deadline: Date (required)
│       ├── teacher: ObjectId (ref: users)
│       ├── published: Boolean (default: false) ✨ NEW
│       ├── totalPoints: Number (default: 100) ✨ NEW
│       ├── rubric: Array ✨ NEW
│       │   └── Object
│       │       ├── _id: ObjectId (auto-generated)
│       │       ├── criteria: String
│       │       ├── maxPoints: Number
│       │       └── description: String
│       ├── createdAt: Date (auto-generated)
│       └── updatedAt: Date (auto-generated)
│
└── submissions (Collection) ⭐ UPDATED
    └── Document
        ├── _id: ObjectId
        ├── assignment: ObjectId (ref: assignments)
        ├── student: ObjectId (ref: users)
        ├── fileUrl: String (required)
        ├── note: String
        ├── submittedAt: Date (default: Date.now)
        ├── grade: Number (nullable)
        ├── status: String (enum: ['submitted', 'graded', 'returned']) ✨ NEW
        ├── rubricScores: Array ✨ NEW
        │   └── Object
        │       ├── criteriaId: ObjectId
        │       ├── criteria: String
        │       ├── pointsAwarded: Number
        │       └── maxPoints: Number
        ├── teacherFeedback: String ✨ NEW
        └── gradedAt: Date ✨ NEW
```

## Data Flow Diagrams

### Create Assignment with Rubric

```
┌─────────┐         ┌─────────┐         ┌──────────┐         ┌──────────┐
│ Teacher │         │Frontend │         │ Backend  │         │ Database │
│  (User) │         │  React  │         │ Express  │         │ MongoDB  │
└────┬────┘         └────┬────┘         └────┬─────┘         └────┬─────┘
     │                   │                    │                    │
     │ Fill form with    │                    │                    │
     │ rubric criteria   │                    │                    │
     ├──────────────────►│                    │                    │
     │                   │                    │                    │
     │ Click Save        │                    │                    │
     ├──────────────────►│                    │                    │
     │                   │ POST /assignments  │                    │
     │                   │ {title, desc,      │                    │
     │                   │  deadline, rubric} │                    │
     │                   ├───────────────────►│                    │
     │                   │                    │ Validate JWT       │
     │                   │                    │ Check role=teacher │
     │                   │                    │ Create Assignment  │
     │                   │                    │ with rubric array  │
     │                   │                    ├───────────────────►│
     │                   │                    │                    │ Save
     │                   │                    │◄───────────────────┤
     │                   │◄───────────────────┤                    │
     │◄──────────────────┤ Show success       │                    │
     │                   │                    │                    │
```

### Publish Assignment

```
┌─────────┐         ┌─────────┐         ┌──────────┐         ┌──────────┐
│ Teacher │         │Frontend │         │ Backend  │         │ Database │
└────┬────┘         └────┬────┘         └────┬─────┘         └────┬─────┘
     │                   │                    │                    │
     │ Click Publish     │                    │                    │
     ├──────────────────►│                    │                    │
     │                   │ PUT /assignments/  │                    │
     │                   │     :id/publish    │                    │
     │                   ├───────────────────►│                    │
     │                   │                    │ Find assignment    │
     │                   │                    │ Set published=true │
     │                   │                    ├───────────────────►│
     │                   │                    │◄───────────────────┤
     │                   │◄───────────────────┤                    │
     │◄──────────────────┤ Update UI badge    │                    │
     │                   │                    │                    │
```

### Grade with Rubric

```
┌─────────┐         ┌─────────┐         ┌──────────┐         ┌──────────┐
│ Teacher │         │Frontend │         │ Backend  │         │ Database │
└────┬────┘         └────┬────┘         └────┬─────┘         └────┬─────┘
     │                   │                    │                    │
     │ Click Grade       │                    │                    │
     ├──────────────────►│                    │                    │
     │                   │ Expand panel       │                    │
     │                   │ Show rubric        │                    │
     │                   │                    │                    │
     │ Enter points per  │                    │                    │
     │ criterion         │                    │                    │
     ├──────────────────►│                    │                    │
     │                   │ Calculate total    │                    │
     │                   │                    │                    │
     │ Write feedback    │                    │                    │
     ├──────────────────►│                    │                    │
     │                   │                    │                    │
     │ Click Submit      │                    │                    │
     ├──────────────────►│ POST /grade        │                    │
     │                   │ {submissionId,     │                    │
     │                   │  rubricScores,     │                    │
     │                   │  teacherFeedback}  │                    │
     │                   ├───────────────────►│                    │
     │                   │                    │ Calculate grade    │
     │                   │                    │ from rubricScores  │
     │                   │                    │ Update submission  │
     │                   │                    │ Set status='graded'│
     │                   │                    ├───────────────────►│
     │                   │                    │◄───────────────────┤
     │                   │◄───────────────────┤                    │
     │◄──────────────────┤ Show success       │                    │
     │                   │                    │                    │
```

### Student Views Rubric Breakdown

```
┌─────────┐         ┌─────────┐         ┌──────────┐         ┌──────────┐
│ Student │         │Frontend │         │ Backend  │         │ Database │
└────┬────┘         └────┬────┘         └────┬─────┘         └────┬─────┘
     │                   │                    │                    │
     │ Navigate to       │                    │                    │
     │ Submissions tab   │                    │                    │
     ├──────────────────►│                    │                    │
     │                   │ GET /my-submissions│                    │
     │                   ├───────────────────►│                    │
     │                   │                    │ Find submissions   │
     │                   │                    │ for student        │
     │                   │                    │ Filter status=     │
     │                   │                    │ 'returned'         │
     │                   │                    │ Populate assignment│
     │                   │                    ├───────────────────►│
     │                   │                    │◄───────────────────┤
     │                   │◄───────────────────┤                    │
     │                   │ Display:           │                    │
     │                   │ - Total grade      │                    │
     │                   │ - Rubric breakdown │                    │
     │                   │   (each criterion) │                    │
     │                   │ - Teacher feedback │                    │
     │◄──────────────────┤                    │                    │
     │                   │                    │                    │
```

## State Management Flow

### Frontend State (Dashboard.jsx)

```javascript
// Assignment Creation State
┌─────────────────────┐
│ title: String       │
│ desc: String        │
│ deadline: Date      │
│ rubric: Array       │◄─── Dynamic array
│   ├─ criteria       │     - Add criteria
│   ├─ maxPoints      │     - Remove criteria
│   └─ description    │     - Update fields
│ totalPoints: Number │
└─────────────────────┘

// Grading State
┌─────────────────────────┐
│ gradeData: Object       │
│ {                       │
│   [submissionId]: {     │
│     rubricScores: {     │◄─── Per-criterion scores
│       [index]: points   │
│     },                  │
│     teacherFeedback: "" │
│   }                     │
│ }                       │
└─────────────────────────┘

// View State
┌─────────────────────┐
│ activeTab: String   │◄─── 'assignments' | 'submissions'
│ selectedAssignment  │◄─── For grading view
│ submissions: Array  │◄─── Fetched submissions
│ assignments: Array  │◄─── Fetched assignments
└─────────────────────┘
```

## Authentication Flow

```
┌─────┐         ┌─────────┐         ┌─────────┐         ┌──────────┐
│User │         │Frontend │         │Backend  │         │Database  │
└──┬──┘         └────┬────┘         └────┬────┘         └────┬─────┘
   │                 │                   │                   │
   │ Login           │                   │                   │
   ├────────────────►│ POST /auth/login  │                   │
   │                 ├──────────────────►│ Find user         │
   │                 │                   ├──────────────────►│
   │                 │                   │◄──────────────────┤
   │                 │                   │ Compare password  │
   │                 │                   │ (bcrypt)          │
   │                 │                   │ Generate JWT      │
   │                 │◄──────────────────┤                   │
   │                 │ Store token in    │                   │
   │                 │ localStorage      │                   │
   │◄────────────────┤                   │                   │
   │                 │                   │                   │
   │ Subsequent      │                   │                   │
   │ requests        │ Include token     │                   │
   ├────────────────►│ in Authorization  │                   │
   │                 │ header            │                   │
   │                 ├──────────────────►│ Verify JWT        │
   │                 │                   │ (authMiddleware)  │
   │                 │                   │ Attach user to    │
   │                 │                   │ req.user          │
   │                 │◄──────────────────┤                   │
   │◄────────────────┤                   │                   │
```

## Deployment Architecture

```
┌────────────────────────────────────────────────────────────────┐
│                         INTERNET                               │
└───────────────┬────────────────────────────┬───────────────────┘
                │                            │
       HTTPS    │                   HTTPS    │
                │                            │
     ┌──────────▼──────────┐      ┌─────────▼──────────┐
     │   VERCEL CDN        │      │   RENDER.COM       │
     │   (Frontend Host)   │      │   (Backend Host)   │
     │                     │      │                    │
     │   React SPA         │      │   Node.js Server   │
     │   Static Assets     │      │   Express API      │
     │   Vite Build        │      │   Port 5000        │
     └─────────────────────┘      └─────────┬──────────┘
                                            │
                                   TCP      │
                                   27017    │
                                            │
                                 ┌──────────▼──────────┐
                                 │  MongoDB Atlas      │
                                 │  (Cloud Database)   │
                                 │                     │
                                 │  3 Collections:     │
                                 │  - users            │
                                 │  - assignments      │
                                 │  - submissions      │
                                 └─────────────────────┘
```

## Security Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      SECURITY LAYERS                        │
└─────────────────────────────────────────────────────────────┘

Layer 1: HTTPS/TLS Encryption
├── Vercel: Automatic SSL
└── Render: Automatic SSL

Layer 2: Authentication (JWT)
├── Token generated on login
├── Token stored in localStorage
├── Token sent in Authorization header
└── Token verified on each request

Layer 3: Authorization (Role-Based)
├── authMiddleware.js verifies token
├── Controller checks req.user.role
├── Teacher-only routes protected
└── Student-only data filtered

Layer 4: Data Validation
├── Mongoose schema validation
├── Required fields enforced
├── Type checking (String, Number, Date)
└── Enum validation (status, role)

Layer 5: Database Security
├── MongoDB Atlas network security
├── IP whitelist (0.0.0.0/0 for cloud)
├── Database credentials in env vars
└── Connection string in .env (not committed)

Layer 6: File Upload Security
├── Multer file size limits
├── File type validation
├── Unique filename generation (Date.now())
└── Stored in uploads/ directory
```

---

**🏗️ Complete system architecture documented!**

This architecture supports the full rubric-based grading workflow as designed in your flowchart. All components are production-ready and ready for deployment. 🚀
