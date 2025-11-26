# 📊 Rubric-Based Grading System

## Overview
The Smart Assignment System now includes a comprehensive rubric-based grading workflow that allows teachers to define evaluation criteria and provide structured feedback to students.

## Workflow (Based on Flowchart)

### 1️⃣ Teacher Creates Assignment
- Navigate to **Assignments Tab**
- Fill in assignment details:
  - Title
  - Description
  - Deadline
  
### 2️⃣ Configure Rubric Criteria
- Click **➕ Add Criteria** to add evaluation criteria
- For each criterion, define:
  - **Criteria Name** (e.g., "Code Quality", "Documentation", "Testing")
  - **Max Points** (points allocated for this criterion)
  - **Description** (detailed explanation of what this criterion evaluates)
- Set **Total Points** for the assignment (default: 100)
- Click **💾 Save Assignment (Draft)** to save

### 3️⃣ Publish Assignment
- Once satisfied with the rubric, click **📢 Publish**
- Published assignments become visible to students
- Status changes to **✅ Published**

### 4️⃣ Student Submits Assignment
- Students see only published assignments
- Students upload their work files
- Click **✅ Submit Assignment**

### 5️⃣ Teacher Views Submissions
- Click **👀 Submissions** button next to an assignment
- View all student submissions in a table

### 6️⃣ Teacher Grades Using Rubric
- Click **📝 Grade** button for a submission
- Expandable rubric panel appears with:
  - **Rubric Criteria Section**: Each criterion with point input
  - **Teacher Feedback**: Text area for written feedback
- Enter points for each criterion (0 to max points)
- System automatically calculates total grade
- Write comprehensive feedback

### 7️⃣ Submit Grade
- Click **💾 Submit Grade** to save evaluation
- Grade is calculated from rubric scores
- Feedback is saved

### 8️⃣ Return to Student
- Click **📤 Return to Student** to make grade visible
- Student can now view:
  - Total grade
  - Rubric breakdown (points per criterion)
  - Teacher feedback

## Database Schema

### Assignment Model
```javascript
{
  title: String,
  description: String,
  deadline: Date,
  teacher: ObjectId (ref: User),
  published: Boolean (default: false),
  totalPoints: Number (default: 100),
  rubric: [
    {
      criteria: String,
      maxPoints: Number,
      description: String
    }
  ]
}
```

### Submission Model
```javascript
{
  assignment: ObjectId (ref: Assignment),
  student: ObjectId (ref: User),
  fileUrl: String,
  submittedAt: Date,
  grade: Number,
  status: String (enum: 'submitted', 'graded', 'returned'),
  rubricScores: [
    {
      criteriaId: ObjectId,
      criteria: String,
      pointsAwarded: Number,
      maxPoints: Number
    }
  ],
  teacherFeedback: String,
  gradedAt: Date
}
```

## API Endpoints

### Create Assignment with Rubric
```http
POST /api/assignments
Authorization: Bearer <token>

{
  "title": "Final Project",
  "description": "Build a web application",
  "deadline": "2024-12-31",
  "rubric": [
    {
      "criteria": "Code Quality",
      "maxPoints": 30,
      "description": "Clean, readable, and well-organized code"
    },
    {
      "criteria": "Functionality",
      "maxPoints": 40,
      "description": "All features working as expected"
    },
    {
      "criteria": "Documentation",
      "maxPoints": 30,
      "description": "Complete README and code comments"
    }
  ],
  "totalPoints": 100
}
```

### Publish Assignment
```http
PUT /api/assignments/:id/publish
Authorization: Bearer <token>
```

### Grade Submission with Rubric
```http
POST /api/assignments/grade
Authorization: Bearer <token>

{
  "submissionId": "submission_id",
  "rubricScores": [
    {
      "criteriaId": "criteria_id",
      "criteria": "Code Quality",
      "pointsAwarded": 28,
      "maxPoints": 30
    },
    {
      "criteriaId": "criteria_id",
      "criteria": "Functionality",
      "pointsAwarded": 35,
      "maxPoints": 40
    },
    {
      "criteriaId": "criteria_id",
      "criteria": "Documentation",
      "pointsAwarded": 25,
      "maxPoints": 30
    }
  ],
  "teacherFeedback": "Great work! Code is clean and well-structured. Consider adding more inline comments for complex logic."
}
```

