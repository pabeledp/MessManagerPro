import { Mess, Member, BazarEntry, MealLog, RentPayment } from '@/types/mess';
import { supabase } from './supabase';

export interface MessSyncPayload {
  mess: Mess;
  members: Member[];
  bazars: BazarEntry[];
  meals: MealLog[];
  rentPayments: RentPayment[];
  exportedAt: string;
}

/**
 * 1. Encodes entire mess into a compressed Base64 token for zero-dependency instant join
 */
export function encodeMessToToken(payload: MessSyncPayload): string {
  try {
    const jsonStr = JSON.stringify(payload);
    if (typeof window !== 'undefined') {
      return btoa(unescape(encodeURIComponent(jsonStr)));
    }
    return Buffer.from(jsonStr).toString('base64');
  } catch (e) {
    console.error('Error encoding token:', e);
    return '';
  }
}

/**
 * 2. Decodes a Base64 invite token into full MessSyncPayload
 */
export function decodeTokenToMess(token: string): MessSyncPayload | null {
  try {
    let jsonStr = '';
    if (typeof window !== 'undefined') {
      jsonStr = decodeURIComponent(escape(atob(token)));
    } else {
      jsonStr = Buffer.from(token, 'base64').toString('utf-8');
    }
    const data = JSON.parse(jsonStr);
    if (data && data.mess && data.mess.name) {
      return data as MessSyncPayload;
    }
    return null;
  } catch (e) {
    return null;
  }
}

/**
 * 3. Publish Mess to Cloud Paste (dpaste.com) indexed by Mess Code
 */
export async function publishMessToCloud(payload: MessSyncPayload): Promise<string | null> {
  try {
    const jsonStr = JSON.stringify(payload);
    const code = payload.mess.code;

    // Try Supabase first (if configured)
    try {
      await supabase.from('messes').upsert({
        code: payload.mess.code,
        name: payload.mess.name,
      });
    } catch (e) {
      // ignore
    }

    // Publish to cloud sync relay
    const res = await fetch('https://dpaste.com/api/v2/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        content: jsonStr,
        syntax: 'json',
        expiry_days: '365',
        title: code,
      }),
    });

    if (res.ok) {
      const pasteUrl = await res.text();
      const rawUrl = `${pasteUrl.trim()}.txt`;
      // Store reference in localStorage for instant retrieval
      if (typeof window !== 'undefined') {
        localStorage.setItem(`mess_cloud_url_${code}`, rawUrl);
      }
      return rawUrl;
    }
    return null;
  } catch (e) {
    console.warn('Cloud publish fallback error:', e);
    return null;
  }
}

/**
 * 4. Fetch Mess from Cloud Paste (dpaste.com) or Supabase by Mess Code or URL
 */
export async function fetchMessFromCloud(codeOrToken: string): Promise<MessSyncPayload | null> {
  const cleanInput = codeOrToken.trim();

  // A. Check if user pasted a direct Base64 token or Invite Link with ?data=
  if (cleanInput.includes('?data=')) {
    const tokenPart = cleanInput.split('?data=')[1].split('&')[0];
    const decoded = decodeTokenToMess(tokenPart);
    if (decoded) return decoded;
  }

  const directDecoded = decodeTokenToMess(cleanInput);
  if (directDecoded) return directDecoded;

  // B. Check if code has a stored cloud URL
  const storedUrl = typeof window !== 'undefined' ? localStorage.getItem(`mess_cloud_url_${cleanInput.toUpperCase()}`) : null;
  if (storedUrl) {
    try {
      const res = await fetch(storedUrl);
      if (res.ok) {
        const payload: MessSyncPayload = await res.json();
        return payload;
      }
    } catch (e) {
      // ignore
    }
  }

  // C. Try Supabase query
  try {
    const { data: messRow } = await supabase
      .from('messes')
      .select('*')
      .ilike('code', cleanInput)
      .maybeSingle();

    if (messRow) {
      return {
        mess: {
          id: String(messRow.id),
          code: messRow.code,
          name: messRow.name,
          address: messRow.address || '',
          createdAt: messRow.created_at || new Date().toISOString(),
        },
        members: [],
        bazars: [],
        meals: [],
        rentPayments: [],
        exportedAt: new Date().toISOString(),
      };
    }
  } catch (e) {
    // ignore
  }

  return null;
}
