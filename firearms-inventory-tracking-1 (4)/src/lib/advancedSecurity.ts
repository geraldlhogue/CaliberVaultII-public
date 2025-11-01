// Advanced Security Features
import { supabase } from './supabase';

// Rate limiting
class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private limit: number;
  private window: number; // in milliseconds

  constructor(limit: number = 100, windowMs: number = 60000) {
    this.limit = limit;
    this.window = windowMs;
  }

  check(key: string): boolean {
    const now = Date.now();
    const requests = this.requests.get(key) || [];
    
    // Filter out old requests
    const recentRequests = requests.filter(time => now - time < this.window);
    
    if (recentRequests.length >= this.limit) {
      return false; // Rate limit exceeded
    }
    
    recentRequests.push(now);
    this.requests.set(key, recentRequests);
    return true;
  }

  reset(key: string) {
    this.requests.delete(key);
  }
}

export const rateLimiter = new RateLimiter(100, 60000); // 100 requests per minute

// Input sanitization
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
}

// SQL injection prevention (for raw queries)
export function escapeSQL(value: string): string {
  return value.replace(/'/g, "''");
}

// XSS prevention
export function escapeHTML(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Audit logging
export async function logAuditEvent(
  action: string,
  details: Record<string, any>,
  userId?: string
) {
  try {
    await supabase.from('audit_logs').insert({
      user_id: userId,
      action,
      details,
      ip_address: null, // Would need server-side to get real IP
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Failed to log audit event:', error);
  }
}

// Session management
export class SessionManager {
  private static SESSION_KEY = 'app_session';
  private static TIMEOUT = 30 * 60 * 1000; // 30 minutes

  static updateActivity() {
    localStorage.setItem(this.SESSION_KEY, Date.now().toString());
  }

  static checkSession(): boolean {
    const lastActivity = localStorage.getItem(this.SESSION_KEY);
    if (!lastActivity) return false;
    
    const elapsed = Date.now() - parseInt(lastActivity);
    return elapsed < this.TIMEOUT;
  }

  static clearSession() {
    localStorage.removeItem(this.SESSION_KEY);
  }
}

// CSRF token generation
export function generateCSRFToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}
