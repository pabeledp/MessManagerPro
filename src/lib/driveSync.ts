import { MessData, SyncStatus } from '@/types/mess';

const FILE_NAME = 'messmanager_multi_data.json';

/**
 * Searches for messmanager_multi_data.json in Google Drive appDataFolder.
 */
async function findAppDataFileId(accessToken: string): Promise<string | null> {
  try {
    const url = `https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&q=name='${FILE_NAME}' and trashed=false&fields=files(id, name)`;
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) return null;
    const json = await response.json();
    return json.files?.[0]?.id || null;
  } catch (error) {
    console.error('Error finding Drive file:', error);
    return null;
  }
}

/**
 * Downloads and restores MessData from Google Drive appDataFolder.
 */
export async function restoreFromDrive(accessToken: string): Promise<MessData | null> {
  try {
    const fileId = await findAppDataFileId(accessToken);
    if (!fileId) return null;

    const downloadUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
    const response = await fetch(downloadUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) return null;
    const data: MessData = await response.json();
    return data;
  } catch (error) {
    console.error('Error restoring from Drive:', error);
    return null;
  }
}

/**
 * Uploads/Updates MessData in Google Drive appDataFolder.
 */
export async function uploadToDrive(accessToken: string, data: MessData): Promise<boolean> {
  try {
    const existingFileId = await findAppDataFileId(accessToken);
    const content = JSON.stringify(data, null, 2);

    if (existingFileId) {
      const updateUrl = `https://www.googleapis.com/upload/drive/v3/files/${existingFileId}?uploadType=media`;
      const response = await fetch(updateUrl, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: content,
      });
      return response.ok;
    } else {
      const metadata = { name: FILE_NAME, parents: ['appDataFolder'], mimeType: 'application/json' };
      const boundary = '-------314159265358979323846';
      const multipartRequestBody =
        `\r\n--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n` +
        JSON.stringify(metadata) +
        `\r\n--${boundary}\r\nContent-Type: application/json\r\n\r\n` +
        content +
        `\r\n--${boundary}--`;

      const uploadUrl = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';
      const response = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': `multipart/related; boundary=${boundary}`,
        },
        body: multipartRequestBody,
      });
      return response.ok;
    }
  } catch (error) {
    console.error('Error uploading to Google Drive:', error);
    return false;
  }
}

let syncTimeout: NodeJS.Timeout | null = null;

export function queueDriveSync(
  accessToken: string | undefined,
  data: MessData,
  onStatusChange?: (status: SyncStatus) => void
) {
  if (!accessToken) {
    onStatusChange?.('offline');
    return;
  }

  onStatusChange?.('syncing');

  if (syncTimeout) clearTimeout(syncTimeout);

  syncTimeout = setTimeout(async () => {
    const success = await uploadToDrive(accessToken, data);
    onStatusChange?.(success ? 'synced' : 'error');
  }, 1200);
}
