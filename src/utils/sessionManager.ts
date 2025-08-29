// Session management utilities for long-term authentication
const SESSION_STORAGE_KEY = 'supabase-long-term-session';
const DEVICE_PREFERENCE_KEY = 'remember-device-preference';

export interface ExtendedSessionConfig {
  rememberDevice: boolean;
  sessionDuration?: number; // in seconds
}

export const sessionManager = {
  // Set device preference for long-term sessions
  setDevicePreference(remember: boolean) {
    localStorage.setItem(DEVICE_PREFERENCE_KEY, remember.toString());
  },

  // Get device preference
  getDevicePreference(): boolean {
    return localStorage.getItem(DEVICE_PREFERENCE_KEY) === 'true';
  },

  // Clear device preference
  clearDevicePreference() {
    localStorage.removeItem(DEVICE_PREFERENCE_KEY);
  },

  // Store session metadata
  setSessionMetadata(metadata: any) {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({
      ...metadata,
      timestamp: Date.now()
    }));
  },

  // Get session metadata
  getSessionMetadata() {
    try {
      const stored = localStorage.getItem(SESSION_STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  },

  // Clear session metadata
  clearSessionMetadata() {
    localStorage.removeItem(SESSION_STORAGE_KEY);
  },

  // Check if session should be extended based on device preference
  shouldExtendSession(): boolean {
    return this.getDevicePreference();
  },

  // Get session configuration for Supabase client
  getSessionConfig(rememberDevice: boolean): ExtendedSessionConfig {
    return {
      rememberDevice,
      sessionDuration: rememberDevice ? 31536000 : 3600 // 1 year vs 1 hour
    };
  },

  // Clear all stored session data
  clearAll() {
    this.clearDevicePreference();
    this.clearSessionMetadata();
  }
};