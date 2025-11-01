// Enhanced Biometric Authentication Service
export interface BiometricResult {
  success: boolean;
  error?: string;
  biometryType?: string;
}

class BiometricAuthService {
  private isCapacitorAvailable() {
    return typeof window !== 'undefined' && !!(window as any).Capacitor?.isNativePlatform?.();
  }

  async isAvailable(): Promise<boolean> {
    if (!this.isCapacitorAvailable()) return false;
    
    try {
      const { NativeBiometric } = await import('capacitor-native-biometric');
      const result = await NativeBiometric.isAvailable();
      return result.isAvailable;
    } catch {
      return false;
    }
  }

  async getBiometryType(): Promise<string> {
    try {
      const { NativeBiometric } = await import('capacitor-native-biometric');
      const result = await NativeBiometric.isAvailable();
      return result.biometryType || 'none';
    } catch {
      return 'none';
    }
  }

  async authenticate(reason: string = 'Authenticate to access CaliberVault'): Promise<BiometricResult> {
    try {
      const available = await this.isAvailable();
      if (!available) {
        return { success: false, error: 'Biometric authentication not available' };
      }

      const { NativeBiometric } = await import('capacitor-native-biometric');
      await NativeBiometric.verifyIdentity({
        reason,
        title: 'CaliberVault',
        subtitle: 'Biometric Authentication',
        description: reason,
      });

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Authentication failed' };
    }
  }

  async setCredentials(username: string, password: string) {
    try {
      const { NativeBiometric } = await import('capacitor-native-biometric');
      await NativeBiometric.setCredentials({
        username,
        password,
        server: 'calibervault.app',
      });
      return true;
    } catch {
      return false;
    }
  }

  async getCredentials() {
    try {
      const { NativeBiometric } = await import('capacitor-native-biometric');
      return await NativeBiometric.getCredentials({ server: 'calibervault.app' });
    } catch {
      return null;
    }
  }

  async deleteCredentials() {
    try {
      const { NativeBiometric } = await import('capacitor-native-biometric');
      await NativeBiometric.deleteCredentials({ server: 'calibervault.app' });
      return true;
    } catch {
      return false;
    }
  }
}

export const biometricAuthService = new BiometricAuthService();
