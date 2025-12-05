const express = require('express');
const router = express.Router();
const { google } = require('googleapis');
const path = require('path');
const { getOAuthClient, hasToken } = require('../utils/googleOAuth');

// Simple Drive health check
router.get('/drive', async (req, res) => {
  try {
    const enabled = String(process.env.DRIVE_UPLOAD_ENABLED || '').trim().toLowerCase() === 'true';
    if (!enabled) {
      return res.status(200).json({ ok: true, enabled: false, message: 'Drive upload disabled' });
    }

    if (!hasToken()) {
      return res.status(200).json({ ok: true, enabled: true, oauthTokenPresent: false, message: 'OAuth not completed. Visit /api/drive/oauth/init' });
    }

    const oAuth2Client = getOAuthClient();
    const drive = google.drive({ version: 'v3', auth: oAuth2Client });

    const folderId = process.env.DRIVE_FOLDER_ID || null;
    let folderStatus = null;
    if (folderId) {
      try {
        const f = await drive.files.get({ fileId: folderId, fields: 'id, name, mimeType', supportsAllDrives: true });
        folderStatus = { id: f.data.id, name: f.data.name, mimeType: f.data.mimeType };
      } catch (e) {
        folderStatus = { id: folderId, error: 'unavailable-or-not-found' };
      }
    } else {
      // List first 1 folder to confirm API access
      const list = await drive.files.list({ q: "mimeType = 'application/vnd.google-apps.folder'", pageSize: 1, fields: 'files(id,name)', supportsAllDrives: true, includeItemsFromAllDrives: true });
      folderStatus = { sample: list.data.files && list.data.files[0] ? list.data.files[0] : null };
    }

    return res.status(200).json({ ok: true, enabled: true, oauthTokenPresent: true, folderId: folderId || null, folderStatus });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

module.exports = router;
