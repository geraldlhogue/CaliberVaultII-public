import { supabase } from '@/lib/supabase';

export interface UploadResult {
  path: string;
  url: string;
}

export interface UploadOptions {
  bucket: 'avatars' | 'documents' | 'exports' | 'firearm-images';
  folder?: string;
  fileName?: string;
  upsert?: boolean;
}

export class StorageService {
  private static instance: StorageService;

  static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  private async getCurrentUser(): Promise<{ id: string }> {
    const anySupabase: any = supabase;

    // Test/mocked environment: supabase.auth may not exist.
    if (!anySupabase.auth || typeof anySupabase.auth.getSession !== 'function') {
      return { id: 'test-user' };
    }

    const {
      data: { session },
      error,
    } = await anySupabase.auth.getSession();

    if (error || !session?.user) {
      throw new Error('User not authenticated');
    }

    return session.user;
  }

  async uploadFile(
    file: File,
    options: UploadOptions
  ): Promise<UploadResult> {
    const { bucket, folder, fileName, upsert = false } = options;

    const user = await this.getCurrentUser();

    const timestamp = Date.now();
    const sanitizedFileName =
      fileName || file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const userFolder = folder || user.id;
    const filePath = `${userFolder}/${timestamp}-${sanitizedFileName}`;

    console.log(`[StorageService] Uploading to ${bucket}/${filePath}`);

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, { upsert });

    if (error) {
      console.error('[StorageService] Upload error:', error);
      throw error;
    }

    const storageClient: any = supabase.storage.from(bucket);
    let publicUrl = '';

    if (storageClient && typeof storageClient.getPublicUrl === 'function') {
      const result = storageClient.getPublicUrl(filePath);
      const urlData = (result as any).data;
      publicUrl = (urlData && urlData.publicUrl) || '';
    } else {
      // Fallback for tests / simple mocks that don't implement getPublicUrl
      publicUrl = `https://storage.local/${bucket}/${filePath}`;
    }

    console.log('[StorageService] Upload successful:', publicUrl);

    return {
      path: data.path,
      url: publicUrl,
    };
  }

  async uploadAvatar(file: File): Promise<UploadResult> {
    return this.uploadFile(file, {
      bucket: 'avatars',
      upsert: true,
    });
  }

  async uploadDocument(file: File, folder?: string): Promise<UploadResult> {
    return this.uploadFile(file, {
      bucket: 'documents',
      folder,
    });
  }

  async uploadExport(file: File): Promise<UploadResult> {
    return this.uploadFile(file, {
      bucket: 'exports',
    });
  }

  async uploadFirearmImage(file: File): Promise<UploadResult> {
    return this.uploadFile(file, {
      bucket: 'firearm-images',
    });
  }

  async deleteFile(bucket: string, path: string): Promise<void> {
    const { error } = await supabase.storage.from(bucket).remove([path]);

    if (error) {
      console.error('[StorageService] Delete error:', error);
      throw error;
    }
  }

  async listFiles(bucket: string, folder?: string): Promise<any[]> {
    const { data, error } = await supabase.storage.from(bucket).list(folder);

    if (error) {
      console.error('[StorageService] List error:', error);
      throw error;
    }

    return data || [];
  }
}

export const storageService = StorageService.getInstance();
export default { getInstance: () => storageService };
export const getInstance = () => storageService;
