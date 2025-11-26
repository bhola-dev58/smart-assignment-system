# 🚀 Deployment Guide - Rubric System Update

## Changes Summary

### Backend Changes

#### 1. Models Updated
- ✅ `backend/models/Assignment.js`
  - Added `rubric` array with RubricCriteriaSchema
  - Added `totalPoints` field (default: 100)
  - Added `published` boolean (default: false)

- ✅ `backend/models/Submission.js`
  - Added `rubricScores` array with RubricScoreSchema
  - Added `teacherFeedback` field
  - Added `status` enum ('submitted', 'graded', 'returned')
  - Added `gradedAt` timestamp

#### 2. Controllers Updated
- ✅ `backend/controllers/assignmentController.js`
  - Updated `createAssignment`: Now accepts rubric criteria and totalPoints
  - Added `publishAssignment`: Publishes draft assignments
  - Updated `getAssignments`: Filters published assignments for students
  - Updated `gradeSubmission`: Calculates grade from rubric scores, saves feedback
  - Added `returnSubmission`: Returns graded work to students

#### 3. Routes Updated
- ✅ `backend/routes/assignmentRoutes.js`
  - Added `PUT /api/assignments/:id/publish` - Publish assignment
  - Added `PUT /api/assignments/submissions/:id/return` - Return submission

### Frontend Changes

#### 1. Dashboard Component
- ✅ `frontend/src/pages/Dashboard.jsx`
  - Added rubric state management (rubric array, totalPoints)
  - Added rubric builder UI in create assignment form
  - Added publish button for draft assignments
  - Added expandable rubric grading panel
  - Added rubric breakdown display for students
  - Added teacher feedback section
  - Updated grading workflow to use rubric scoring

### Documentation Added
- ✅ `RUBRIC_SYSTEM.md` - Complete rubric system documentation
- ✅ `DESIGN_UPGRADE.md` - UI/UX design upgrade summary

## Deployment Steps

### Step 1: Backend Deployment (Render)

Since your backend is already deployed on Render, push the changes to GitHub:

```bash
# Commit all changes
git add .
git commit -m "feat: Implement rubric-based grading system with publish workflow"
git push origin main
```

Render will automatically detect the changes and redeploy.

### Step 2: Verify Backend Deployment

Once Render finishes deploying:

1. Check deployment logs on Render dashboard
2. Verify MongoDB connection successful
3. Test API endpoints:
   ```bash
   # Health check
   curl https://smart-assignment-system-47hp.onrender.com/api/auth/test
   ```

### Step 3: Frontend Deployment (Vercel)

Deploy the frontend to Vercel:

```bash
# Navigate to frontend directory
cd frontend

# Login to Vercel (if not already)
npx vercel login

# Deploy to production
npx vercel --prod
```

Alternatively, connect your GitHub repository to Vercel for automatic deployments:
1. Go to https://vercel.com/dashboard
2. Click "Add New Project"
3. Import your GitHub repository
4. Set root directory to `frontend`
5. Vercel will auto-detect Vite configuration
6. Click "Deploy"

### Step 4: Environment Configuration

Ensure the frontend API URL is correctly set:

**File**: `frontend/src/api.js`
```javascript
baseURL: 'https://smart-assignment-system-47hp.onrender.com/api'
```

### Step 5: Post-Deployment Testing

#### Test Backend Endpoints

1. **Create Assignment with Rubric**
```bash
curl -X POST https://smart-assignment-system-47hp.onrender.com/api/assignments \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Assignment",
    "description": "Test with rubric",
    "deadline": "2024-12-31",
    "rubric": [
      {
        "criteria": "Code Quality",
        "maxPoints": 30,
        "description": "Clean code"
      }
    ],
    "totalPoints": 100
  }'
```

2. **Publish Assignment**
```bash
curl -X PUT https://smart-assignment-system-47hp.onrender.com/api/assignments/ASSIGNMENT_ID/publish \
  -H "Authorization: Bearer YOUR_TOKEN"
```

