const express = require('express');
const router = express.Router();
const s3Controller = require('./s3.controllers');

router.post('/upload', s3Controller.uploadMiddleware, s3Controller.uploadFile);
router.get('/files', s3Controller.getAllFiles);
router.delete('/files/:key', s3Controller.deleteFile);

module.exports = router;
