// WebAuthn / Biometric Authentication Support
// Supports FaceID, TouchID, and other platform authenticators

import { supabase } from './supabase';

export interface BiometricAuthResult {
  success: boolean;
  credential?: any;
  error?: string;
  userId?: string;
}

export interface BiometricCredential {
  credentialId: string;
  publicKey: string;
  userId: string;
  createdAt: string;
}

// Check if biometric authentication is available
export async function isBiometricAvailable(): Promise<boolean> {
  if (!window.PublicKeyCredential) {
    return false;
  }
  
  try {
    const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    return available;
  } catch (error) {
    console.error('Error checking biometric availability:', error);
    return false;
  }
}

// Check if user has biometric enabled
export async function isBiometricEnabled(userId: string): Promise<boolean> {
  try {
    const { data } = await supabase
      .from('user_profiles')
      .select('biometric_enabled')
      .eq('id', userId)
      .single();
    
    return data?.biometric_enabled || false;
  } catch (error) {
    console.error('Error checking biometric status:', error);
    return false;
  }
}

// Toggle biometric authentication
export async function toggleBiometric(userId: string, enabled: boolean): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('user_profiles')
      .update({ biometric_enabled: enabled })
      .eq('id', userId);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error toggling biometric:', error);
    return false;
  }
}

// Helper functions for base64url encoding/decoding
function arrayBufferToBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function base64UrlToArrayBuffer(base64url: string): ArrayBuffer {
  const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

// Register biometric credential
export async function registerBiometric(
  userId: string,
  email: string
): Promise<BiometricAuthResult> {
  try {
    const challenge = new Uint8Array(32);
    crypto.getRandomValues(challenge);
    
    const publicKeyOptions: PublicKeyCredentialCreationOptions = {
      challenge,
      rp: {
        name: 'CaliberVault',
        id: window.location.hostname === 'localhost' ? 'localhost' : window.location.hostname,
      },
      user: {
        id: new TextEncoder().encode(userId),
        name: email,
        displayName: email.split('@')[0],
      },
      pubKeyCredParams: [
        { alg: -7, type: 'public-key' },  // ES256
        { alg: -257, type: 'public-key' }, // RS256
      ],
      authenticatorSelection: {
        authenticatorAttachment: 'platform',
        requireResidentKey: false,
        userVerification: 'required',
      },
      timeout: 60000,
      attestation: 'none',
    };

    const credential = await navigator.credentials.create({
      publicKey: publicKeyOptions,
    }) as PublicKeyCredential;

    if (!credential) {
      return { success: false, error: 'No credential created' };
    }

    // Store credential info in localStorage for this device
    const credentialInfo = {
      credentialId: arrayBufferToBase64Url(credential.rawId),
      userId,
      email,
      createdAt: new Date().toISOString(),
    };
    
    localStorage.setItem('biometric_credential', JSON.stringify(credentialInfo));
    
    // Enable biometric in user profile
    await toggleBiometric(userId, true);

    return { success: true, credential };
  } catch (error: any) {
    console.error('Biometric registration error:', error);
    return { success: false, error: error.message || 'Registration failed' };
  }
}

// Authenticate with biometric
export async function authenticateWithBiometric(): Promise<BiometricAuthResult> {
  try {
    // Check if credential exists
    const storedCredential = localStorage.getItem('biometric_credential');
    if (!storedCredential) {
      return { success: false, error: 'No biometric credential found. Please register first.' };
    }

    const credentialInfo = JSON.parse(storedCredential);
    const challenge = new Uint8Array(32);
    crypto.getRandomValues(challenge);
    
    const publicKeyOptions: PublicKeyCredentialRequestOptions = {
      challenge,
      timeout: 60000,
      userVerification: 'required',
      rpId: window.location.hostname === 'localhost' ? 'localhost' : window.location.hostname,
      allowCredentials: [{
        id: base64UrlToArrayBuffer(credentialInfo.credentialId),
        type: 'public-key',
        transports: ['internal'],
      }],
    };

    const credential = await navigator.credentials.get({
      publicKey: publicKeyOptions,
    }) as PublicKeyCredential;

    if (!credential) {
      return { success: false, error: 'Biometric authentication failed' };
    }

    // Return success with user info
    return { 
      success: true, 
      credential,
      userId: credentialInfo.userId 
    };
  } catch (error: any) {
    console.error('Biometric authentication error:', error);
    
    // Provide user-friendly error messages
    if (error.name === 'NotAllowedError') {
      return { success: false, error: 'Biometric authentication was cancelled or not available' };
    }
    if (error.name === 'InvalidStateError') {
      return { success: false, error: 'Please register biometric authentication first' };
    }
    
    return { success: false, error: error.message || 'Authentication failed' };
  }
}

// Remove biometric credential
export async function removeBiometric(userId: string): Promise<boolean> {
  try {
    localStorage.removeItem('biometric_credential');
    await toggleBiometric(userId, false);
    return true;
  } catch (error) {
    console.error('Error removing biometric:', error);
    return false;
  }
}