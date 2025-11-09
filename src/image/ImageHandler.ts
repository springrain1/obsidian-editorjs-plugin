import { App, TFile, Notice, normalizePath } from 'obsidian';
import { PluginSettings } from '../settings/SettingsManager';
import { PluginError, ErrorCode } from '../errors/PluginError';

/**
 * Result of image upload operation
 */
export interface ImageUploadResult {
  success: 0 | 1;
  file?: {
    url: string;
  };
  error?: string;
}

/**
 * Handles image upload and storage for Editor.js
 */
export class ImageHandler {
  private app: App;
  private settings: PluginSettings;

  constructor(app: App, settings: PluginSettings) {
    this.app = app;
    this.settings = settings;
  }

  /**
   * Upload image by file
   * Saves the file to the vault and returns the relative path
   */
  async uploadByFile(file: File): Promise<ImageUploadResult> {
    try {
      // Ensure image folder exists
      await this.ensureImageFolderExists();

      // Generate unique filename
      const fileName = this.generateFileName(file.name);
      const path = this.getImagePath(fileName);

      // Convert file to array buffer
      const arrayBuffer = await file.arrayBuffer();

      // Save to vault
      const createdFile = await this.app.vault.createBinary(path, arrayBuffer);

      // Get resource path for display
      const resourcePath = this.app.vault.getResourcePath(createdFile);

      // Return resource path for proper display in Obsidian
      return {
        success: 1,
        file: {
          url: resourcePath
        }
      };
    } catch (error) {
      console.error('Image upload failed:', error);
      new Notice('Failed to upload image');
      return {
        success: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Upload image by URL
   * Downloads the remote image and saves it to the vault
   */
  async uploadByUrl(url: string): Promise<ImageUploadResult> {
    try {
      // Ensure image folder exists
      await this.ensureImageFolderExists();

      // Download image
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to download image: ${response.statusText}`);
      }

      const arrayBuffer = await response.arrayBuffer();

      // Extract filename from URL or generate one
      const urlPath = new URL(url).pathname;
      const originalName = urlPath.split('/').pop() || 'image.jpg';
      const fileName = this.generateFileName(originalName);
      const path = this.getImagePath(fileName);

      // Save to vault
      const createdFile = await this.app.vault.createBinary(path, arrayBuffer);

      // Get resource path for display
      const resourcePath = this.app.vault.getResourcePath(createdFile);

      // Return resource path for proper display in Obsidian
      return {
        success: 1,
        file: {
          url: resourcePath
        }
      };
    } catch (error) {
      console.error('Image upload by URL failed:', error);
      new Notice('Failed to download and upload image');
      return {
        success: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Generate unique filename with timestamp
   */
  private generateFileName(originalName: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const ext = originalName.split('.').pop() || 'jpg';
    const baseName = originalName.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9]/g, '-');
    return `${baseName}-${timestamp}-${random}.${ext}`;
  }

  /**
   * Get full path for image in vault
   */
  private getImagePath(fileName: string): string {
    return normalizePath(`${this.settings.imageFolder}/${fileName}`);
  }

  /**
   * Ensure image folder exists, create if it doesn't
   */
  private async ensureImageFolderExists(): Promise<void> {
    const folder = this.settings.imageFolder;
    const normalizedPath = normalizePath(folder);
    
    const exists = await this.app.vault.adapter.exists(normalizedPath);
    if (!exists) {
      await this.app.vault.createFolder(normalizedPath);
    }
  }
}
