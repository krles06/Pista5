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
