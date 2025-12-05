const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');

// Resolve service account key file path
const DEFAULT_KEY_PATH = path.join(__dirname, '../config/drive-service-account.json');
const KEYFILEPATH = process.env.GOOGLE_APPLICATION_CREDENTIALS
  ? (path.isAbsolute(process.env.GOOGLE_APPLICATION_CREDENTIALS)
      ? process.env.GOOGLE_APPLICATION_CREDENTIALS
      : path.resolve(__dirname, '..', process.env.GOOGLE_APPLICATION_CREDENTIALS))
  : DEFAULT_KEY_PATH;
const SCOPES = ['https://www.googleapis.com/auth/drive'];

// Validate key file exists and has required fields
let drive;
try {
  if (!fs.existsSync(KEYFILEPATH)) {
    throw new Error(`Service account key file not found at ${KEYFILEPATH}`);
  }
  const raw = fs.readFileSync(KEYFILEPATH, 'utf-8');
  const json = JSON.parse(raw);
  if (!json.client_email || !json.private_key) {
    throw new Error('Service account JSON missing client_email or private_key');
  }
  const auth = new google.auth.GoogleAuth({
    keyFile: KEYFILEPATH,
    scopes: SCOPES,
  });
  drive = google.drive({ version: 'v3', auth });
} catch (e) {
  // Export a stub to let caller handle configuration error
  module.exports = { uploadFileToDrive: async () => { throw e; } };
  return;
}

/**
 * Uploads a file to Google Drive and returns the shareable link
 * @param {string} filePath - Local path to the file
 * @param {string} fileName - Desired name in Drive
 * @param {string} [folderId] - Optional Drive folder ID
 * @returns {Promise<{ fileId: string, webViewLink: string }>} - Drive identifiers
 */
async function uploadFileToDrive(filePath, fileName, folderId = null) {
  // Validate folderId access; if not accessible, upload to root
  let parents = undefined;
  if (folderId) {
    try {
      await drive.files.get({ fileId: folderId, fields: 'id', supportsAllDrives: true });
      parents = [folderId];
    } catch (e) {
      // If folder is not found or access denied, log and continue without parents
      console.warn(`Drive folder not accessible (id=${folderId}); uploading to root. Reason: ${e.message}`);
      parents = undefined;
    }
  }
  const fileMetadata = {
    name: fileName,
    ...(parents ? { parents } : {}),
  };
  const media = {
    mimeType: 'application/octet-stream',
    body: fs.createReadStream(filePath),
  };
  const res = await drive.files.create({
    resource: fileMetadata,
    media,
    fields: 'id',
    supportsAllDrives: true,
  });
  const fileId = res.data.id;
  // Make file public
  await drive.permissions.create({
    fileId,
    requestBody: {
      role: 'reader',
      type: 'anyone',
    },
  });
  // Get shareable link
  const linkRes = await drive.files.get({
    fileId,
    fields: 'webViewLink',
  });
  return { fileId, webViewLink: linkRes.data.webViewLink };
}

module.exports = { uploadFileToDrive };
