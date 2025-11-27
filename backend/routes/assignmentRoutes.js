const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer(); // memory storage for buffer
const { uploadAssignmentFile } = require('../controllers/assignmentController');

// File upload route
router.post('/upload', upload.single('file'), uploadAssignmentFile);

module.exports = router;