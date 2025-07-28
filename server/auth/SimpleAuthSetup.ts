/**
 * Simplified Authentication Setup
 * Temporary solution to bypass enterprise auth complexity and get the app working
 */

import passport from "passport";
import session from "express-session";
import { Express } from "express";
import { setupAuth, isAuthenticated } from "../replitAuth";

/**
 * Simple authentication setup without enterprise complexity
 */
export async function setupSimpleAuth(app: Express): Promise<void> {
  try {
    console.log('[SIMPLE-AUTH] Setting up basic authentication...');
    
    // Use the existing setupAuth function from replitAuth
    await setupAuth(app);
    
    console.log('[SIMPLE-AUTH] Simple authentication setup completed successfully');
  } catch (error) {
    console.error('[SIMPLE-AUTH] Authentication setup failed:', error);
    throw error;
  }
}

/**
 * Simple authentication middleware
 */
export const isSimpleAuthenticated = isAuthenticated;