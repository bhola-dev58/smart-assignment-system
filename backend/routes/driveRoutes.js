const express = require('express');
const router = express.Router();
const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
const { getOAuthClient, saveToken, hasToken } = require('../utils/googleOAuth');

// Start OAuth consent
router.get('/oauth/init', (req, res) => {
  const oAuth2Client = getOAuthClient();
  const scopes = [
    // Full Drive access for test users to allow setting parents to arbitrary folders
    'https://www.googleapis.com/auth/drive',
  ];
  const url = oAuth2Client.generateAuthUrl({ access_type: 'offline', prompt: 'consent', scope: scopes });
  res.redirect(url);
});

// OAuth callback
router.get('/oauth/callback', async (req, res) => {
  try {
    const code = req.query.code;
    const oAuth2Client = getOAuthClient();
    const { tokens } = await oAuth2Client.getToken(code);
    saveToken(tokens);
    res.send('Google OAuth successful. Tokens saved. You can close this window.');
  } catch (err) {
    res.status(500).send('OAuth error: ' + err.message);
  }
});

// OAuth health
router.get('/health', (req, res) => {
  res.json({ oauthTokenPresent: hasToken() });
});

module.exports = router;

// Create a Drive folder via OAuth and set DRIVE_FOLDER_ID
router.post('/folder/create', async (req, res) => {
  try {
    if (!hasToken()) {
      return res.status(401).json({ ok: false, error: 'Google OAuth not completed. Visit /api/drive/oauth/init to connect your Drive.' });
    }

    const name = (req.body && req.body.name) ? String(req.body.name).trim() : 'Smart Assignment Uploads';
    const parentId = (req.body && req.body.parentId) ? String(req.body.parentId).trim() : null;

    const oAuth2Client = getOAuthClient();
    const drive = google.drive({ version: 'v3', auth: oAuth2Client });

    // Validate parent if provided
    let parents = undefined;
    if (parentId) {
      try {
        await drive.files.get({ fileId: parentId, fields: 'id', supportsAllDrives: true });
        parents = [parentId];
      } catch (e) {
        return res.status(400).json({ ok: false, error: 'Parent folder not found or inaccessible', details: e.message });
      }
    }

    const resource = {
      name,
      mimeType: 'application/vnd.google-apps.folder',
      ...(parents ? { parents } : {}),
    };
    const createRes = await drive.files.create({ resource, fields: 'id', supportsAllDrives: true });
    const folderId = createRes.data.id;

    // Get webViewLink for convenience
    const linkRes = await drive.files.get({ fileId: folderId, fields: 'webViewLink,name', supportsAllDrives: true });

    // Update process env immediately
    process.env.DRIVE_FOLDER_ID = folderId;

    // Persist to backend/.env
    try {
      const envPath = path.join(__dirname, '..', '.env');
      let content = fs.readFileSync(envPath, 'utf-8');
      if (content.match(/^DRIVE_FOLDER_ID=.*$/m)) {
        content = content.replace(/^DRIVE_FOLDER_ID=.*$/m, `DRIVE_FOLDER_ID=${folderId}`);
      } else {
        if (!content.endsWith('\n')) content += '\n';
        content += `DRIVE_FOLDER_ID=${folderId}\n`;
      }
      fs.writeFileSync(envPath, content);
    } catch (e) {
      // Non-fatal: return warning if .env write fails
      return res.status(200).json({ ok: true, folderId, webViewLink: linkRes.data.webViewLink, name: linkRes.data.name, envUpdate: 'failed', envError: e.message });
    }

    return res.status(200).json({ ok: true, folderId, webViewLink: linkRes.data.webViewLink, name: linkRes.data.name, envUpdate: 'updated' });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});