### Return Submission to Student
```http
PUT /api/assignments/submissions/:id/return
Authorization: Bearer <token>
```

## Features

### For Teachers
✅ Create detailed rubric criteria for each assignment
✅ Define custom point allocations per criterion
✅ Save assignments as drafts before publishing
✅ Publish assignments when ready
✅ View all student submissions in one place
✅ Grade submissions using structured rubric
✅ Provide written feedback alongside rubric scores
✅ Return graded work to students

### For Students
✅ View only published assignments
✅ Submit work files
✅ View total grade
✅ See rubric breakdown with points per criterion
✅ Read detailed teacher feedback

## UI Components

### Teacher Dashboard - Create Assignment
- **Form with rubric builder**
- **Add/Remove criteria buttons**
- **Dynamic criteria inputs**
- **Total points configuration**
- **Save as draft button**

### Teacher Dashboard - Assignment List
- **Publish button** for draft assignments
- **Published badge** for published assignments
- **View submissions button**

### Teacher Dashboard - Grading Interface
- **Expandable rubric panel** per submission
- **Point input fields** for each criterion
- **Feedback textarea**
- **Submit Grade button**
- **Return to Student button**

### Student Dashboard - Submissions View
- **Total grade display**
- **Rubric breakdown table** showing:
  - Criteria name
  - Points awarded / Max points
- **Teacher feedback section**

## Status Workflow

```
Draft Assignment (published: false)
    ↓ [Teacher clicks Publish]
Published Assignment (published: true) → Visible to Students
    ↓ [Student submits]
Submission (status: 'submitted')
    ↓ [Teacher grades using rubric]
Graded Submission (status: 'graded')
    ↓ [Teacher returns to student]
Returned Submission (status: 'returned') → Visible to Student
```

## Benefits

1. **Structured Evaluation**: Teachers can break down complex assignments into specific criteria
2. **Transparency**: Students see exactly where they earned or lost points
3. **Consistency**: Rubrics ensure fair and standardized grading across all students
4. **Detailed Feedback**: Combines quantitative scores with qualitative feedback
5. **Clear Expectations**: Rubric criteria communicate expectations upfront

## Example Use Case

**Assignment**: Web Development Final Project

**Rubric Criteria**:
1. **User Interface Design (20 points)**: Clean, responsive, and user-friendly interface
2. **Functionality (30 points)**: All required features implemented and working
3. **Code Quality (25 points)**: Well-organized, clean code with proper naming
4. **Documentation (15 points)**: Complete README with setup instructions
5. **Creativity (10 points)**: Innovative features or design choices

**Student Receives**:
- UI Design: 18/20
- Functionality: 28/30
- Code Quality: 22/25
- Documentation: 13/15
- Creativity: 9/10
- **Total: 90/100**
- **Feedback**: "Excellent project! Your UI is intuitive and the functionality is solid. Consider adding more inline comments for complex algorithms. Great use of modern design patterns!"

## Testing Checklist

- [ ] Create assignment with rubric criteria
- [ ] Save assignment as draft
- [ ] Verify draft not visible to students
- [ ] Publish assignment
- [ ] Verify published assignment visible to students
- [ ] Student submits assignment
- [ ] Teacher views submission
- [ ] Teacher grades using rubric panel
- [ ] Verify total grade calculated correctly
- [ ] Submit grade
- [ ] Return submission to student
- [ ] Student views rubric breakdown and feedback

## Deployment Notes

All rubric functionality is now integrated into:
- ✅ **Backend Models**: Assignment.js, Submission.js
- ✅ **Backend Controllers**: assignmentController.js (createAssignment, publishAssignment, gradeSubmission, returnSubmission)
- ✅ **Backend Routes**: assignmentRoutes.js (new publish and return endpoints)
- ✅ **Frontend UI**: Dashboard.jsx (rubric builder, grading panel, student feedback view)

Ready for deployment to production! 🚀
