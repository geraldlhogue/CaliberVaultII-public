// Client-side encryption for sensitive data
import CryptoJS from 'crypto-js';

// Generate a unique encryption key per user (stored in localStorage)
export const generateUserKey = (): string => {
  const key = CryptoJS.lib.WordArray.random(256/8).toString();
  localStorage.setItem('user_encryption_key', key);
  return key;
};

export const getUserKey = (): string => {
  let key = localStorage.getItem('user_encryption_key');
  if (!key) {
    key = generateUserKey();
  }
  return key;
};

// Encrypt sensitive data before storing
export const encryptData = (data: any): string => {
  const key = getUserKey();
  const jsonString = JSON.stringify(data);
  return CryptoJS.AES.encrypt(jsonString, key).toString();
};

// Decrypt data when retrieving
export const decryptData = (encryptedData: string): any => {
  try {
    const key = getUserKey();
    const bytes = CryptoJS.AES.decrypt(encryptedData, key);
    const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
    return JSON.parse(decryptedString);
  } catch (error) {
    console.error('Decryption failed:', error);
    return null;
  }
};

// Encrypt specific sensitive fields
export const encryptSensitiveFields = (item: any): any => {
  const sensitiveFields = ['serialNumber', 'purchasePrice', 'notes', 'customFields'];
  const encrypted = { ...item };
  
  sensitiveFields.forEach(field => {
    if (encrypted[field]) {
      encrypted[field] = encryptData(encrypted[field]);
    }
  });
  
  return encrypted;
};

// Decrypt sensitive fields
export const decryptSensitiveFields = (item: any): any => {
  const sensitiveFields = ['serialNumber', 'purchasePrice', 'notes', 'customFields'];
  const decrypted = { ...item };
  
  sensitiveFields.forEach(field => {
    if (decrypted[field] && typeof decrypted[field] === 'string') {
      const decryptedValue = decryptData(decrypted[field]);
      if (decryptedValue !== null) {
        decrypted[field] = decryptedValue;
      }
    }
  });
  
  return decrypted;
};

// Hash sensitive data for searching without exposing it
export const hashForSearch = (value: string): string => {
  return CryptoJS.SHA256(value.toLowerCase()).toString();
};

// Secure session storage
export const secureSessionStorage = {
  setItem: (key: string, value: any) => {
    const encrypted = encryptData(value);
    sessionStorage.setItem(key, encrypted);
  },
  
  getItem: (key: string): any => {
    const encrypted = sessionStorage.getItem(key);
    if (!encrypted) return null;
    return decryptData(encrypted);
  },
  
  removeItem: (key: string) => {
    sessionStorage.removeItem(key);
  }
};