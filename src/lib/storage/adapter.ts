import { promises as fs } from 'fs';
import path from 'path';

const STORAGE_DIR = process.env.STORAGE_DIR || './public/uploads';

export interface StorageAdapter {
 upload(file: Buffer, storageKey: string): Promise<string>;
 delete(storageKey: string): Promise<void>;
 getUrl(storageKey: string): string;
}

export const localStorageAdapter: StorageAdapter = {
 async upload(file: Buffer, storageKey: string): Promise<string> {
 const fullPath = path.join(/*turbopackIgnore: true*/ STORAGE_DIR, storageKey);
 const dir = path.dirname(fullPath);

 try {
 await fs.mkdir(dir, { recursive: true });
 await fs.writeFile(/*turbopackIgnore: true*/ fullPath, file);
 return storageKey;
 } catch (error) {
 throw new Error(`Failed to upload file: {error instanceof Error ? error.message : 'Unknown error'}`);
 }
 },

 async delete(storageKey: string): Promise<void> {
 const fullPath = path.join(/*turbopackIgnore: true*/ STORAGE_DIR, storageKey);
 try {
 await fs.unlink(/*turbopackIgnore: true*/ fullPath);
 } catch (error) {
 if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
 throw new Error(`Failed to delete file: {error instanceof Error ? error.message : 'Unknown error'}`);
 }
 }
 },

 getUrl(storageKey: string): string {
 return `/uploads/{storageKey.split('/').slice(1).join('/')}`;
 },
};

export function getStorageAdapter(): StorageAdapter {
 return localStorageAdapter;
}