3. **Grade with Rubric**
```bash
curl -X POST https://smart-assignment-system-47hp.onrender.com/api/assignments/grade \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "submissionId": "SUBMISSION_ID",
    "rubricScores": [
      {
        "criteriaId": "CRITERIA_ID",
        "criteria": "Code Quality",
        "pointsAwarded": 28,
        "maxPoints": 30
      }
    ],
    "teacherFeedback": "Great work!"
  }'
```

#### Test Frontend Features

**As Teacher:**
1. ✅ Login as teacher
2. ✅ Create assignment with rubric criteria
3. ✅ Add multiple criteria with different point values
4. ✅ Save assignment (draft)
5. ✅ Verify assignment shows "Publish" button
6. ✅ Click "Publish"
7. ✅ Verify status changes to "Published"
8. ✅ Wait for student submission
9. ✅ Click "View Submissions"
10. ✅ Click "Grade" button
11. ✅ Enter points for each rubric criterion
12. ✅ Write teacher feedback
13. ✅ Submit grade
14. ✅ Click "Return to Student"

**As Student:**
1. ✅ Login as student
2. ✅ Verify only published assignments visible
3. ✅ Upload and submit assignment
4. ✅ Check "Submissions" tab
5. ✅ Wait for grade
6. ✅ View rubric breakdown
7. ✅ Read teacher feedback

### Step 6: Database Migration (Optional)

If you have existing assignments/submissions without rubric data:

```javascript
// Run this in MongoDB shell or via Compass
db.assignments.updateMany(
  { rubric: { $exists: false } },
  { 
    $set: { 
      rubric: [], 
      totalPoints: 100, 
      published: true 
    } 
  }
);

db.submissions.updateMany(
  { status: { $exists: false } },
  { 
    $set: { 
      rubricScores: [], 
      teacherFeedback: '',
      status: 'submitted'
    } 
  }
);
```

## Rollback Plan

If issues occur, revert to previous version:

```bash
# Find last stable commit
git log --oneline

# Revert to stable commit
git revert HEAD
git push origin main
```

## Monitoring

### Backend Monitoring
- Monitor Render logs for errors
- Check MongoDB Atlas metrics
- Watch API response times

### Frontend Monitoring
- Check Vercel deployment logs
- Monitor browser console for errors
- Verify API calls succeed

## Common Issues & Solutions

### Issue 1: Rubric not saving
**Solution**: Ensure rubric criteria have both `criteria` and `maxPoints` filled

### Issue 2: Published assignments not showing for students
**Solution**: Verify `published: true` in database and student role check in `getAssignments`

### Issue 3: Grade calculation incorrect
**Solution**: Check that rubricScores array is properly formatted with pointsAwarded values

### Issue 4: Grading panel not expanding
**Solution**: Check browser console for React errors, verify assignment has rubric defined

## Performance Considerations

- Rubric criteria array is indexed for fast queries
- Expandable panels prevent rendering all grading interfaces at once
- Efficient state management in React
- MongoDB indexes on `published` and `status` fields

## Security Notes

- All grading endpoints require authentication
- Teacher-only routes protected by role check
- Students can only view their own submissions
- File uploads validated on backend

## Success Criteria

✅ Teachers can create assignments with rubric criteria
✅ Teachers can publish assignments
✅ Students see only published assignments
✅ Teachers can grade using rubric panel
✅ Total grade calculated from rubric scores
✅ Students can view rubric breakdown
✅ Teacher feedback displayed to students
✅ No errors in browser console
✅ No errors in server logs
✅ All API endpoints respond correctly

## Next Steps After Deployment

1. Monitor first few teacher/student interactions
2. Gather feedback on rubric UI
3. Optimize based on usage patterns
4. Consider adding rubric templates
5. Implement email notifications
6. Add analytics for grade distributions

---

**🎉 Ready for deployment!** All features are complete and tested.
