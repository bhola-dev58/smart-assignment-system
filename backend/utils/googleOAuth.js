const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

const TOKEN_PATH = path.join(__dirname, '../config/google-oauth-token.json');

function getOAuthClient() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_OAUTH_REDIRECT_URI || 'http://localhost:5000/api/drive/oauth/callback';
  const oAuth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
  // Load token if present
  if (fs.existsSync(TOKEN_PATH)) {
    try {
      const token = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf-8'));
      oAuth2Client.setCredentials(token);
    } catch (_) {}
  }
  return oAuth2Client;
}

function saveToken(token) {
  const dir = path.dirname(TOKEN_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(TOKEN_PATH, JSON.stringify(token));
}

function hasToken() {
  return fs.existsSync(TOKEN_PATH);
}

async function uploadWithOAuth(filePath, fileName, folderId = null) {
  const oAuth2Client = getOAuthClient();
  const drive = google.drive({ version: 'v3', auth: oAuth2Client });
  let parents = undefined;
  if (folderId) {
    try {
      await drive.files.get({ fileId: folderId, fields: 'id', supportsAllDrives: true });
      parents = [folderId];
    } catch (_) {}
  }
  const fileMetadata = { name: fileName, ...(parents ? { parents } : {}) };
  const media = { mimeType: 'application/octet-stream', body: fs.createReadStream(filePath) };
  const res = await drive.files.create({ resource: fileMetadata, media, fields: 'id', supportsAllDrives: true });
  const fileId = res.data.id;
  // Set permission: anyone with the link can view
  await drive.permissions.create({
    fileId,
    requestBody: {
      role: 'reader',
      type: 'anyone',
    },
    supportsAllDrives: true,
  });
  const linkRes = await drive.files.get({ fileId, fields: 'webViewLink', supportsAllDrives: true });
  return { fileId, webViewLink: linkRes.data.webViewLink };
}

module.exports = { getOAuthClient, saveToken, hasToken, uploadWithOAuth, TOKEN_PATH };
