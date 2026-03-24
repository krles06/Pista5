import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { supabase } from './supabase'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Get the current authenticated user ID directly from Supabase session.
 * Use this inside mutationFn instead of reading coach from useAuth() context,
 * which can be null due to stale closures / timing issues.
 */
export async function getAuthenticatedUserId(): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user?.id) {
    throw new Error('Usuario no autenticado');
  }
  return session.user.id;
}

// Signed URL cache: path -> { url, expiresAt }
const signedUrlCache = new Map<string, { url: string; expiresAt: number }>();

/**
 * Returns a signed URL for a private storage file.
 * Caches results for 50 minutes (URLs expire in 1 hour).
 */
export async function getSignedStorageUrl(bucket: string, path: string): Promise<string> {
  if (!path) return '';
  // If it looks like a full URL (legacy data), return as-is
  if (path.startsWith('http')) return path;
  const cacheKey = `${bucket}:${path}`;
  const cached = signedUrlCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) return cached.url;

  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, 3600);
  if (error || !data?.signedUrl) return '';
  signedUrlCache.set(cacheKey, { url: data.signedUrl, expiresAt: Date.now() + 50 * 60 * 1000 });
  return data.signedUrl;
}
