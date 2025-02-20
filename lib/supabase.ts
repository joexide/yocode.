import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@/constants/Config';
import { Database } from '@/types/supabase'; 
import { Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';


const customFetch = async (url: string, options: RequestInit) => {
  const maxRetries = 7;
  const timeout = 30000;
  const backoffFactor = 1.5;
  const maxDelay = 20000;

  const isNetworkError = (error: any) => {
    return (
      error instanceof TypeError ||
      error.message?.includes('network') ||
      error.message?.includes('java.io.IOException') ||
      error.message?.includes('Failed to fetch') ||
      error.message?.includes('Network request failed') ||
      error.message?.includes('remote update') ||
      error.message?.includes('ECONNREFUSED') ||
      error.message?.includes('socket hang up')
    );
  };

  const isAuthError = (response: Response) => {
    return response.status === 401 || response.status === 403;
  };

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          ...options.headers,
          'X-Retry-Attempt': `${attempt}`,
          'X-Client-Platform': Platform.OS,
          'X-Request-ID': `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
        },
      });
      clearTimeout(timeoutId);

      
      if (isAuthError(response)) {
        throw new Error(`Authentication error: ${response.status}`);
      }

      if (response.status >= 500 || response.status === 429 || response.status === 408) {
        throw new Error(`Server error: ${response.status}`);
      }

      if (!response.ok) {
        const errorBody = await response.text().catch(() => null);
        throw new Error(`HTTP error: ${response.status}${errorBody ? ` - ${errorBody}` : ''}`);
      }

      return response;
    } catch (error: any) {
      clearTimeout(timeoutId);
      console.error(`Attempt ${attempt} failed:`, error);

     
      if (error.message?.includes('Authentication error')) {
        throw error;
      }

      const shouldRetry = (
        attempt < maxRetries &&
        (isNetworkError(error) || 
         error.name === 'AbortError' ||
         error.message?.includes('Service unavailable') ||
         error.message?.includes('timeout') ||
         error.message?.includes('remote update'))
      );

      if (!shouldRetry) {
        throw new Error(
          error instanceof Error
            ? `Request failed: ${error.message}`
            : 'Request failed with unknown error'
        );
      }

      const baseDelay = Math.min(
        1000 * Math.pow(backoffFactor, attempt),
        maxDelay
      );
      const jitter = Math.random() * Math.min(attempt * 1000, 5000);
      const delay = baseDelay + jitter;

      console.log(`Retrying in ${Math.round(delay / 1000)}s... (Attempt ${attempt}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw new Error('All retry attempts failed');
};


export const supabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
    global: {
      fetch: customFetch,
      headers: {
        'X-Client-Info': `inplanted-app/${Platform.OS}`,
        'X-Client-Version': '1.0.0',
      },
    },
    db: {
      schema: 'public',
    },
    realtime: {
      params: {
        eventsPerSecond: 1,
        heartbeat: 30,
      },
      reconnectAfterMs: (retries) => {
        return Math.min(1000 + Math.exp(retries) * 1000, 60000);
      },
    },
    storage: {
      retryAttempts: 3,
      retryDelay: 1000,
    },
  }
);


supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN') {
    console.log('Signed in:', session?.user.email);
  } else if (event === 'SIGNED_OUT') {
    console.log('Signed out');
  } else if (event === 'TOKEN_REFRESHED') {
    console.log('Token refreshed');
  }
});

export type Tables = Database['public']['Tables'];
export type Plant = Tables['plants']['Row'];
export type PlantTip = Tables['plant_tips']['Row'];
export type CommunityPost = Tables['community_posts']['Row'];
export type Profile = Tables['profiles']['Row'];

export const handleSupabaseError = async (error: any): Promise<string> => {
  console.error('Supabase error:', error);
  
 
  if (
    error?.status === 401 ||
    error?.status === 403 ||
    error?.message?.includes('Authentication error') ||
    error?.message?.includes('JWT expired') ||
    error?.message?.includes('Invalid token') ||
    error?.message?.includes('not authenticated')
  ) {
    try {
      const { data, error: refreshError } = await supabase.auth.refreshSession();
      if (data?.session) {
        return 'Please try your action again.';
      } else if (refreshError) {
        console.error('Session refresh failed:', refreshError);
        return 'Your session has expired. Please sign in again.';
      }
    } catch (refreshError) {
      console.error('Session refresh failed:', refreshError);
      return 'Your session has expired. Please sign in again.';
    }
  }
  
  if (
    error?.message?.includes('java.io.IOException') ||
    error?.message?.includes('net::ERR_INTERNET_DISCONNECTED') ||
    error?.message?.includes('Network request failed') ||
    error?.name === 'NetworkError' ||
    error?.message?.includes('remote update') ||
    error?.message?.includes('ECONNREFUSED') ||
    error?.message?.includes('socket hang up')
  ) {
    return 'Connection error. Please check your internet connection and try again.';
  }
  
  if (
    error?.message?.includes('timeout') ||
    error?.name === 'AbortError' ||
    error?.message?.includes('Request timed out') ||
    error?.message?.includes('ETIMEDOUT')
  ) {
    return 'Request timed out. Please try again.';
  }
  
  if (
    error?.code?.startsWith('PGRST') ||
    error?.message?.includes('database error')
  ) {
    return 'Database error. Please try again later.';
  }
  
  if (error?.message?.includes('Invalid login credentials')) {
    return 'Invalid email or password.';
  }
  
  if (error?.message?.includes('Email not confirmed')) {
    return 'Please confirm your email address before signing in.';
  }
  
  if (
    error?.message?.includes('storage') ||
    error?.message?.includes('upload failed')
  ) {
    return 'Failed to upload file. Please try again.';
  }
  
  if (
    error?.status === 429 ||
    error?.message?.includes('rate limit')
  ) {
    return 'Too many requests. Please try again in a few minutes.';
  }
  
  if (
    error?.status === 503 ||
    error?.status === 504 ||
    error?.message?.includes('Service unavailable') ||
    error?.message?.includes('Gateway Timeout') ||
    error?.message?.includes('maintenance')
  ) {
    return 'Service temporarily unavailable. Please try again later.';
  }
  
  const requestId = error?.requestId || error?.message?.match(/req_[a-zA-Z0-9]+/) || 'unknown';
  const timestamp = new Date().toISOString();
  console.error(`Error Details:
    Request ID: ${requestId}
    Timestamp: ${timestamp}
    Platform: ${Platform.OS}
    Error: ${error?.message || 'Unknown error'}
  `);
  
  return 'An unexpected error occurred. Please try again.';
};

export const testHelpers = {
  
};